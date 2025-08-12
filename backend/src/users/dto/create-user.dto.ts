// src/users/dto/create-user.dto.ts
import { Role } from 'generated/prisma'

export class CreateUserDto {
  name: string
  email: string
  password: string
  role: Role
}
