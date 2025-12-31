import { prisma } from '@/db';
import { currentUser } from '@/lib/current-user';
import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/utils/permission-utils';

interface CreateOrgRequest {
  name: string;
  description?: string;
}

export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    
    if (!user || !user.id) {
      return NextResponse.json({ 
        error: 'Unauthorized',
        message: 'You must be logged in to create an organization'
      }, { status: 401 });
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        org: true,
        member: true
      }
    });

    if (!isAdmin(userData)) {
      return NextResponse.json({ 
        error: 'Forbidden',
        message: 'Only administrators can create organizations'
      }, { status: 403 });
    }

    const body: CreateOrgRequest = await req.json();
    const { name, description } = body;

    if (!name || name.trim().length === 0) {
      return NextResponse.json({ 
        error: 'Validation Error',
        message: 'Organization name is required'
      }, { status: 400 });
    }

    if (name.length > 100) {
      return NextResponse.json({ 
        error: 'Validation Error',
        message: 'Organization name must be less than 100 characters'
      }, { status: 400 });
    }

    const existingOrg = await prisma.organization.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive'
        }
      }
    });

    if (existingOrg) {
      return NextResponse.json({ 
        error: 'Conflict',
        message: 'An organization with this name already exists'
      }, { status: 409 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const vault = await tx.vault.create({
        data: {
          name: `${name} Vault`,
          type: 'org',
        }
      });

      const organization = await tx.organization.create({
        data: {
          name: name.trim(),
          description: description?.trim(),
          owner_user_id: user.id,
          vault_id: vault.id,
        }
      });

      await tx.vault.update({
        where: { id: vault.id },
        data: { org_id: organization.id }
      });

      await tx.membership.create({
        data: {
          user_id: user.id,
          org_id: organization.id,
          role: 'owner',
          ovk_wrapped_for_user: '',
        }
      });

      return { organization, vault };
    });

    return NextResponse.json({
      success: true,
      message: 'Organization created successfully',
      data: {
        organization: result.organization,
        vault: result.vault
      }
    }, { status: 201 });

  } catch (error) {
    console.error('Organization creation error:', error);
    return NextResponse.json({ 
      error: 'Internal Server Error',
      message: 'Failed to create organization',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 });
  }
}
