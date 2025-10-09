import { prisma } from "@/db";



export const getVaultByUserId = async (userId: string) => {
    return prisma.vault.findFirst({
        where: { user_id: userId }
    });
}

export const getVaultByOrgId = async (orgId: string) => {
    return prisma.vault.findFirst({
        where: { org_id: orgId }
    });
}