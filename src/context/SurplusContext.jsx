/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useReducer, useCallback } from "react";
import { 
  getAvailableProducts, 
  getProductsByOwner, 
  createProduct, 
  deleteProduct as apiDeleteProduct,
  updateProduct as apiUpdateProduct,
  getNearbyProducts 
} from "../services/productService";
import {
  createClaim,
  getClaimsByOwner,
  approveClaim,
  rejectClaim,
  getClaimsByClaimant,
  patchClaim,
  withdrawClaimRequest,
} from "../services/claimService";
import { useAuth } from "../hooks/useAuth";
import { CATEGORY_SLUG_TO_ID, CATEGORY_DB_NAME_TO_SLUG } from "../data/categories";
import { mapProductUnitForApi, mapProductUnitFromApi, coerceId } from "../utils/surplusApi";
import { formatOrganizationAddressLine } from "../utils/organizationAddress";

function mapOwnerLocation(owner) {
  if (!owner || typeof owner !== "object") {
    return {
      marketCity: null,
      marketDistrict: null,
      marketFullAddress: null,
      marketLatitude: null,
      marketLongitude: null,
    };
  }
  const addr = owner.address && typeof owner.address === "object" ? owner.address : null;
  return {
    marketCity: owner.city ?? addr?.city ?? null,
    marketDistrict: owner.district ?? addr?.district ?? null,
    marketFullAddress: owner.fullAddress ?? addr?.fullAddress ?? addr?.full_address ?? null,
    marketLatitude: owner.latitude ?? addr?.latitude ?? null,
    marketLongitude: owner.longitude ?? addr?.longitude ?? null,
  };
}

const SurplusContext = createContext(null);

function requireNumericUserId(user) {
  const id = Number(user?.id);
  if (!Number.isFinite(id)) {
    throw new Error("Missing account id. Please log out and log in again.");
  }
  return id;
}

// 🛡️ 1. GigaChad Tarih Zırhı
const fixBackendDate = (rawDate) => {
  if (!rawDate) return new Date().toISOString();
  if (Array.isArray(rawDate)) {
    const pad = (n) => String(n).padStart(2, '0');
    const [y, m, d, h=0, min=0, s=0] = rawDate;
    return `${y}-${pad(m)}-${pad(d)}T${pad(h)}:${pad(min)}:${pad(s)}`;
  }
  return String(rawDate);
};

