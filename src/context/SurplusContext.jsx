/* eslint-disable react-refresh/only-export-components -- provider + hook share one module */
import { createContext, useContext, useEffect, useMemo, useReducer, useState } from "react";

const SurplusContext = createContext(null);

const now = Date.now();
const SEED_PRODUCTS = [
  {
    id: "p-seed-1",
    name: "Morning bread assortment",
    categorySlug: "bakery",
    categoryName: "Bakery",
    quantity: 24,
    quantityUnit: "kg",
    expiryDate: new Date(now + 86400000).toISOString(),
    marketName: "Sunrise Market Co-op",
    status: "AVAILABLE",
    ownerKey: "market-demo@replate.local",
    createdAt: new Date(now - 3 * 86400000).toISOString(),
  },
  {
    id: "p-seed-2",
    name: "Mixed seasonal fruit crates",
    categorySlug: "fruits",
    categoryName: "Fruits",
    quantity: 12,
    quantityUnit: "crates",
    expiryDate: new Date(now + 2 * 86400000).toISOString(),
    marketName: "Sunrise Market Co-op",
    status: "AVAILABLE",
    ownerKey: "market-demo@replate.local",
    createdAt: new Date(now - 86400000).toISOString(),
  },
  {
    id: "p-seed-3",
    name: "Unsold deli salads (chilled)",
    categorySlug: "prepared",
    categoryName: "Prepared meals",
    quantity: 30,
    quantityUnit: "portions",
    expiryDate: new Date(now + 86400000).toISOString(),
    marketName: "Harbor Fresh Foods",
    status: "AVAILABLE",
    ownerKey: "harbor@replate.local",
    createdAt: new Date(now - 3600000).toISOString(),
  },
];

const SEED_CLAIMS = [
  {
    id: "c-seed-1",
    productId: "p-seed-1",
    productName: "Morning bread assortment",
    marketName: "Sunrise Market Co-op",
    ngoName: "Community Plate NGO",
    claimantKey: "ngo-demo@replate.local",
    requestedQuantity: 8,
    status: "PENDING",
    createdAt: new Date(now - 7200000).toISOString(),
  },
];

function applyPendingFromClaims(products, claims) {
  const pendingByProduct = new Set(
    claims.filter((c) => c.status === "PENDING").map((c) => c.productId),
  );
  return products.map((p) =>
    pendingByProduct.has(p.id) && p.status === "AVAILABLE" ? { ...p, status: "CLAIM_PENDING" } : p,
  );
}

function reducer(state, action) {
  switch (action.type) {
    case "HYDRATE":
      return { ...state, products: action.products, claims: action.claims };
    case "ADD_PRODUCT":
      return { ...state, products: [...state.products, action.product] };
    case "UPDATE_PRODUCT": {
      const { productId, patch } = action;
      return {
        ...state,
        products: state.products.map((p) => (p.id === productId ? { ...p, ...patch } : p)),
      };
    }
    case "DELETE_PRODUCT": {
      const { productId } = action;
      return {
        products: state.products.filter((p) => p.id !== productId),
        claims: state.claims.filter((c) => c.productId !== productId),
      };
    }
    case "ADD_CLAIM": {
      const { claim, productId } = action;
      return {
        ...state,
        claims: [...state.claims, claim],
        products: state.products.map((p) =>
          p.id === productId && p.status === "AVAILABLE" ? { ...p, status: "CLAIM_PENDING" } : p,
        ),
      };
    }
    case "RESOLVE_CLAIM": {
      const { claimId, resolution } = action;
      const claim = state.claims.find((c) => c.id === claimId);
      if (!claim) return state;
      return {
        claims: state.claims.map((c) => (c.id === claimId ? { ...c, status: resolution } : c)),
        products: state.products.map((p) => {
          if (p.id !== claim.productId) return p;
          if (resolution === "REJECTED") return { ...p, status: "AVAILABLE" };
          if (resolution === "APPROVED") return { ...p, status: "ALLOCATED" };
          return p;
        }),
      };
    }
    case "UPDATE_CLAIM": {
      const { claimId, claimantKey, requestedQuantity } = action;
      const claim = state.claims.find(
        (c) => c.id === claimId && c.claimantKey === claimantKey && c.status === "PENDING",
      );
      if (!claim) return state;
      return {
        ...state,
        claims: state.claims.map((c) =>
          c.id === claimId ? { ...c, requestedQuantity: Number(requestedQuantity) } : c,
        ),
      };
    }
    case "WITHDRAW_CLAIM": {
      const { claimId, claimantKey } = action;
      const claim = state.claims.find(
        (c) => c.id === claimId && c.claimantKey === claimantKey && c.status === "PENDING",
      );
      if (!claim) return state;
      const { productId } = claim;
      const newClaims = state.claims.filter((c) => c.id !== claimId);
      const stillPending = newClaims.some((c) => c.productId === productId && c.status === "PENDING");
      return {
        claims: newClaims,
        products: state.products.map((p) => {
          if (p.id !== productId) return p;
          if (stillPending) return p;
          if (p.status === "CLAIM_PENDING") return { ...p, status: "AVAILABLE" };
          return p;
        }),
      };
    }
    default:
      return state;
  }
}

export function SurplusProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, {
    products: [],
    claims: [],
  });
  const [catalogStatus, setCatalogStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setCatalogStatus("loading");
      try {
        await new Promise((r) => setTimeout(r, 480));
        if (cancelled) return;
        const withPendingProduct = applyPendingFromClaims(SEED_PRODUCTS, SEED_CLAIMS);
        dispatch({ type: "HYDRATE", products: withPendingProduct, claims: [...SEED_CLAIMS] });
        setCatalogStatus("ready");
      } catch {
        if (!cancelled) setCatalogStatus("error");
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      catalogStatus,
      products: state.products,
      claims: state.claims,
      addProduct: (product) => dispatch({ type: "ADD_PRODUCT", product }),
      updateProduct: (productId, patch) => dispatch({ type: "UPDATE_PRODUCT", productId, patch }),
      deleteProduct: (productId) => dispatch({ type: "DELETE_PRODUCT", productId }),
      addClaim: (claim, productId) => dispatch({ type: "ADD_CLAIM", claim, productId }),
      updateClaim: (claimId, claimantKey, requestedQuantity) =>
        dispatch({ type: "UPDATE_CLAIM", claimId, claimantKey, requestedQuantity }),
      withdrawClaim: (claimId, claimantKey) => dispatch({ type: "WITHDRAW_CLAIM", claimId, claimantKey }),
      resolveClaim: (claimId, resolution) => dispatch({ type: "RESOLVE_CLAIM", claimId, resolution }),
    }),
    [catalogStatus, state.products, state.claims],
  );

  return <SurplusContext.Provider value={value}>{children}</SurplusContext.Provider>;
}

export function useSurplus() {
  const ctx = useContext(SurplusContext);
  if (!ctx) throw new Error("useSurplus must be used within SurplusProvider");
  return ctx;
}
