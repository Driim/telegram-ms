import { Controller, Inject, ValidationPipe, UsePipes, Logger } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { TRANSPORT_SERVICE, TgErrorPattern } from '../../app.constants';
import { MessageDto } from '../dto/message.dto';
import { TelegramService } from '../services/telegram.service';
import { Observable } from 'rxjs';

interface TelegramError {
  toString(): string;
}

interface HandleError {
  user: number;
  error: TelegramError;
}

@Controller()
export class BotController {
  private readonly logger = new Logger(BotController.name);

  constructor(
    @Inject(TRANSPORT_SERVICE) private readonly client: ClientProxy,
    private readonly bot: TelegramService,
  ) {
    this.bot.incomeHandler(this.handleIncome);
    this.bot.eventHandler(this.handleEvent);
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.client.connect();
  }

  handleEvent = (event: unknown): void => {
    /* TODO: made event handler */
    this.logger.warn(event);
  };

  handleIncome = (message: unknown): Observable<void> => {
    return this.client.emit('received_message', message);
  };

  async handleError(error: TelegramError, user: number): Promise<Observable<void>> {
    const result: RegExpMatchArray = error.toString().match(TgErrorPattern);

    if (result && result[1] === '403') {
      return this.client.emit<void, number>('handle_block', user);
    }

    return this.client.emit<void, HandleError>('handle_error', { user, error });
  }

  @EventPattern('send_message')
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleSendMessage(data: MessageDto): Promise<void> {
    await this.bot
      .sendMessage(data.user, data.message, data.opts)
      .catch(error => this.handleError(error, data.user));
  }

  @EventPattern('send_photo')
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleSendPhoto(data: MessageDto): Promise<void> {
    await this.bot
      .sendPhoto(data.user, data.message, data.opts)
      .catch(error => this.handleError(error, data.user));
  }
}
