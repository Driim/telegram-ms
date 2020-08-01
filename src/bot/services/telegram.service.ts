import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as TeleBot from 'telebot';

@Injectable()
export class TelegramService {
  private readonly bot: TeleBot;

  constructor(private readonly configService: ConfigService) {
    const proxy = this.configService.get<string>('PROXY_URL');
    this.bot = new TeleBot({
      token: this.configService.get<string>('BOT_TOKEN'),
      polling: { proxy },
    }); /* new TeleBot could throw error */
  }

  onApplicationBootstrap(): void {
    this.bot.start();
  }

  incomeHandler(func: TeleBot.genericCb): void {
    this.bot.on('text', func);
  }

  eventHandler(func: TeleBot.genericCb): void {
    this.bot.on('event', func);
  }

  sendMessage(user: number, message: string, opts?: any): Promise<void> {
    let replyMarkup = undefined;
    if (opts) {
      replyMarkup = this.bot.keyboard(opts.keyboard, {
        resize: opts.resizeKeyboard,
        once: opts.oneTimeKeyboard,
        remove: opts.removeKeyboard
      });
    }
    return this.bot.sendMessage(user, message, { replyMarkup });
  }

  sendPhoto(user: number, img: string, opts?: any): Promise<void> {
    return this.bot.sendPhoto(user, img, opts);
  }
}
