import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { BotController } from './controllers/bot.controller';
import { TRANSPORT_SERVICE } from '../app.constants';
import { TelegramService } from './services/telegram.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: TRANSPORT_SERVICE,
        transport: Transport.REDIS,
        /* TODO: move to configuration */
        options: { url: 'redis://localhost:6379' },
      },
    ]),
  ],
  controllers: [BotController],
  providers: [TelegramService],
})
export class BotModule {}
