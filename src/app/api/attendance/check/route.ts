import { NextRequest, NextResponse } from 'next/server';
import { recordStaffAttendance } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const clientIp =
      body.client_ip ||
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      '211.104.88.24';

    const result = recordStaffAttendance({
      teacher_id: body.teacher_id || 'u2',
      action: body.action || 'CHECK_IN',
      client_ip: clientIp,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '출퇴근 처리 중 서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
