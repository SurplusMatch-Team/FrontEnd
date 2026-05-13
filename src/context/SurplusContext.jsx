/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useReducer, useCallback } from "react";
import { 
  getAvailableProducts, 
  getProductsByOwner, 
  createProduct, 
  deleteProduct as apiDeleteProduct,
  updateProduct as apiUpdateProduct 
} from "../services/productService";
import {
  createClaim,
  getClaimsByProduct,
  approveClaim,
  rejectClaim,
  getClaimsByClaimant,
  patchClaim,
  withdrawClaimRequest,
} from "../services/claimService";
import { useAuth } from "../hooks/useAuth";
import { CATEGORY_SLUG_TO_ID, CATEGORY_DB_NAME_TO_SLUG } from "../data/categories";
import { mapProductUnitForApi, mapProductUnitFromApi, coerceId } from "../utils/surplusApi";

const SurplusContext = createContext(null);

function requireNumericUserId(user) {
  const id = Number(user?.id);
  if (!Number.isFinite(id)) {
    throw new Error("Missing account id. Please log out and log in again.");
  }
  return id;
}

/** Map API claim (nested product/claimant) to dashboard row shape. */
function mapApiClaimToRow(c, user) {
  const role = String(user?.role || "").toUpperCase();
  const requestedQty = c.requestedQuantity ?? c.requested_quantity;
  const fromProd =
    c.product != null && typeof c.product === "object"
      ? c.product.id
      : typeof c.product === "number"
        ? c.product
        : undefined;
  const productId = coerceId(fromProd ?? c.productId ?? c.product_id);
  const claimId = coerceId(c.id);
  const status = String(c.status ?? "PENDING").toUpperCase();

  return {
    id: claimId ?? 0,
    productId: productId == null ? null : productId,
    productName: (c.product != null && typeof c.product === "object" && c.product.name) || "Unknown Product",
    marketName:
      role === "MARKET"
        ? user.organizationName
        : c.product?.owner?.organizationName || "Market",
    ngoName: c.claimant?.organizationName || c.claimant?.email || "Unknown NGO",
    claimantId: coerceId(c.claimant?.id ?? c.claimantId ?? c.claimant_id),
    claimantKey:
      c.claimant?.email ||
      (role === "NGO" ? user?.email : null) ||
      "unknown",
    requestedQuantity: requestedQty != null ? Number(requestedQty) : 1,
    status,
    createdAt: c.createdAt || c.claimDate || new Date().toISOString(),
    expiryDate: c.product?.expiryDate ?? c.product?.expiry_date,
  };
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_DATA":
      return { ...state, products: action.products, claims: action.claims };
    case "MERGE_CLAIM": {
      const id = Number(action.claim.id);
      const filtered = state.claims.filter((cl) => Number(cl.id) !== id);
      const nextClaims = [action.claim, ...filtered].sort((a, b) => Number(b.id) - Number(a.id));
      return { ...state, claims: nextClaims };
    }
    case "LOADING":
      return { ...state, status: "loading" };
    case "READY":
      return { ...state, status: "ready" };
    case "ERROR":
      return { ...state, status: "error" };
    default:
      return state;
  }
}

