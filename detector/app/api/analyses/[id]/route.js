import { NextResponse } from 'next/server';
import { getAnalysisById } from '../../../../lib/db';

export async function GET(request, { params }) {
  try {
    const id = parseInt(params.id);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }

    const analysis = getAnalysisById(id);
    if (!analysis) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: analysis });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
