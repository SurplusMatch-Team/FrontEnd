export function findNgoClaimForProduct(productId, claims) {
  if (productId == null || !Array.isArray(claims)) return null;
  return claims.find((c) => Number(c.productId) === Number(productId)) ?? null;
}

/** Whether this NGO may submit a new claim on the listing. */
export function ngoClaimGate(claim) {
  if (!claim) return { canClaim: true, kind: "none", status: null };
  const status = String(claim.status || "").toUpperCase();
  if (status === "PENDING") {
    return { canClaim: false, kind: "pending", status };
  }
  if (status === "APPROVED" || status === "REJECTED") {
    return { canClaim: false, kind: "resolved", status };
  }
  return { canClaim: true, kind: "none", status: null };
}
