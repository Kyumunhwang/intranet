import { NextRequest, NextResponse } from 'next/server';
import { createApprovalDocument } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const doc = createApprovalDocument({
      template_id: body.template_id || 't1',
      drafter_id: body.drafter_id || 'u2',
      dept_id: body.dept_id || 'd5',
      title: body.title,
      content_html: body.content_html,
      form_data: body.form_data,
      special_notes: body.special_notes,
      steps: body.steps || [
        { approver_id: 'u4', step_type: 'APPROVAL' },
        { approver_id: 'u3', step_type: 'APPROVAL' },
      ],
    });

    return NextResponse.json({ success: true, doc });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: '기안 작성 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
