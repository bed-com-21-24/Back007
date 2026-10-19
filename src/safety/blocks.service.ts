import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Block } from './entities/block.entity';

@Injectable()
export class BlocksService {
  constructor(@InjectRepository(Block) private repo: Repository<Block>) {}

  async block(blockerId: number, blockedId: number) {
    if (blockerId === blockedId) throw new BadRequestException('You cannot block yourself');
    // TODO: verify the target user exists (inject the Users repository from the auth teammate's module)
    const existing = await this.repo.findOne({ where: { blockerId, blockedId } });
    if (existing) return existing;
    return this.repo.save(this.repo.create({ blockerId, blockedId }));
  }

  async unblock(blockerId: number, blockedId: number) {
    await this.repo.delete({ blockerId, blockedId });
    return { unblocked: true };
  }

  async isBlockedEitherWay(a: number, b: number) {
    const n = await this.repo.count({ where: [{ blockerId: a, blockedId: b }, { blockerId: b, blockedId: a }] });
    return n > 0;
  }

  async assertNotBlocked(a: number, b: number) {
    if (await this.isBlockedEitherWay(a, b)) throw new ForbiddenException('You cannot message this user');
  }
}