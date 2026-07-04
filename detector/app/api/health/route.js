import { NextResponse } from 'next/server';
import { initDB } from '../../../lib/db';

export async function GET() {
  let dbOk = false;
  try {
    initDB();
    dbOk = true;
  } catch (e) {
    dbOk = false;
  }

  return NextResponse.json({
    status: 'ok',
    db: dbOk,
    aiEnabled: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
}
