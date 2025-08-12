// src/auth/roles.decorator.ts
import { SetMetadata } from '@nestjs/common'
import { Role } from 'generated/prisma' // Use the same Role enum from Prisma

export const ROLES_KEY = 'roles'
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles)
