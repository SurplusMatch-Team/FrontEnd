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
import { mapProductUnitForApi } from "../utils/surplusApi";

const SurplusContext = createContext(null);

function reducer(state, action) {
  switch (action.type) {
    case "SET_DATA": 
      return { ...state, products: action.products, claims: action.claims };
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

      if (user.role === "MARKET") {
        liveProducts = await getProductsByOwner(user.id);
        if (liveProducts.length > 0) {
          const claimsPromises = liveProducts.map(p => getClaimsByProduct(p.id).catch(() => []));
          const claimsArrays = await Promise.all(claimsPromises);
          liveClaims = claimsArrays.flat();
        }
      } else {
        let allProducts = await getAvailableProducts();
        liveProducts = allProducts.filter(p => p.status === "AVAILABLE"); 
        liveClaims = await getClaimsByClaimant(user.id).catch(() => []);
      }

      let mappedProducts = liveProducts.map((p) => ({
        id: p.id,
        name: p.name,
        categorySlug:
          CATEGORY_DB_NAME_TO_SLUG[p.category?.name] ||
          p.category?.name?.toLowerCase()?.replace(/\s+/g, "_") ||
          "bakery",
        categoryName: p.category?.name || "General",
        quantity: p.quantity || 1,
        quantityUnit: "kg",
        expiryDate: p.expiryDate || new Date().toISOString(),
        marketName: p.owner?.organizationName || user.organizationName || "Marketim",
        ownerKey: p.owner?.email || user.email, 
        status: p.status || "AVAILABLE",
        createdAt: p.createdAt || new Date().toISOString()
      }));

      if (user.role === "MARKET") {
        mappedProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else {
        mappedProducts.sort((a, b) => new Date(a.expiryDate) - new Date(b.expiryDate));
      }

      const mappedClaims = liveClaims.map(c => ({
        id: c.id,
        productId: c.product?.id,
        productName: c.product?.name || "Unknown Product",
        marketName: user.role === "MARKET" ? user.organizationName : (c.product?.owner?.organizationName || "Market"),
        ngoName: c.claimant?.organizationName || c.claimant?.email || "Unknown NGO",
        claimantKey: c.claimant?.email || (user.role === "NGO" ? user.email : "unknown"),
        requestedQuantity: c.requestedQuantity || 1,
        status: c.status || "PENDING",
        createdAt: c.createdAt || new Date().toISOString(),
        expiryDate: c.product?.expiryDate 
      })).sort((a, b) => b.id - a.id); 

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
        const reqDto = {
          name: productData.name,
          categoryId: CATEGORY_SLUG_TO_ID[productData.categorySlug] ?? 1,
          quantity: Number(productData.quantity),
          expiryDate: productData.expiryDate,
          ownerId: user.id,
          unit: mapProductUnitForApi(productData.quantityUnit),
        };
        await createProduct(reqDto);
        await fetchAllData();
      },

      updateProduct: async (productId, patchData) => {
        const body = { ownerId: user.id };
        if (patchData.name != null) body.name = patchData.name;
        if (patchData.quantity != null) body.quantity = patchData.quantity;
        if (patchData.expiryDate != null) body.expiryDate = patchData.expiryDate;
        if (patchData.categorySlug != null) {
          const cid = CATEGORY_SLUG_TO_ID[patchData.categorySlug];
          if (cid != null) body.categoryId = cid;
        }
        if (patchData.quantityUnit) body.unit = mapProductUnitForApi(patchData.quantityUnit);
        await apiUpdateProduct(Number(productId), body);
        await fetchAllData();
      },

      deleteProduct: async (productId) => {
        await apiDeleteProduct(Number(productId), { ownerId: Number(user.id) });
        await fetchAllData();
      },

      addClaim: async (claimData, productId) => {
        try {
          await createClaim({
            productId: Number(productId),
            claimantId: Number(user.id), 
            requestedQuantity: Number(claimData.requestedQuantity) || 1
          });
          alert("Claim submitted!");
          await fetchAllData();
        } catch (err) { alert("Failed to submit claim."); }
      },

      updateClaim: async (claimId, requestedQuantity) => {
        await patchClaim(Number(claimId), {
          claimantId: Number(user.id),
          requestedQuantity: Number(requestedQuantity),
        });
        await fetchAllData();
      },

      withdrawClaim: async (claimId) => {
        await withdrawClaimRequest(Number(claimId), Number(user.id));
        await fetchAllData();
      },

      // 🛡️ GIGACHAD UPDATE: Stok hatasını yakalayan yeni resolveClaim
      resolveClaim: async (claimId, resolution) => {
        try {
          resolution === "APPROVED" ? await approveClaim(claimId) : await rejectClaim(claimId);
          await fetchAllData();
          alert(`Operation successful: ${resolution}`);
        } catch (err) { 
          // Muhammet'in 400 hatasını yakalıyoruz
          const isStockError = err.response?.status === 400 || err.message?.includes("400");
          
          if (isStockError && resolution === "APPROVED") {
            alert("⚠️ Error: Insufficient stock! You cannot approve this claim because the requested quantity exceeds the current stock.");
          } else {
            alert(`Operation failed: ${err.response?.data?.message || err.message}`);
          }
        }
      }
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