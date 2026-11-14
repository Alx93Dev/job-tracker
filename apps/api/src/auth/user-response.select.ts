import { Prisma } from '@prisma/client';

export const userResponseSelect = {
  id: true,
  email: true,
  name: true,
} satisfies Prisma.UserSelect;
