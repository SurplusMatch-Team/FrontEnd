export function formatExpiryDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function formatQuantity(product) {
  const u = product.quantityUnit || "units";
  return `${product.quantity} ${u}`;
}

/** Sum of PENDING requested units for a product (market has full claims in context). */
export function sumPendingRequestedForProduct(claims, productId) {
  const pid = Number(productId);
  if (!Number.isFinite(pid)) return 0;
  return (claims || []).reduce((acc, c) => {
    const cpid = Number(c.productId);
    const pending = String(c.status || "").toUpperCase() === "PENDING";
    if (!Number.isFinite(cpid) || cpid !== pid || !pending) return acc;
    const q = Number(c.requestedQuantity);
    return acc + (Number.isFinite(q) ? q : 0);
  }, 0);
}

export function displayOrgName(user, labels = {}) {
  const { guest = "Guest", member = "Member" } = labels;
  if (!user) return guest;
  if (user.organizationName?.trim()) return user.organizationName.trim();
  const email = user.email || "";
  const local = email.split("@")[0];
  return local ? local.replace(/[.-]/g, " ") : member;
}
