import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { Couple } from '@/lib/models/Couple';
import { CommunicationLog } from '@/lib/models/CommunicationLog';
import { getSession } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!session.coupleId) {
      return NextResponse.json({ error: 'No couple connected' }, { status: 403 });
    }

    await dbConnect();
    const couple = await Couple.findOne({ _id: session.coupleId } as any).lean();
    if (!couple) {
      return NextResponse.json({ error: 'Couple not found' }, { status: 404 });
    }

    const ObjectBody = await req.json();

    const newLog = await CommunicationLog.create({
      coupleId: couple._id,
      date: ObjectBody.date || new Date(),
      points: ObjectBody.points || 0,
      notes: ObjectBody.text,
      type: ObjectBody.type || 'daily',
      tags: ObjectBody.tags || []
    });

    // Update couple relationship points
    await Couple.updateOne({ _id: couple._id } as any, { $inc: { relationshipPoints: newLog.points } });

    const formattedNote = {
      id: newLog._id.toString(),
      type: newLog.type === 'special' ? 'Surprise' : newLog.type === 'conflict_resolution' ? 'Important' : 'Routine',
      text: newLog.notes,
      emoji: newLog.type === 'special' ? '💝' : newLog.type === 'conflict_resolution' ? '💬' : '📌',
      tags: newLog.tags
    };

    return NextResponse.json(formattedNote);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (!session.coupleId) {
      return NextResponse.json({ error: 'No couple connected' }, { status: 403 });
    }

    await dbConnect();
    let couple = await Couple.findOne({ _id: session.coupleId } as any).lean();
    if (!couple) {
      return NextResponse.json({ error: 'Couple not found' }, { status: 404 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get today's points
    const todaysLogs = await CommunicationLog.find({
      coupleId: couple._id,
      date: { $gte: today }
    } as any).lean();
    const todayPoints = todaysLogs.reduce((acc: any, log: any) => acc + (log.points || 0), 0);

    // Get recent notes
    const recentNotes = await CommunicationLog.find({
      coupleId: couple._id,
      notes: { $exists: true, $ne: '' }
    } as any)
      .sort({ date: -1 })
      .limit(4)
      .lean();

    const formattedNotes = recentNotes.map((log: any) => ({
      id: log._id.toString(),
      type: log.type === 'special' ? 'Surprise' : log.type === 'conflict_resolution' ? 'Important' : 'Routine',
      text: log.notes,
      emoji: log.type === 'special' ? '💝' : log.type === 'conflict_resolution' ? '💬' : '📌',
      tags: log.tags || []
    }));

    return NextResponse.json({
      points: {
        relationship: couple.relationshipPoints || 0,
        today: todayPoints
      },
      notes: formattedNotes
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
