import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  /**
   * Validates a user's email and password.
   * Throws UnauthorizedException if invalid.
   */
  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // ✅ Return user with role
    return {
      id: user.id,
      email: user.email,
      role: user.role, // 👈 make sure this exists in your user model and SELECT it in prisma
    };
  }

  /**
   * Signs and returns a JWT token based on the validated user.
   */
  async login(user: { id: string; email: string; role: string }) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  /**
   * Registers a new user, hashes the password, and returns a token.
   */
  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersService.findByEmail(registerDto.email);

    if (existingUser) {
      throw new BadRequestException('Email is already registered');
    }

    const user = await this.usersService.create(registerDto);

    // ✅ Return login token after successful registration
    return this.login({
      id: user.id,
      email: user.email,
      role: user.role,
    });
  }
}
