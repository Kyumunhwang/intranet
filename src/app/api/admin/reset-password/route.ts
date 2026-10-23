import { NextRequest, NextResponse } from 'next/server';
import { resetTeacherPasswordTo1234 } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = resetTeacherPasswordTo1234(body.teacher_id);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '비밀번호 리셋 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
