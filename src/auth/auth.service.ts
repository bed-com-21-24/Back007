import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
   async register(registerDto: RegisterDto) {
    const existing = await this.userRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existing) throw new ConflictException('Email already registered');

    const hashed = await bcrypt.hash(registerDto.password, 10);
    const user = await this.userRepository.save(
      this.userRepository.create({ ...registerDto, password: hashed }),
    );
    return { id: user.id, name: user.name, email: user.email };
  }

    async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return {
      access_token: this.jwtService.sign({ sub: user.id, email: user.email }),
    };
  }
  async logout() {
  return {
    message: 'Logout successful',
  };
}

async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
  const user = await this.userRepository.findOne({
    where: { email: forgotPasswordDto.email },
  });

  if (!user) {
    return {
      message: 'User not found',
    };
  }

  return {
    message: 'Password reset request received',
  };
}

async resetPassword(resetPasswordDto: ResetPasswordDto) {
  const user = await this.userRepository.findOne({
    where: { email: resetPasswordDto.email },
  });

  if (!user) {
    return {
      message: 'User not found',
    };
  }

  user.password = resetPasswordDto.newPassword;

  await this.userRepository.save(user);

  return {
    message: 'Password reset successful',
  };
}
}