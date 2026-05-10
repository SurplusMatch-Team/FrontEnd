/** Category slugs for forms; labels come from i18n `categories.<slug>`. Order matches DB seed ids 1–7. */
export const FOOD_CATEGORY_SLUGS = ["bakery", "fruits", "vegetables", "dairy", "dry_goods", "prepared", "beverages"];

/** Matches backend `seed_categories.sql` insertion order (ids 1–7). */
export const CATEGORY_SLUG_TO_ID = {
  bakery: 1,
  fruits: 2,
  vegetables: 3,
  dairy: 4,
  dry_goods: 5,
  prepared: 6,
  beverages: 7,
};

/** Backend `Category.name` as returned by API → form slug */
export const CATEGORY_DB_NAME_TO_SLUG = {
  Bakery: "bakery",
  Fruits: "fruits",
  Vegetables: "vegetables",
  Dairy: "dairy",
  "Dry Food": "dry_goods",
  "Cooked Meal": "prepared",
  Beverages: "beverages",
};
