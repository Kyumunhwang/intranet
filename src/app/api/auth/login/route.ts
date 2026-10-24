import { NextRequest, NextResponse } from 'next/server';
import { verifyLogin } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: '이메일과 비밀번호를 모두 입력해 주십시오.' },
        { status: 400 }
      );
    }

    const result = verifyLogin(email, password);
    if (!result.success) {
      return NextResponse.json(result, { status: 401 });
    }

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '로그인 처리 중 서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
