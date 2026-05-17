export function organizationAddressParts(userOrOwner) {
  if (!userOrOwner || typeof userOrOwner !== "object") return null;
  const addr = userOrOwner.address && typeof userOrOwner.address === "object" ? userOrOwner.address : null;
  const city = userOrOwner.city ?? addr?.city ?? null;
  const district = userOrOwner.district ?? addr?.district ?? null;
  const fullAddress = userOrOwner.fullAddress ?? addr?.fullAddress ?? addr?.full_address ?? null;
  if (!city && !district && !fullAddress) return null;
  return { city, district, fullAddress };
}

export function formatOrganizationAddressLine(userOrOwner) {
  const parts = organizationAddressParts(userOrOwner);
  if (!parts) return "";
  const segments = [parts.district, parts.city, parts.fullAddress].filter(Boolean).map((s) => String(s).trim());
  return [...new Set(segments)].join(" · ");
}
