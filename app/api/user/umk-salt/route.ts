import { prisma } from '@/db';
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { umk_salt: true }
    });

    if (!user?.umk_salt) {
      return NextResponse.json({ error: 'UMK salt not found' }, { status: 404 });
    }

    return NextResponse.json({ umk_salt: user.umk_salt });
  } catch (error) {
    console.error('Error fetching UMK salt:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
