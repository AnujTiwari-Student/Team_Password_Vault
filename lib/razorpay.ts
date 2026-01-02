import Razorpay from 'razorpay';

export const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

// Plan prices in INR (Indian Rupees)
export const PLAN_PRICES = {
  personal: {
    free: { monthly: 0, yearly: 0 },
    pro: { monthly: 749, yearly: 7490 }, // ~$9/month
    enterprise: { monthly: 2499, yearly: 24990 }, // ~$29/month
  },
  org: {
    free: { monthly: 0, yearly: 0 },
    pro: { monthly: 2099, yearly: 20990 }, // ~$25/month
    enterprise: { monthly: 8299, yearly: 82990 }, // ~$99/month
  },
};

// Subscription Plan IDs (create these in Razorpay Dashboard)
export const RAZORPAY_PLAN_IDS = {
  personal: {
    pro_monthly: 'plan_XXXXX', // Replace with actual Razorpay plan IDs
    pro_yearly: 'plan_XXXXX',
    enterprise_monthly: 'plan_XXXXX',
    enterprise_yearly: 'plan_XXXXX',
  },
  org: {
    pro_monthly: 'plan_XXXXX',
    pro_yearly: 'plan_XXXXX',
    enterprise_monthly: 'plan_XXXXX',
    enterprise_yearly: 'plan_XXXXX',
  },
};
