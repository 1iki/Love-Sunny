import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db/mongodb';
import { User } from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import { setSessionToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { email, name, googleId } = await req.json();

    if (!email) {
      return NextResponse.json({ error: 'Missing email' }, { status: 400 });
    }

    let user = await User.findOne({ email } as any);
    if (!user) {
      // Create a new user with a random password
      const generatedPassword = Math.random().toString(36).slice(-8);
      const hashedPassword = await bcrypt.hash(generatedPassword, 10);
      const username = name ? name.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000) : email.split('@')[0] + Math.floor(Math.random() * 1000);
      
      user = await User.create({
        username,
        email,
        password: hashedPassword,
        name,
        gender: 'other' // default for google signup
      });
    }

    const userObj = user.toObject();
    delete userObj.password;

    await setSessionToken({ userId: userObj._id.toString(), coupleId: userObj.coupleId?.toString() });

    return NextResponse.json(userObj);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
