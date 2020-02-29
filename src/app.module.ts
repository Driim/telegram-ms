import { Module } from '@nestjs/common';
import { BotModule } from './bot/bot.module';
import { ConfigModule } from '@nestjs/config';

const filePath: string = process.env.CONFIGURATION_PATH || 'dev.configuration.env';

@Module({
  imports: [BotModule, ConfigModule.forRoot({ envFilePath: filePath, isGlobal: true })],
  controllers: [],
  providers: [],
})
export class AppModule {}
