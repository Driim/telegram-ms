import { Module } from '@nestjs/common';
import { Transport, ClientProxyFactory } from '@nestjs/microservices';
import { BotController } from './controllers/bot.controller';
import { TRANSPORT_SERVICE } from '../app.constants';
import { TelegramService } from './services/telegram.service';
import { ConfigService } from '@nestjs/config';

@Module({
  controllers: [BotController],
  providers: [
    TelegramService,
    {
      provide: TRANSPORT_SERVICE,
      useFactory: (configService: ConfigService): any => {
        const url = configService.get<string>('REDIS_URL');
        return ClientProxyFactory.create({
          transport: Transport.REDIS,
          options: { url },
        });
      },
      inject: [ConfigService],
    },
  ],
})
export class BotModule {}
