import { NextRequest, NextResponse } from 'next/server';
import { currentUser } from '@/lib/current-user';
import { razorpayInstance, PLAN_PRICES } from '@/lib/razorpay';
import { prisma } from '@/db';

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { planId, billingCycle, vaultId, vaultType } = await req.json();

    console.log('💳 [POST /api/billing/create-checkout-session] Called:', {
      userId: user.id,
      planId,
      billingCycle,
      vaultId,
      vaultType,
    });

    if (!planId || !billingCycle || !vaultId || !vaultType) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    if (!['monthly', 'yearly'].includes(billingCycle)) {
      return NextResponse.json({ error: 'Invalid billing cycle' }, { status: 400 });
    }

    if (!['personal', 'org'].includes(vaultType)) {
      return NextResponse.json({ error: 'Invalid vault type' }, { status: 400 });
    }

    if (!['pro', 'enterprise'].includes(planId)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 });
    }

    const priceInINR =
      PLAN_PRICES[vaultType as 'personal' | 'org'][planId as 'pro' | 'enterprise'][
        billingCycle as 'monthly' | 'yearly'
      ];

    const amountInPaise = priceInINR * 100;

    const order = await razorpayInstance.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `receipt_${vaultId}_${Date.now()}`,
      notes: {
        user_id: user.id,
        vault_id: vaultId,
        plan_id: planId,
        billing_cycle: billingCycle,
        vault_type: vaultType,
      },
    });

    console.log('✅ Razorpay order created:', order.id);

    await prisma.logs.create({
      data: {
        user_id: user.id,
        action: 'PAYMENT_ORDER_CREATED',
        subject_type: 'billing',
        ts: new Date(),
        meta: {
          order_id: order.id,
          amount: priceInINR,
          currency: 'INR',
          plan_id: planId,
          billing_cycle: billingCycle,
          vault_id: vaultId,
        },
      },
    });

    return NextResponse.json(
      {
        orderId: order.id,
        amount: amountInPaise,
        currency: 'INR',
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        name: 'Vault Pro',
        description: `${planId.toUpperCase()} Plan - ${billingCycle}`,
        prefill: {
          name: user.name || user.email,
          email: user.email,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error";

    console.error("❌ Error creating checkout session:", error);
    return NextResponse.json(
      {
        error: 'Failed to create checkout session',
        details: process.env.NODE_ENV === 'development' ? message : undefined,
      },
      { status: 500 }
    );
  }
}