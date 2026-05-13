/**
 * UI category string: prefers i18n `categories.<categorySlug>`, else API `categoryName`.
 * @param {(path: string) => string} t
 * @param {{ categorySlug?: string, categoryName?: string }} product
 */
export function categoryLabelFromProduct(t, product) {
  const slug = product?.categorySlug;
  if (slug && typeof slug === "string") {
    const key = `categories.${slug}`;
    const lbl = t(key);
    if (lbl !== key) return lbl;
  }
  const name = product?.categoryName;
  if (name != null && String(name).trim() !== "") return String(name).trim();
  return t("market.categoryGeneral");
}
