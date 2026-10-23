import { NextRequest, NextResponse } from 'next/server';
import { getAllowedIPs, addAllowedIP, deleteAllowedIP } from '@/lib/db';

export async function GET() {
  const ips = getAllowedIPs();
  return NextResponse.json(ips);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newIp = addAllowedIP(body.ip_address, body.description, body.ip_type);
    return NextResponse.json({ success: true, ip: newIp });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'IP 등록 실패' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (id) deleteAllowedIP(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'IP 삭제 실패' }, { status: 500 });
  }
}
