// components/settings/BillingComponent.tsx
import React, { useState } from 'react';
import { CreditCard, Check, Zap } from 'lucide-react';
import { User } from '@/types/vault';
import { BillingPlan, PlanType } from '@/types/billing';

interface BillingComponentProps {
  user: User;
}

export const BillingComponent: React.FC<BillingComponentProps> = ({ user }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  const currentPlan: PlanType = 'free'; // This should come from user data

  const personalPlans: BillingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      limits: {
        vaults: 1,
        itemsPerVault: 5,
        storage: '100MB',
        features: ['1 Personal Vault', '5 Items', 'Basic Security', 'Web Access']
      }
    },
    {
      id: 'pro',
      name: 'Pro',
      price: { monthly: 9, yearly: 90 },
      limits: {
        vaults: 5,
        itemsPerVault: 1000,
        storage: '10GB',
        features: ['5 Personal Vaults', 'Unlimited Items', 'Advanced Security', '2FA Support', 'Priority Support']
      },
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: { monthly: 29, yearly: 290 },
      limits: {
        vaults: 999,
        itemsPerVault: 10000,
        storage: 'Unlimited',
        features: ['Unlimited Vaults', 'Unlimited Items', 'Enterprise Security', 'Custom Integrations', 'Dedicated Support']
      }
    }
  ];

  const orgPlans: BillingPlan[] = [
    {
      id: 'free',
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      limits: {
        vaults: 1,
        itemsPerVault: 5,
        members: 3,
        storage: '100MB',
        features: ['1 Organization Vault', '5 Items', 'Up to 3 Members', 'Basic Security']
      }
    },
    {
      id: 'pro',
      name: 'Pro',
      price: { monthly: 25, yearly: 250 },
      limits: {
        vaults: 10,
        itemsPerVault: 2000,
        members: 50,
        storage: '100GB',
        features: ['10 Organization Vaults', 'Unlimited Items', 'Up to 50 Members', 'Team Management', 'Advanced Security']
      },
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: { monthly: 99, yearly: 990 },
      limits: {
        vaults: 999,
        itemsPerVault: 10000,
        members: 999,
        storage: 'Unlimited',
        features: ['Unlimited Everything', 'Advanced Compliance', 'SSO Integration', 'Dedicated Support', 'Custom Features']
      }
    }
  ];

  const plans = user.account_type === 'personal' ? personalPlans : orgPlans;

  const getCurrentPlanDetails = (): BillingPlan | null => {
    return plans.find(p => p.id === currentPlan) || null;
  };

  const currentPlanDetails = getCurrentPlanDetails();

  const handleUpgrade = async (planId: PlanType): Promise<void> => {
    if (planId === 'free') return;

    setLoading(planId);
    try {
      const response = await fetch('/api/billing/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          billingCycle,
          accountType: user.account_type
        })
      });

      if (response.ok) {
        const { url } = await response.json();
        window.location.href = url;
      } else {
        throw new Error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error upgrading plan:', error);
      alert('Failed to start upgrade process');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Current Plan */}
      <div className="bg-gray-800/30 rounded-xl p-4 md:p-6 border border-gray-700/30">
        <h3 className="text-lg md:text-xl font-semibold mb-4 flex items-center gap-2">
          <CreditCard className="w-4 h-4 md:w-5 md:h-5" />
          Current Plan
        </h3>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 md:p-4 bg-gray-700/30 rounded-lg">
          <div className="min-w-0 flex-shrink">
            <p className="font-medium text-white text-sm md:text-base">
              {currentPlanDetails?.name || 'Unknown'} Plan
            </p>
            <p className="text-xs md:text-sm text-gray-400">
              {user.account_type === 'personal' ? 'Personal Account' : 'Organization Account'}
            </p>
          </div>
          <div className="text-left sm:text-right flex-shrink-0">
            <p className="text-lg md:text-xl font-semibold text-white">
              {currentPlan === 'free' ? 'Free' : `$${currentPlanDetails?.price.monthly || 0}/mo`}
            </p>
            {currentPlan !== 'free' && (
              <p className="text-xs md:text-sm text-gray-400">Next billing: Dec 11, 2025</p>
            )}
          </div>
        </div>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex items-center justify-center">
        <div className="bg-gray-800/30 p-1 rounded-lg flex">
          <button
            onClick={() => setBillingCycle('monthly')}
            className={`px-3 md:px-4 py-2 rounded-md transition-colors text-sm md:text-base ${
              billingCycle === 'monthly'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingCycle('yearly')}
            className={`px-3 md:px-4 py-2 rounded-md transition-colors relative text-sm md:text-base ${
              billingCycle === 'yearly'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            Yearly
            <span className="absolute -top-1 -right-1 bg-green-500 text-xs px-1 rounded text-white">
              Save
            </span>
          </button>
        </div>
      </div>

      {/* Available Plans */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-gray-800/30 rounded-xl p-4 md:p-6 border transition-all duration-200 ${
              plan.popular
                ? 'border-blue-500/50 bg-blue-900/10'
                : 'border-gray-700/30 hover:border-gray-600/50'
            } ${currentPlan === plan.id ? 'ring-2 ring-green-500/50' : ''}`}
          >
            {plan.popular && (
              <div className="absolute -top-2 md:-top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-600 text-white text-xs px-2 md:px-3 py-1 rounded-full">
                  Popular
                </span>
              </div>
            )}

            <div className="text-center mb-4 md:mb-6">
              <h3 className="text-lg md:text-xl font-semibold text-white mb-2">{plan.name}</h3>
              <div className="mb-3 md:mb-4">
                <span className="text-2xl md:text-3xl font-bold text-white">
                  ${billingCycle === 'yearly' ? plan.price.yearly : plan.price.monthly}
                </span>
                {plan.id !== 'free' && (
                  <span className="text-gray-400 text-sm md:text-base">
                    /{billingCycle === 'yearly' ? 'year' : 'month'}
                  </span>
                )}
              </div>
              {billingCycle === 'yearly' && plan.id !== 'free' && (
                <p className="text-xs md:text-sm text-green-400">
                  Save ${(plan.price.monthly * 12) - plan.price.yearly}/year
                </p>
              )}
            </div>

            <ul className="space-y-2 md:space-y-3 mb-4 md:mb-6 min-h-[120px]">
              {plan.limits.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2 text-xs md:text-sm">
                  <Check className="w-3 h-3 md:w-4 md:h-4 text-green-400 flex-shrink-0" />
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleUpgrade(plan.id)}
              disabled={currentPlan === plan.id || loading === plan.id}
              className={`w-full py-2.5 md:py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm md:text-base ${
                currentPlan === plan.id
                  ? 'bg-green-600/20 text-green-400 cursor-not-allowed'
                //   @ts-expect-error Todo: type fixing
                  : plan.id === 'free'
                  ? 'bg-gray-600/50 text-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
            >
              {loading === plan.id ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
              ) : currentPlan === plan.id ? (
                <>
                  <Check className="w-4 h-4" />
                  Current
                </>
                // @ts-expect-error Todo: type fixing
              ) : plan.id === 'free' ? (
                'Downgrade'
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Upgrade
                </>
              )}
            </button>
          </div>
        ))}
      </div>

      {/* Features Comparison */}
      <div className="bg-gray-800/30 rounded-xl p-4 md:p-6 border border-gray-700/30">
        <h3 className="text-lg md:text-xl font-semibold mb-4">Plan Comparison</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs md:text-sm">
            <thead>
              <tr className="border-b border-gray-700/50">
                <th className="text-left py-2 md:py-3 text-gray-300 min-w-[100px]">Feature</th>
                {plans.map(plan => (
                  <th key={plan.id} className="text-center py-2 md:py-3 text-gray-300 min-w-[80px]">
                    {plan.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              <tr>
                <td className="py-2 md:py-3 text-gray-300">Vaults</td>
                {plans.map(plan => (
                  <td key={plan.id} className="text-center py-2 md:py-3 text-white">
                    {plan.limits.vaults === 999 ? '∞' : plan.limits.vaults}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="py-2 md:py-3 text-gray-300">Items</td>
                {plans.map(plan => (
                  <td key={plan.id} className="text-center py-2 md:py-3 text-white">
                    {plan.limits.itemsPerVault >= 1000 ? '∞' : plan.limits.itemsPerVault}
                  </td>
                ))}
              </tr>
              {user.account_type === 'org' && (
                <tr>
                  <td className="py-2 md:py-3 text-gray-300">Members</td>
                  {plans.map(plan => (
                    <td key={plan.id} className="text-center py-2 md:py-3 text-white">
                      {plan.limits.members === 999 ? '∞' : plan.limits.members || '-'}
                    </td>
                  ))}
                </tr>
              )}
              <tr>
                <td className="py-2 md:py-3 text-gray-300">Storage</td>
                {plans.map(plan => (
                  <td key={plan.id} className="text-center py-2 md:py-3 text-white">
                    {plan.limits.storage}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Billing Actions */}
      {currentPlan !== 'free' && (
        <div className="bg-gray-800/30 rounded-xl p-4 md:p-6 border border-gray-700/30">
          <h3 className="text-lg md:text-xl font-semibold mb-4">Billing Actions</h3>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className="px-4 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-lg transition-colors text-sm md:text-base"
              onClick={() => window.open('/api/billing/customer-portal', '_blank')}
            >
              Manage Billing
            </button>
            <button
              className="px-4 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-300 rounded-lg transition-colors text-sm md:text-base"
              onClick={() => {
                if (confirm('Are you sure you want to cancel your subscription?')) {
                  // Handle cancellation
                }
              }}
            >
              Cancel Subscription
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
