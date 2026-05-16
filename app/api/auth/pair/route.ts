import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { User } from '@/lib/models/User';
import { Couple } from '@/lib/models/Couple';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { username, partnerUsername, nickname } = await req.json();

    const user = await User.findOne({ username } as any);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (nickname) {
      user.name = nickname;
      await user.save();
    }

    const partner = await User.findOne({ username: partnerUsername } as any);
    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 });
    }

    if (user.coupleId || partner.coupleId) {
      // If either already has a couple, let's just make sure they share it if they are matching.
      // For simplicity, we just create a new one or use existing
      let sharedCoupleId = user.coupleId || partner.coupleId;
      if (!sharedCoupleId) {
        const couple = await Couple.create({
          partner1Name: user.name || user.username,
          partner2Name: partner.name || partner.username,
          startDate: new Date()
        });
        sharedCoupleId = couple._id;
      }
      
      user.coupleId = sharedCoupleId;
      partner.coupleId = sharedCoupleId;
      await user.save();
      await partner.save();

      const updatedUserObj = user.toObject();
      delete updatedUserObj.password;

      return NextResponse.json({ user: updatedUserObj, coupleId: sharedCoupleId });
    }

    // Create a new Couple
    const newCouple = await Couple.create({
      partner1Name: user.name || user.username,
      partner2Name: partner.name || partner.username,
      startDate: new Date(),
      relationshipPoints: 0
    });

    user.coupleId = newCouple._id;
    partner.coupleId = newCouple._id;
    await user.save();
    await partner.save();

    const finalUserObj = user.toObject();
    delete finalUserObj.password;

    return NextResponse.json({ user: finalUserObj, coupleId: newCouple._id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
