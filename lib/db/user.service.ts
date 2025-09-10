import { prisma } from "./client";

export async function createUser(userData: {
  name: string;
  email: string;
  password: string;
}) {
  return await prisma.user.create({
    data: userData,
  });
}

export async function getUserByEmail(email: string) {
  return await prisma.user.findUnique({
    where: { email },
  });
}