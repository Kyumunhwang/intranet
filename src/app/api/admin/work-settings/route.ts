import { NextRequest, NextResponse } from 'next/server';
import { getWorkSettings, updateWorkSettings } from '@/lib/db';

export async function GET() {
  const settings = getWorkSettings();
  return NextResponse.json({ success: true, settings });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const updated = updateWorkSettings(body);
    return NextResponse.json({
      success: true,
      message: '근태 기초 설정(요일별 퇴근시간 및 방학 모드)이 성공적으로 저장되었습니다.',
      settings: updated,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '근태 기초 설정 저장 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
