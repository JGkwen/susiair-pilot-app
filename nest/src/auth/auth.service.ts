import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto, LoginResponseDto } from './dto/login.dto';

const PILOT_USERNAME = 'johndoe';
const PILOT_PASSWORD = 'susiairtest';
const TOKEN_TTL_SECONDS = 12 * 60 * 60;

@Injectable()
export class AuthService {
  constructor(private readonly jwt: JwtService) {}

  async login({ username, password }: LoginDto): Promise<LoginResponseDto> {
    if (username !== PILOT_USERNAME || password !== PILOT_PASSWORD) {
      throw new UnauthorizedException('Invalid username or password');
    }
    const accessToken = await this.jwt.signAsync(
      { sub: username },
      { expiresIn: TOKEN_TTL_SECONDS },
    );
    return { accessToken, tokenType: 'Bearer', expiresIn: TOKEN_TTL_SECONDS };
  }
}
