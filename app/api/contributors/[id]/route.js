import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/mongodb';
import Contributor from '../../../../models/contributer';

export async function PATCH(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;
    const { refundStatus } = await request.json();

    if (!['Pending', 'Completed'].includes(refundStatus)) {
      return NextResponse.json(
        { success: false, error: 'Invalid refund status' },
        { status: 400 }
      );
    }

    const updated = await Contributor.findByIdAndUpdate(
      id,
      { refundStatus },
      { returnDocument: 'after', runValidators: true }
    );

    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Contributor record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    await connectDB();
    const { id } = await params;

    const deleted = await Contributor.findByIdAndDelete(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Contributor record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Contributor record deleted successfully',
      data: deleted,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}