import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { isObservable, lastValueFrom } from 'rxjs';
import { Repository } from 'typeorm';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AdminAuthGuard implements CanActivate {
  constructor(
    private readonly jwtAuthGuard: JwtAuthGuard,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const authentication = this.jwtAuthGuard.canActivate(context);
    const authenticated = isObservable(authentication)
      ? await lastValueFrom(authentication)
      : await authentication;

    if (!authenticated) {
      return false;
    }

    const request = context.switchToHttp().getRequest<{
      user?: { id?: number };
    }>();
    const userId = request.user?.id;
    if (
      typeof userId !== 'number' ||
      !Number.isSafeInteger(userId) ||
      userId < 1
    ) {
      throw new UnauthorizedException('Authenticated user ID not found');
    }

    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: { id: true, role: true, status: true },
    });
    if (!user) {
      throw new UnauthorizedException('Authenticated user no longer exists');
    }
    if (user.role !== 'admin' || user.status !== 'active') {
      throw new ForbiddenException('Administrator access required');
    }

    return true;
  }
}
