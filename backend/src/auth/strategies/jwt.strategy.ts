import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Look for token in Authorization header
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET'), // Use your .env secret
    });
  }

  async validate(payload: any) {
    // This is the payload from the JWT token. You can return a user object or subset.
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
