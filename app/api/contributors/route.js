import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Contributor from '../../../models/contributer';

const TOTAL_TARGET_SHARES = 250;
const PRICE_PER_SHARE = 400;

// GET: Retrieve all contributors and computed share statistics
export async function GET() {
  try {
    await connectDB();
    const contributors = await Contributor.find({}).sort({ createdAt: -1 }).lean();

    const totalSharesReceived = contributors.reduce(
      (acc, curr) => acc + (Number(curr.shares) || 0),
      0
    );
    const balanceSharesNeeded = Math.max(0, TOTAL_TARGET_SHARES - totalSharesReceived);
    const totalMoneyCollected = totalSharesReceived * PRICE_PER_SHARE;
    const balanceMoneyNeeded = Math.max(0, TOTAL_TARGET_SHARES * PRICE_PER_SHARE - totalMoneyCollected);
    const refundCompletedAmount = contributors
      .filter((contributor) => (contributor.refundStatus || 'Pending') === 'Completed')
      .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);
    const refundCompletedCount = contributors.filter(
      (contributor) => (contributor.refundStatus || 'Pending') === 'Completed'
    ).length;

    return NextResponse.json({
      success: true,
      summary: {
        totalTargetShares: TOTAL_TARGET_SHARES,
        pricePerShare: PRICE_PER_SHARE,
        totalTargetAmount: TOTAL_TARGET_SHARES * PRICE_PER_SHARE,
        totalSharesReceived,
        balanceSharesNeeded,
        totalMoneyCollected,
        balanceMoneyNeeded,
        refundCompletedAmount,
        refundCompletedCount,
      },
      data: contributors,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// POST: Add a new contributor
export async function POST(req) {
  try {
    await connectDB();
    const body = await req.json();

    const { name, phone, whatsapp, upiId, place, paymentMode } = body;
    const shares = Number(body.shares) || 1;

    // Validate inputs
    if (!name || !phone || !whatsapp || !place || !paymentMode) {
      return NextResponse.json(
        { success: false, error: 'All required fields must be filled.' },
        { status: 400 }
      );
    }

    if (paymentMode === 'UPI' && !upiId?.trim()) {
      return NextResponse.json(
        { success: false, error: 'UPI ID is required when payment mode is UPI.' },
        { status: 400 }
      );
    }

    // Check pool capacity
    const all = await Contributor.find({}, 'shares').lean();
    const currentSold = all.reduce((sum, item) => sum + (item.shares || 0), 0);
    const remaining = TOTAL_TARGET_SHARES - currentSold;

    if (remaining <= 0) {
      return NextResponse.json(
        { success: false, error: 'Target of 250 shares is already fulfilled.' },
        { status: 400 }
      );
    }

    if (shares > remaining) {
      return NextResponse.json(
        { success: false, error: `Only ${remaining} share(s) left in the pool.` },
        { status: 400 }
      );
    }

    const amount = shares * PRICE_PER_SHARE;

    const newContributor = await Contributor.create({
      name: name.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim(),
      upiId: paymentMode === 'UPI' ? upiId.trim() : '',
      place: place.trim(),
      paymentMode,
      shares,
      amount,
    });

    return NextResponse.json(
      { success: true, data: newContributor },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 400 }
    );
  }
}