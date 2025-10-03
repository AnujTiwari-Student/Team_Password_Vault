import { prisma } from "@/db";


export const getUserByEmail = async (email: string) => {
    const user = await prisma.user.findFirst({
        where: { email }
    });
    return user;
}

export const getUserById = async (id: string) => {
    return prisma.user.findUnique({
        where: { id }
    });
}