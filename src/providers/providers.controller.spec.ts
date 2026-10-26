import { Test, TestingModule } from '@nestjs/testing';
import { ProviderDiscoveryController } from './provider-discovery.controller';
import { ProviderDiscoveryService } from './provider-discovery.service';

describe('ProviderDiscoveryController', () => {
  let controller: ProviderDiscoveryController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProviderDiscoveryController],
      providers: [
        {
          provide: ProviderDiscoveryService,
          useValue: {
            search: jest.fn(),
            findOne: jest.fn(),
            listCategories: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProviderDiscoveryController>(
      ProviderDiscoveryController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});