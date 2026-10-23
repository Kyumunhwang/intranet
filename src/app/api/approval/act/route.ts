import { NextRequest, NextResponse } from 'next/server';
import { processApprovalStep } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = processApprovalStep({
      doc_id: body.doc_id,
      step_id: body.step_id,
      approver_id: body.approver_id || 'u4',
      action: body.action || 'APPROVE',
      comment: body.comment,
      signature_text: body.signature_text,
    });

    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '결재 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
