export function productPricing(variant) {
 const originalPrice = Number.isSafeInteger(variant?.originalPrice) ? variant.originalPrice : variant?.price;
 const discountPercent = Number.isInteger(variant?.discountPercent) ? variant.discountPercent : 0;
 const discountAmount = Number.isSafeInteger(variant?.discountAmount) ? variant.discountAmount : Number((BigInt(originalPrice || 0) * BigInt(discountPercent) + 50n) / 100n);
 const finalPrice = Number.isSafeInteger(variant?.finalPrice) ? variant.finalPrice : Number.isSafeInteger(variant?.discountedPrice) ? variant.discountedPrice : originalPrice - discountAmount;
 return {originalPrice, discountPercent, discountAmount, finalPrice};
}