// 🛡️ 2. Hata Vermeyen (Crash-Proof) Claim Mapleyici
function mapApiClaimToRow(c, user, allProducts = []) {
  const role = String(user?.role || "").toUpperCase();
  const requestedQty = c.requestedQuantity ?? c.requested_quantity;
  const fromProd = c.product != null && typeof c.product === "object" ? c.product.id : typeof c.product === "number" ? c.product : undefined;
  const productId = coerceId(fromProd ?? c.productId ?? c.product_id);
  const claimId = coerceId(c.id);
  const status = String(c.status ?? "PENDING").toUpperCase();

  // Market İsmi Dedektifi
  let foundMarketName = "Market";
  if (role === "MARKET") {
    foundMarketName = user.organizationName || "Marketim";
  } else {
    if (c.product?.owner?.organizationName) {
      foundMarketName = c.product.owner.organizationName;
    } else {
      const matchedProd = (allProducts || []).find(p => String(p.id) === String(productId));
      if (matchedProd && matchedProd.marketName) {
        foundMarketName = matchedProd.marketName;
      }
    }
  }

  return {
    id: claimId ?? 0,
    productId: productId == null ? null : productId,
    productName: (c.product != null && typeof c.product === "object" && c.product.name) || "Unknown Product",
    marketName: foundMarketName,
    ngoName: c.claimant?.organizationName || c.claimant?.email || "Unknown NGO",
    ngoAddressLine: formatOrganizationAddressLine(c.claimant) || "",
    claimantId: coerceId(c.claimant?.id ?? c.claimantId ?? c.claimant_id),
    claimantKey: c.claimant?.email || (role === "NGO" ? user?.email : null) || "unknown",
    requestedQuantity: requestedQty != null ? Number(requestedQty) : 1,
    status,
    createdAt: fixBackendDate(c.createdAt || c.claimDate),
    expiryDate: fixBackendDate(c.product?.expiryDate ?? c.product?.expiry_date),
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
        liveClaims = await getClaimsByOwner(ownerPathId).catch(() => []);
      } else {
        // 🛡️ NGO Kullanıcısının Lokasyonunu Çekiyoruz (Şehir/İlçe Filtresi İçin)
        const userCity = user?.city || user?.address?.city;
        const userDistrict = user?.district || user?.address?.district;

        try {
          // 1. Plan: Eğer kullanıcının şehri belliyse, Muhammet'in yeni "nearby" kapısını çal!
          if (userCity) {
            let nearbyApiProducts = await getNearbyProducts(userCity, userDistrict || "");
            liveProducts = nearbyApiProducts.filter(p => String(p.status || "").toUpperCase() === "AVAILABLE");
          } else {
            // Şehri yoksa mecburen hepsini çek
            let allProducts = await getAvailableProducts();
            liveProducts = allProducts.filter(p => String(p.status || "").toUpperCase() === "AVAILABLE");
          }
        } catch (error) {
          // 2. Plan (GigaChad Fallback): Backend patlarsa, sistemi çökertme. Hepsini çek, frontend'de kendin filtrele!
          console.warn("⚠️ Backend nearby uç noktası patladı, Frontend manuel filtresi devrede!");
          let allProducts = await getAvailableProducts();
          let availableOnly = allProducts.filter(p => String(p.status || "").toUpperCase() === "AVAILABLE");
          
          liveProducts = userCity 
            ? availableOnly.filter(p => {
                const pCity = p.owner?.city || p.owner?.address?.city;
                return pCity && String(pCity).toLowerCase() === String(userCity).toLowerCase();
              })
            : availableOnly;
        }
        
        liveClaims = await getClaimsByClaimant(ownerPathId).catch(() => []);
      }

      let mappedProducts = liveProducts.map((p) => {
        const rawMax = p.maxClaimQuantity ?? p.max_claim_quantity;
        const maxClaimQuantity = rawMax != null && String(rawMax).trim() !== "" && Number.isFinite(Number(rawMax)) ? Number(rawMax) : null;
        return {
          id: coerceId(p.id) ?? p.id,
          ownerId: coerceId(p.owner?.id) ?? p.owner?.id,
          name: p.name,
          categorySlug: CATEGORY_DB_NAME_TO_SLUG[p.category?.name] || p.category?.name?.toLowerCase()?.replace(/\s+/g, "_") || "bakery",
          categoryName: p.category?.name || "General",
          quantity: p.quantity || 1,
          quantityUnit: mapProductUnitFromApi(p.unit),
          expiryDate: fixBackendDate(p.expiryDate ?? p.expiry_date),
          marketName: p.owner?.organizationName || user.organizationName || "Marketim",
          ownerKey: p.owner?.email || user.email,
          status: p.status || "AVAILABLE",
          createdAt: fixBackendDate(p.createdAt ?? p.created_at),
          maxClaimQuantity,
          ...mapOwnerLocation(p.owner),
        };
      });

      if (role === "MARKET") {
        mappedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else {
        mappedProducts.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
      }

      const mappedClaims = liveClaims
        .map((c) => mapApiClaimToRow(c, user, mappedProducts))
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

      let formattedDate = productData.expiryDate; 
      if (formattedDate) {
        if (formattedDate.includes('Z')) formattedDate = formattedDate.split('.')[0].replace('Z', '');
        
        if (!formattedDate.includes('T')) {
          formattedDate += "T00:00:00";
        } else if (formattedDate.split(':').length === 2) {
          formattedDate += ":00";
        }
      }

      const reqDto = {
        name: productData.name,
        categoryId: CATEGORY_SLUG_TO_ID[productData.categorySlug] ?? 1,
        quantity: Number(productData.quantity),
        expiryDate: formattedDate,
        marketId: ownerId, 
        unit: mapProductUnitForApi(productData.quantityUnit),
      };

      const mc = productData.maxClaimQuantity;
      if (mc !== "" && mc != null && Number.isFinite(Number(mc)) && Number(mc) > 0) {
        reqDto.maxClaimQuantity = Number(mc);
      }

      console.log("🚀 Backend'e Uçan Paket (Add):", reqDto);
      await createProduct(reqDto);
      await fetchAllData();
    },

    updateProduct: async (productId, patchData) => {
      const body = { ownerId: requireNumericUserId(user) };
      if (patchData.name != null) body.name = patchData.name;
      if (patchData.quantity != null) body.quantity = Number(patchData.quantity);

      let formattedDate = patchData.expiryDate; // 👈 HATA BURADAYDI, DÜZELTİLDİ
      if (formattedDate) {
        if (formattedDate.includes('Z')) formattedDate = formattedDate.split('.')[0].replace('Z', '');
        
        if (!formattedDate.includes('T')) {
          formattedDate += "T00:00:00";
        } else if (formattedDate.split(':').length === 2) {
          formattedDate += ":00";
        }
        body.expiryDate = formattedDate; // 👈 VE BURADA EKLENMİYORDU, DÜZELTİLDİ
      }

      if (patchData.categorySlug != null) {
        const cid = CATEGORY_SLUG_TO_ID[patchData.categorySlug];
        if (cid != null) body.categoryId = cid;
      }
      if (patchData.quantityUnit) body.unit = mapProductUnitForApi(patchData.quantityUnit);
      
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