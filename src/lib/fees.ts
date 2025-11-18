import { supabase } from '@/integrations/supabase/client';

// Cache for platform fees to avoid repeated queries
let feesCache: Record<string, number> | null = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Get platform fee for a subcategory (or category as fallback)
 * @param category - Product category (e.g., 'Beer', 'Wine', 'Spirits')
 * @param subcategory - Product subcategory (e.g., 'port', 'sparkling wine', 'Gin')
 * @returns Platform fee amount in GBP
 */
export async function getPlatformFee(category: string, subcategory?: string | null): Promise<number> {
  // Check cache first
  const cacheKey = subcategory ? `${category}:${subcategory}` : category;
  const now = Date.now();
  if (feesCache && (now - cacheTimestamp) < CACHE_DURATION) {
    return feesCache[cacheKey] || feesCache[category] || feesCache['default'] || 3.00;
  }

  try {
    // First try to get subcategory-specific fee
    if (subcategory) {
    const { data, error } = await supabase
        .from('platform_fees')
        .select('fee_amount')
        .eq('category', category)
        .eq('subcategory', subcategory)
        .single();

      if (!error && data) {
        const fee = Number(data.fee_amount);
        if (!feesCache) feesCache = {};
        feesCache[cacheKey] = fee;
        cacheTimestamp = now;
        return fee;
      }
    }

    // Fallback to category-level fee (where subcategory is null)
    const { data: categoryData, error: categoryError } = await supabase
      .from('platform_fees')
      .select('fee_amount')
      .eq('category', category)
      .is('subcategory', null)
      .single();

    if (!categoryError && categoryData) {
      const fee = Number(categoryData.fee_amount);
      if (!feesCache) feesCache = {};
      feesCache[category] = fee;
      cacheTimestamp = now;
      return fee;
    }

    // Final fallback: get any default fee
      const { data: defaultData } = await supabase
        .from('platform_fees')
        .select('fee_amount')
        .limit(1)
        .single();
      
    const defaultFee = defaultData?.fee_amount ? Number(defaultData.fee_amount) : 3.00;

    // Update cache
    if (!feesCache) feesCache = {};
    feesCache[cacheKey] = defaultFee;
    feesCache['default'] = defaultFee;
    cacheTimestamp = now;

    return defaultFee;
  } catch (error) {
    console.error('Error fetching platform fee:', error);
    return 3.00; // Default fallback
  }
}

/**
 * Calculate total price with platform fee (for buyer)
 * @param price - Original price
 * @param platformFee - Platform fee amount (from getPlatformFee)
 * @returns Total price including platform fee (price + fee)
 */
export function calculateTotalWithFee(price: number, platformFee: number): number {
  return price + platformFee;
}

/**
 * Get all platform fees (for admin panel)
 * Returns fees grouped by category with subcategories
 */
export async function getAllPlatformFees() {
  const { data, error } = await supabase
    .from('platform_fees')
    .select('*')
    .order('category')
    .order('subcategory', { nullsFirst: false });

  if (error) throw error;
  return data || [];
}

/**
 * Update platform fee (admin only)
 */
export async function updatePlatformFee(category: string, subcategory: string | null, feeAmount: number) {
  const { error } = await supabase
    .from('platform_fees')
    .upsert({
      category,
      subcategory: subcategory || null,
      fee_amount: feeAmount,
      updated_at: new Date().toISOString(),
    });

  if (error) throw error;
  
  // Invalidate cache
  feesCache = null;
}

/**
 * Delete platform fee (admin only)
 */
export async function deletePlatformFee(category: string, subcategory: string | null) {
  const { error } = await supabase
    .from('platform_fees')
    .delete()
    .eq('category', category)
    .eq('subcategory', subcategory || null);

  if (error) throw error;
  
  // Invalidate cache
  feesCache = null;
}

