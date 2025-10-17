import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/db';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || session.user.id;

    const result = await prisma.$transaction(async (tx) => {
      const memberships = await tx.membership.findMany({
        where: {
          user_id: userId,
        },
        include: {
          org: {
            select: {
              id: true,
              name: true,
              created_at: true,
              owner_user_id: true,
            }
          }
        },
        orderBy: {
          created_at: 'desc'
        }
      });

      const formattedOrgs = memberships.map(membership => ({
        id: membership.org.id,
        name: membership.org.name,
        role: membership.role,
        created_at: membership.org.created_at,
        isOwner: membership.org.owner_user_id === userId,
      }));

      if (memberships.length > 0) {
        await tx.audit.create({
          data: {
            org_id: memberships[0].org_id,
            actor_user_id: session.user.id!,
            action: 'VIEW_ORGANIZATIONS',
            subject_type: 'org',
            ip: request.headers.get('x-forwarded-for') || 'unknown',
            ua: request.headers.get('user-agent') || 'unknown',
            meta: {
              total_orgs: formattedOrgs.length,
              user_id: userId,
            }
          }
        });
      }

      return formattedOrgs;
    });

    return NextResponse.json({
      success: true,
      data: {
        organizations: result
      }
    });

  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Organization name is required' },
        { status: 400 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {
      const org = await tx.org.create({
        data: {
          name: name.trim(),
          owner_user_id: session.user.id!,
        }
      });

      const membership = await tx.membership.create({
        data: {
          org_id: org.id,
          user_id: session.user.id!,
          role: 'owner',
          ovk_wrapped_for_user: 'placeholder_ovk',
        }
      });

      await tx.audit.create({
        data: {
          org_id: org.id,
          actor_user_id: session.user.id!,
          action: 'CREATE_ORG',
          subject_type: 'org',
          subject_id: org.id,
          ip: request.headers.get('x-forwarded-for') || 'unknown',
          ua: request.headers.get('user-agent') || 'unknown',
          meta: {
            org_name: org.name,
            created_by: session.user.id,
            membership_id: membership.id,
          }
        }
      });

      return {
        id: org.id,
        name: org.name,
        plan: 'Free',
        role: 'owner' as const,
        created_at: org.created_at,
        isOwner: true,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        organization: result
      }
    });

  } catch (error) {
    console.error('Error creating organization:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
