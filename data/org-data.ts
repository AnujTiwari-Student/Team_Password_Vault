import { prisma } from "@/db";




export const getOrgById = async (id: string) => {
    return prisma.org.findUnique({
        where: { id }
    });
}