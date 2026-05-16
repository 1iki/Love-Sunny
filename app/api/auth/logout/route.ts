import { NextResponse } from 'next/server';
import { clearSessionToken } from '@/lib/auth';

export async function POST() {
  try {
    await clearSessionToken();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
