import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

// JWT-related imports for handling JSON Web Tokens
import { JwtModule } from '@nestjs/jwt';

// Importing UsersModule to access user-related logic (like finding a user by email)
import { UsersModule } from 'src/users/users.module';

// For accessing environment variables like JWT secret and expiration time
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    // Import UsersModule so AuthService can use its methods (e.g., to find users)
    UsersModule,

    // Configure the JWT module asynchronously to use environment variables
    JwtModule.registerAsync({
      imports: [ConfigModule], // Import ConfigModule to access .env variables
      useFactory: async (config: ConfigService) => ({
        secret: config.get('JWT_SECRET'), // Get the secret key from environment
        signOptions: { 
          expiresIn: config.get('JWT_EXPIRES_IN') // Set token expiration (e.g., '1h', '7d')
        },
      }),
      inject: [ConfigService], // Inject ConfigService to access the values
    }),
  ],

  // Register AuthService for handling login, token generation, etc.
  providers: [AuthService],

  // Register the controller that exposes login/register routes
  controllers: [AuthController],
})
export class AuthModule {}
