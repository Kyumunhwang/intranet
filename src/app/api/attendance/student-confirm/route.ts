import { NextRequest, NextResponse } from 'next/server';
import { confirmClassAttendance } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = confirmClassAttendance({
      grade: body.grade || 3,
      class_no: body.class_no || 2,
      confirmed_by: body.confirmed_by || 'u2',
      records: body.records || [],
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '학생 출결 Confirm 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
