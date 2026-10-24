import { NextRequest, NextResponse } from 'next/server';
import { adjustLeaveBySuperAdmin, getAuditLogs } from '@/lib/db';

export async function GET() {
  const allLogs = getAuditLogs();
  const leaveLogs = allLogs.filter((l) => l.action_category === 'LEAVE_ADJUSTMENT');
  return NextResponse.json({ success: true, logs: leaveLogs });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      staffId,
      adjustType,
      amount,
      reasonMemo,
      adjustedDate,
      superAdminName,
      superAdminEmail,
      clientIp,
    } = body;

    if (!staffId || !adjustType || !amount || !reasonMemo || !adjustedDate) {
      return NextResponse.json(
        { success: false, message: '연차 조정에 필요한 필수 항목(교직원, 가감 유형, 일수, 사유 메모, 조정 일자)이 누락되었습니다.' },
        { status: 400 }
      );
    }

    const result = adjustLeaveBySuperAdmin({
      staffId,
      adjustType,
      amount: Math.abs(Number(amount)),
      reasonMemo,
      adjustedDate,
      superAdminName: superAdminName || '황규문',
      superAdminEmail: superAdminEmail || 'kyumun.hwang@gmail.com',
      clientIp: clientIp || '211.104.88.24',
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '연차 조정 처리 중 시스템 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
