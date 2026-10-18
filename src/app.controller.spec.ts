import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('returns a generic welcome when no name is provided', () => {
      expect(appController.getHello()).toBe('Welcome to Skillz Directory.');
    });

    it('includes the provided user name in the welcome message', () => {
      expect(appController.getHello('Alex')).toBe(
        'Hello, Alex! Welcome to Skillz Directory.',
      );
    });

    it('ignores whitespace-only names', () => {
      expect(appController.getHello('  ')).toBe('Welcome to Skillz Directory.');
    });
  });
});
