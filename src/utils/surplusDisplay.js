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

export function displayOrgName(user, labels = {}) {
  const { guest = "Guest", member = "Member" } = labels;
  if (!user) return guest;
  if (user.organizationName?.trim()) return user.organizationName.trim();
  const email = user.email || "";
  const local = email.split("@")[0];
  return local ? local.replace(/[.-]/g, " ") : member;
}
