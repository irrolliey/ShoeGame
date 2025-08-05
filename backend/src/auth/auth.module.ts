import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { JwtStrategy } from './strategies/jwt.strategy';
//import { RolesGuard } from './guards/roles.guard';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    ConfigModule,
    // Import UsersModule to access user-related operations (e.g., finding users by email)
    UsersModule,

    // Configure the JWT module asynchronously using environment variables
    JwtModule.registerAsync({
      imports: [ConfigModule], // Allow access to config values from .env
      inject: [ConfigService], // Inject ConfigService to read env vars
      useFactory: async (configService: ConfigService) => ({
        // Set the secret key for signing JWTs
        secret: configService.get<string>('JWT_SECRET'),

        // Set the token expiration time (e.g., '1h', '7d')
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
        },
      }),
    }),
  ],

  // Register the authentication service (handles login, JWT creation, etc.)
  providers: [
    AuthService,
    JwtStrategy

  ],

  // Register the controller that exposes login/register endpoints
  controllers: [AuthController],
})
export class AuthModule {}
