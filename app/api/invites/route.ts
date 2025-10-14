import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/db";
import { AddMemberSchema } from "@/schema/zod-schema";
import { APIResponse, InviteResponse } from "@/types/api-responses";
import { auth } from "@/lib/auth";

export async function POST(request: NextRequest): Promise<NextResponse<APIResponse<InviteResponse>>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        errors: { _form: ["Unauthorized"] }
      }, { status: 401 });
    }

    const data = await request.json();
    const validatedData = AddMemberSchema.parse(data);

    const canAddMember = await prisma.membership.findFirst({
      where: {
        user_id: session.user.id,
        org_id: data.org_id,
        role: { in: ['owner', 'admin'] }
      }
    });

    if (!canAddMember) {
      return NextResponse.json({
        success: false,
        errors: { _form: ["Organization not found or insufficient permissions"] }
      }, { status: 403 });
    }

    const existingMember = await prisma.membership.findFirst({
      where: { 
        org_id: data.org_id,
        user: {
          email: validatedData.email
        }
      }
    });

    if (existingMember) {
      return NextResponse.json({
        success: false,
        errors: { _form: ["User is already a member of this organization"] }
      }, { status: 400 });
    }

    const existingInvitation = await prisma.invite.findFirst({
      where: {
        org_id: data.org_id,
        email: validatedData.email,
        status: 'pending'
      }
    });

    if (existingInvitation) {
      return NextResponse.json({
        success: false,
        errors: { _form: ["Invitation already sent to this email"] }
      }, { status: 400 });
    }

    const invitation = await prisma.invite.create({
      data: {
        org_id: data.org_id,
        email: validatedData.email,
        role: validatedData.role,
        invited_by: session.user.id,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      }
    });

    return NextResponse.json({
      success: true,
      message: "Invitation sent successfully",
      data: {
        invitation: {
          id: invitation.id,
          team_id: data.org_id,
          email: invitation.email,
          role: invitation.role as 'member' | 'admin',
          status: 'pending' as const,
          invited_by: invitation.invited_by,
          invited_at: invitation.created_at.toISOString(),
          expires_at: invitation.expires_at.toISOString()
        }
      }
    }, { status: 201 });

  } catch (error: unknown) {
    console.error("Invite error:", error);
    return NextResponse.json({
      success: false,
      errors: { _form: [error instanceof Error ? error.message : "Internal server error"] }
    }, { status: 500 });
  }
}
