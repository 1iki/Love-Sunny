import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { User } from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { setSessionToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { username, email, password, gender } = await req.json();

    if (!username || !email || !password) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const existingUser = await User.findOne({ $or: [{ username }, { email }] } as any);
    if (existingUser) {
      return NextResponse.json({ error: 'Username or email already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      gender
    });

    const userObj = newUser.toObject();
    delete userObj.password;

    await setSessionToken({ userId: userObj._id.toString(), coupleId: userObj.coupleId?.toString() });

    return NextResponse.json(userObj, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
