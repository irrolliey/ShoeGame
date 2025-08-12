import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common'
import { UsersService } from 'src/users/users.service'
import { JwtService } from '@nestjs/jwt'
import * as bcrypt from 'bcrypt'
import { RegisterDto } from './dto/register.dto'
import { Role } from 'generated/prisma'
import { CreateUserDto } from 'src/users/dto/create-user.dto'
import { UpdateUserDto } from 'src/users/dto/update-user.dto'

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService
  ) {}

  /**
   * Validates user credentials against hashed password in DB
   */
  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email)

    if (!user) {
      throw new UnauthorizedException('Invalid email or password')
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid email or password')
    }

    return { id: user.id, email: user.email, role: user.role }
  }

  /**
   * Generates JWT token
   */
  async login(user: { id: string; email: string; role: string }) {
    const payload = { sub: user.id, email: user.email, role: user.role }
    return { access_token: this.jwtService.sign(payload) }
  }

  /**
   * Registers a new user (hashing done in UsersService)
   */
  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email)
    if (existingUser) {
      throw new BadRequestException('Email is already registered')
    }

    const createUserDto: CreateUserDto = {
      name: registerDto.name,
      email: registerDto.email,
      password: registerDto.password, // plain password — will be hashed in UsersService
      role: Role.CUSTOMER,
    }

    const user = await this.usersService.create(createUserDto)

    return this.login({ id: user.id, email: user.email, role: user.role })
  }

  /**
   * Updates the logged-in user (hashing done in UsersService if password changes)
   */
  async updateMe(userId: string, updateUserDto: UpdateUserDto) {
    return await this.usersService.updateMe(userId, updateUserDto)
  }
}
