import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { Couple } from '@/lib/models/Couple';
import { CommunicationLog } from '@/lib/models/CommunicationLog';
import { getSession } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!session.coupleId) return NextResponse.json({ error: 'No couple connected' }, { status: 403 });

    await dbConnect();
    const couple = await Couple.findOne({ _id: session.coupleId } as any).lean();
    if (!couple) return NextResponse.json({ error: 'Couple not found' }, { status: 404 });

    const logs = await CommunicationLog.find({ coupleId: couple._id } as any)
      .sort({ date: -1 })
      .lean();

    const formattedLogs = logs.map((log: any) => ({
      id: log._id.toString(),
      date: log.date.toISOString(),
      points: log.points || 0,
      type: log.type,
      notes: log.notes
    }));

    return NextResponse.json({ logs: formattedLogs });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!session.coupleId) return NextResponse.json({ error: 'No couple connected' }, { status: 403 });

    await dbConnect();
    const couple = await Couple.findOne({ _id: session.coupleId } as any).lean();
    if (!couple) return NextResponse.json({ error: 'Couple not found' }, { status: 404 });

    const body = await req.json();

    const newLog = await CommunicationLog.create({
      coupleId: couple._id,
      date: body.date || new Date(),
      points: body.points || 0,
      notes: body.notes,
      type: body.type || 'daily',
      tags: body.tags || []
    });

    // Update couple relationship points
    await Couple.updateOne({ _id: couple._id } as any, { $inc: { relationshipPoints: newLog.points } });

    return NextResponse.json({
      id: newLog._id.toString(),
      date: newLog.date.toISOString(),
      points: newLog.points,
      type: newLog.type,
      notes: newLog.notes,
      tags: newLog.tags
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
