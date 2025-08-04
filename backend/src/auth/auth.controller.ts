import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto'
import { RegisterDto } from './dto/register.dto';
@Controller('auth') // Marks this class as a controller to handle incoming HTTP requests
export class AuthController {
  constructor(
    private readonly authService: AuthService // Inject the AuthService for handling login logic
  ) {}

  //register endpoitn: POST/auth/register
  @Post('register')
  async register(@Body() registerDto:RegisterDto){
    return this.authService.register(registerDto);
  }

  // Handle POST requests to /login
  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    // Step 1: Validate user credentials using the AuthService
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password
    );

    // Step 2: If credentials are valid, generate and return a JWT token
    return this.authService.login(user);
  }
}
