import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async onModuleInit() {
    const email = this.configService.getOrThrow<string>('ADMIN_EMAIL').trim();
    const password = this.configService.getOrThrow<string>('ADMIN_PASSWORD');
    const resetExistingPassword =
      this.configService.get<string>('ADMIN_RESET_PASSWORD_ON_STARTUP') ===
      'true';

    if (!email || password.length < 8) {
      throw new Error(
        'ADMIN_EMAIL must be set and ADMIN_PASSWORD must be at least 8 characters',
      );
    }

    const existingAdmin = await this.userRepository.findOne({
      where: { email },
    });

    if (existingAdmin) {
      let changed = false;
      if (existingAdmin.role !== 'admin') {
        existingAdmin.role = 'admin';
        changed = true;
      }
      if (existingAdmin.status !== 'active') {
        existingAdmin.status = 'active';
        changed = true;
      }
      if (resetExistingPassword) {
        existingAdmin.password = await bcrypt.hash(password, 10);
        changed = true;
      }
      if (changed) {
        await this.userRepository.save(existingAdmin);
      }
      return;
    }

    const admin = this.userRepository.create({
      name: 'System Administrator',
      email,
      password: await bcrypt.hash(password, 10),
      role: 'admin',
      status: 'active',
    });
    await this.userRepository.save(admin);
  }

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

  async forgotPassword(_forgotPasswordDto: ForgotPasswordDto) {
    return {
      message:
        'Password recovery by email is not available. Sign in and use POST /auth/change-password, or contact an administrator.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto, userId: number) {
    const user = await this.userRepository.findOne({
      where: { email: resetPasswordDto.email },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.id !== userId) {
      throw new ForbiddenException('You can only reset your own password');
    }

    user.password = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    await this.userRepository.save(user);

    return {
      message: 'Password reset successful',
    };
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (!(await bcrypt.compare(currentPassword, user.password))) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);

    return { message: 'Password changed successfully' };
  }
}
