import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(name?: string): string {
    const userName = name?.trim();
    return userName
      ? `Hello, ${userName}! Welcome to Skillz Directory.`
      : 'Welcome to Skillz Directory takulandilani!.';
  }
}
