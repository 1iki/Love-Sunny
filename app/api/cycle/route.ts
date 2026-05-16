import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { Couple } from '@/lib/models/Couple';
import { HormonalCycle } from '@/lib/models/HormonalCycle';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!session.coupleId) return NextResponse.json({ error: 'No couple connected' }, { status: 403 });

    await dbConnect();
    const couple = await Couple.findOne({ _id: session.coupleId } as any).lean();
    if (!couple) return NextResponse.json({ error: 'Couple not found' }, { status: 404 });

    let cycle = await HormonalCycle.findOne({ coupleId: couple._id } as any).sort({ createdAt: -1 }).lean();
    if (!cycle) {
      cycle = await HormonalCycle.create({
        coupleId: couple._id,
        lastPeriodStart: new Date(new Date().setDate(new Date().getDate() - 14)), // default approx ovulation
        cycleLength: 28,
        periodLength: 5
      });
    }

    return NextResponse.json({
      startDate: cycle.lastPeriodStart.toISOString(),
      cycleLength: cycle.cycleLength,
      periodLength: cycle.periodLength
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!session.coupleId) return NextResponse.json({ error: 'No couple connected' }, { status: 403 });

    await dbConnect();
    const couple = await Couple.findOne({ _id: session.coupleId } as any).lean();
    if (!couple) return NextResponse.json({ error: 'Couple not found' }, { status: 404 });

    const body = await req.json();

    let newCycleLength = undefined;
    let newStartDate = body.startDate; // Fallback for old simple update

    // If we have history pastDate1, pastDate2, pastDate3, calculate the average cycle length
    if (body.pastDate1 && body.pastDate2 && body.pastDate3) {
      const d1 = new Date(body.pastDate1).getTime();
      const d2 = new Date(body.pastDate2).getTime();
      const d3 = new Date(body.pastDate3).getTime();
      
      const diff1 = Math.abs(d2 - d1) / (1000 * 60 * 60 * 24);
      const diff2 = Math.abs(d3 - d2) / (1000 * 60 * 60 * 24);
      
      newCycleLength = Math.round((diff1 + diff2) / 2);
      newStartDate = body.pastDate3;
    }

    const updateFields: any = {};
    if (newStartDate) updateFields.lastPeriodStart = new Date(newStartDate);
    if (newCycleLength) updateFields.cycleLength = newCycleLength;
    if (body.periodLength) updateFields.periodLength = body.periodLength;

    const cycle = await HormonalCycle.findOneAndUpdate(
      { coupleId: couple._id } as any,
      updateFields,
      { new: true, sort: { createdAt: -1 } } as any
    ).lean();

    return NextResponse.json({
      startDate: cycle?.lastPeriodStart.toISOString(),
      cycleLength: cycle?.cycleLength,
      periodLength: cycle?.periodLength
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
