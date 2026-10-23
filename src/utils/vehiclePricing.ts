export function parseCatalogPrice(price?: string): number | null {
	if (!price) return null;

	const normalizedPrice = price.toLowerCase().replace(/,/g, "");
	const match = normalizedPrice.match(/(\d+(?:\.\d+)?)/);
	if (!match) return null;

	const multiplier = normalizedPrice.includes("crore")
		? 10_000_000
		: normalizedPrice.includes("lakh")
			? 100_000
			: normalizedPrice.includes("thousand")
				? 1_000
				: 1;
	const amount = Number(match[1]) * multiplier;

	return Number.isFinite(amount) && amount > 0 ? Math.round(amount) : null;
}