export function SurplusProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, { products: [], claims: [], status: "loading" });
  const { user } = useAuth();

  const fetchAllData = useCallback(async () => {
    if (!user) return;
    dispatch({ type: "LOADING" });
    
    try {
      let liveProducts = [];
      let liveClaims = [];

      const uid = Number(user.id);
      const ownerPathId = Number.isFinite(uid) ? uid : user.id;
      const role = String(user?.role || "").toUpperCase();

      if (role === "MARKET") {
        liveProducts = await getProductsByOwner(ownerPathId);
        if (liveProducts.length > 0) {
          const claimsPromises = liveProducts.map(p => getClaimsByProduct(p.id).catch(() => []));
          const claimsArrays = await Promise.all(claimsPromises);
          liveClaims = claimsArrays.flat();
        }
      } else {
        let allProducts = await getAvailableProducts();
        liveProducts = allProducts.filter(
          (p) => String(p.status || "").toUpperCase() === "AVAILABLE",
        );
        liveClaims = await getClaimsByClaimant(ownerPathId).catch(() => []);
      }

      let mappedProducts = liveProducts.map((p) => ({
        id: coerceId(p.id) ?? p.id,
        ownerId: coerceId(p.owner?.id) ?? p.owner?.id,
        name: p.name,
        categorySlug:
          CATEGORY_DB_NAME_TO_SLUG[p.category?.name] ||
          p.category?.name?.toLowerCase()?.replace(/\s+/g, "_") ||
          "bakery",
        categoryName: p.category?.name || "General",
        quantity: p.quantity || 1,
        quantityUnit: mapProductUnitFromApi(p.unit),
        expiryDate: p.expiryDate || new Date().toISOString(),
        marketName: p.owner?.organizationName || user.organizationName || "Marketim",
        ownerKey: p.owner?.email || user.email, 
        status: p.status || "AVAILABLE",
        createdAt: p.createdAt || new Date().toISOString()
      }));

      if (role === "MARKET") {
        mappedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else {
        mappedProducts.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
      }

      const mappedClaims = liveClaims
        .map((c) => mapApiClaimToRow(c, user))
        .sort((a, b) => Number(b.id) - Number(a.id));

      dispatch({ type: "SET_DATA", products: mappedProducts, claims: mappedClaims });
      dispatch({ type: "READY" });
    } catch (error) {
      console.error("Fetch Error:", error);
      dispatch({ type: "ERROR" });
    }
  }, [user]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  const actions = useMemo(() => ({
    addProduct: async (productData) => {
        const ownerId = requireNumericUserId(user);

        // 🛡️ GigaChad Tarih Formatlayıcı (Gümrükten net geçer)
        let formattedDate = productData.expiryDate;
        if (formattedDate) {
          if (formattedDate.includes('Z')) formattedDate = formattedDate.split('.')[0].replace('Z', '');
          if (!formattedDate.includes('T')) formattedDate += "T00:00:00";
        }

        const reqDto = {
          name: productData.name,
          categoryId: CATEGORY_SLUG_TO_ID[productData.categorySlug] ?? 1,
          quantity: Number(productData.quantity),
          expiryDate: formattedDate,
          ownerId,
          unit: mapProductUnitForApi(productData.quantityUnit),
        };

        // 🛡️ SPRINT HEDEFİ 1: Talep Limiti (Max Claim Quantity)
        if (productData.maxClaimQuantity) {
          reqDto.maxClaimQuantity = Number(productData.maxClaimQuantity);
        }

        console.log("🚀 Backend'e Uçan Paket (Add):", reqDto);
        await createProduct(reqDto);
        await fetchAllData();
      },

      updateProduct: async (productId, patchData) => {
        const body = { ownerId: requireNumericUserId(user) };
        if (patchData.name != null) body.name = patchData.name;
        if (patchData.quantity != null) body.quantity = Number(patchData.quantity);
        
        // 🛡️ Update ederken de tarih bozulmasın diye aynı zırhı giydiriyoruz
        if (patchData.expiryDate != null) {
          let fDate = patchData.expiryDate;
          if (fDate.includes('Z')) fDate = fDate.split('.')[0].replace('Z', '');
          if (!fDate.includes('T')) fDate += "T00:00:00";
          body.expiryDate = fDate;
        }

        if (patchData.categorySlug != null) {
          const cid = CATEGORY_SLUG_TO_ID[patchData.categorySlug];
          if (cid != null) body.categoryId = cid;
        }
        if (patchData.quantityUnit) body.unit = mapProductUnitForApi(patchData.quantityUnit);
        
        // 🛡️ SPRINT HEDEFİ 1: Edit yaparken limiti değiştirebilme
        if (patchData.maxClaimQuantity != null) {
          body.maxClaimQuantity = Number(patchData.maxClaimQuantity);
        }

        console.log("🛠️ Backend'e Uçan Paket (Edit):", body);
        await apiUpdateProduct(Number(productId), body);
        await fetchAllData();
      },

      deleteProduct: async (productId) => {
        await apiDeleteProduct(Number(productId), { ownerId: requireNumericUserId(user) });
        await fetchAllData();
      },

      addClaim: async (claimData, productId) => {
        const claimantId = requireNumericUserId(user);
        await createClaim({
          productId: Number(productId),
          claimantId,
          requestedQuantity: Number(claimData.requestedQuantity) || 1,
        });
        await fetchAllData();
      },

      updateClaim: async (claimId, requestedQuantity) => {
        const cid = Number(claimId);
        const uid = requireNumericUserId(user);
        if (!Number.isFinite(cid)) {
          throw new Error("Missing claim id. Log out and log in again.");
        }
        const qty = parseInt(String(requestedQuantity), 10);
        if (!Number.isFinite(qty) || qty < 1) {
          throw new Error("Invalid requested quantity.");
        }
        await patchClaim(cid, { claimantId: uid, requestedQuantity: qty });
        await fetchAllData();
      },

      withdrawClaim: async (claimId) => {
        await withdrawClaimRequest(Number(claimId), requireNumericUserId(user));
        await fetchAllData();
      },

      resolveClaim: async (claimId, resolution) => {
        if (resolution === "APPROVED") await approveClaim(claimId);
        else await rejectClaim(claimId);
        await fetchAllData();
      },
  }), [user, fetchAllData]);

  const contextValue = useMemo(() => ({
    catalogStatus: state.status,
    products: state.products,
    claims: state.claims,
    ...actions,
    refresh: fetchAllData 
  }), [state, actions, fetchAllData]);

  return <SurplusContext.Provider value={contextValue}>{children}</SurplusContext.Provider>;
}

export const useSurplus = () => {
  const ctx = useContext(SurplusContext);
  if (!ctx) throw new Error("useSurplus must be used within SurplusProvider");
  return ctx;
};