export interface CouponDefinition {
  code: string;
  discountPercent: number;
  grantsDevAccess: boolean;
  description: string;
}

export interface CouponValidationResult {
  isValid: boolean;
  code: string;
  discountPercent: number;
  grantsDevAccess: boolean;
  originalPrice: number;
  discountedPrice: number;
  formattedDiscount: string;
  error?: string;
}

export const COUPON_MAP: Record<string, CouponDefinition> = {
  'RHOMANI': {
    code: 'RHOMANI',
    discountPercent: 15,
    grantsDevAccess: false,
    description: '15% discount on Professional Plan'
  },
  'ZHARAHT': {
    code: 'ZHARAHT',
    discountPercent: 15,
    grantsDevAccess: false,
    description: '15% discount on Professional Plan'
  },
  'VERITHREAD100': {
    code: 'VERITHREAD100',
    discountPercent: 100,
    grantsDevAccess: false,
    description: '100% discount on Professional Plan (Free)'
  },
  'DEV_ACCESS': {
    code: 'DEV_ACCESS',
    discountPercent: 100,
    grantsDevAccess: true,
    description: '100% discount on Professional Plan + Developer Admin Access'
  }
};

export function validateCouponCode(code: string, selectedPlan: string): CouponValidationResult {
  const cleanCode = code.trim().toUpperCase();
  const normalizedPlan = selectedPlan.trim().toLowerCase();

  if (!cleanCode) {
    return {
      isValid: false,
      code: '',
      discountPercent: 0,
      grantsDevAccess: false,
      originalPrice: 25000,
      discountedPrice: 25000,
      formattedDiscount: '0%',
      error: 'Please enter a coupon code'
    };
  }

  // Check if coupon exists in map
  const coupon = COUPON_MAP[cleanCode];

  // Coupons apply to Professional Plan
  if (!coupon || (normalizedPlan !== 'professional' && normalizedPlan !== 'pro')) {
    return {
      isValid: false,
      code: cleanCode,
      discountPercent: 0,
      grantsDevAccess: false,
      originalPrice: 25000,
      discountedPrice: 25000,
      formattedDiscount: '0%',
      error: 'Invalid coupon code'
    };
  }

  const originalPrice = 25000;
  const discountAmount = (originalPrice * coupon.discountPercent) / 100;
  const discountedPrice = Math.max(0, originalPrice - discountAmount);

  return {
    isValid: true,
    code: coupon.code,
    discountPercent: coupon.discountPercent,
    grantsDevAccess: coupon.grantsDevAccess,
    originalPrice,
    discountedPrice,
    formattedDiscount: coupon.discountPercent === 100 ? '100% OFF (Free)' : `${coupon.discountPercent}% OFF`
  };
}
