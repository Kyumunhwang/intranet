import { NextRequest, NextResponse } from 'next/server';
import { getWorkSettings, updateWorkSettings, getEffectiveWorkSchedule } from '@/lib/db';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetDate = searchParams.get('date') || undefined;
  const settings = getWorkSettings();
  const effectiveSchedule = getEffectiveWorkSchedule(targetDate);
  return NextResponse.json({ success: true, settings, effectiveSchedule });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = updateWorkSettings(body);
    const effectiveSchedule = getEffectiveWorkSchedule();
    return NextResponse.json({
      success: true,
      message: '근태 기초 설정(월~목 자동 연동 및 특별 지정일 퇴근시간)이 성공적으로 저장되었습니다.',
      settings: updated,
      effectiveSchedule,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '근태 기초 설정 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
