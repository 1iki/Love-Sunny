import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { User } from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { setSessionToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const user = await User.findOne({ username } as any);
    if (!user) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid username or password' }, { status: 401 });
    }

    const userObj = user.toObject();
    delete userObj.password;

    await setSessionToken({ userId: userObj._id.toString(), coupleId: userObj.coupleId?.toString() });

    return NextResponse.json(userObj);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
