import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as TeleBot from 'telebot';
  
const BOT_API_KEY = '';

@Injectable()
export class TelegramService {
    private readonly bot: TeleBot;
    
    constructor(private readonly configService: ConfigService) {
        this.bot = new TeleBot(this.configService.get<string>('BOT_TOKEN')); /* new TeleBot could throw error */
    }

    onApplicationBootstrap() {
        this.bot.start();
    }

    incomeHandler(func) {
        this.bot.on('text', func);
    }

    eventHandler(func) {
        this.bot.on('event', func);
    }

    sendMessage(user: number, message: string, opts?: any): Promise<void> {
        return this.bot.sendMessage(user, message, opts);
    }

    sendPhoto(user: number, img: string, opts?: any): Promise<void> {
        return this.bot.sendPhoto(user, img, opts);
    }
}