import { Test, TestingModule } from '@nestjs/testing';
import { ClientsModule, Transport, ClientProxy } from '@nestjs/microservices';
import { BotController } from './bot.controller';
import { TRANSPORT_SERVICE } from '../../app.constants';
import { TelegramService } from '../services/telegram.service';

/* Mocking TelegramService */
jest.mock('../services/telegram.service');

describe('Checking BotController', () => {
  let controller: BotController;
  let service: TelegramService;

  const client = { emit: () => {} };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ ClientsModule.register([{ name: TRANSPORT_SERVICE, transport: Transport.RMQ } ]) ],
      controllers: [ BotController ],
      providers: [ TelegramService ]
    })
    .overrideProvider(TRANSPORT_SERVICE)
    .useValue(client)
    .compile();

    controller = module.get<BotController>(BotController);
    service = module.get<TelegramService>(TelegramService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Cheking handleSendMessage(handleSendPhoto do same)', () => {
    it('handleSendMessage should call service.sendMessage', () => {
      jest.spyOn(service, 'sendMessage').mockResolvedValue();
      controller.handleSendMessage({ user:1, message: 'test' });
  
      expect(service.sendMessage).toHaveBeenCalled();
    });

    it('handleSendMessage should handle reject', async () => {
      const userParam: number = 1;
      const messageParam: string = "test";
      
      jest.spyOn(service, 'sendMessage').mockRejectedValue("Testing Error");
      jest.spyOn(controller, "handleError");
  
      await controller.handleSendMessage({ user: userParam, message: messageParam });
  
      expect(service.sendMessage).toHaveBeenCalledWith(userParam, messageParam, undefined);
      expect(controller.handleError).toHaveBeenCalled();
    });
  });

  describe('Cheking handleError', () => {
    it('should emit handle_block on 403 error', async () => {
      jest.spyOn(service, 'sendMessage').mockRejectedValue("Error: ETELEGRAM: 403");
      jest.spyOn(client, "emit");

      await controller.handleSendMessage({ user:1, message: 'test' });

      expect(client.emit).toHaveBeenCalled();
    })

    it('should emit handle_error in other case', async () => {
      jest.spyOn(service, 'sendMessage').mockRejectedValue("Error: ETELEGRAM: 404");
      jest.spyOn(client, "emit");

      await controller.handleSendMessage({ user:1, message: 'test' });

      expect(client.emit).toHaveBeenCalled();
    })
  });
});
