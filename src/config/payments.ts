export const paymentsConfig = {
  enabled: (import.meta.env.VITE_ENABLE_PAYMENTS as string) === 'true',
  publishableKey: (import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string) || '',
  feeBps: Number(import.meta.env.VITE_PLATFORM_FEE_BPS || 200),
  appUrl: (import.meta.env.VITE_APP_URL as string) || '',
};


