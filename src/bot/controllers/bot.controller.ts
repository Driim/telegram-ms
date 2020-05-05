import { Controller, Inject, ValidationPipe, UsePipes, Logger } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { TRANSPORT_SERVICE, TgErrorPattern } from '../../app.constants';
import { MessageDto } from '../dto/message.dto';
import { TelegramService } from '../services/telegram.service';
import { Observable } from 'rxjs';
import dashbot from 'dashbot';
import { ConfigService } from '@nestjs/config';

interface TelegramError {
  toString(): string;
}

interface HandleError {
  user: number;
  error: string;
  type: string;
}

class TelegramMessage {
  id: number;
  username: string;
  message: string;
}

@Controller()
export class BotController {
  private readonly logger = new Logger(BotController.name);
  private dashbot = null;

  constructor(
    @Inject(TRANSPORT_SERVICE) private readonly client: ClientProxy,
    private readonly bot: TelegramService,
    private readonly configService: ConfigService,
  ) {
    this.bot.incomeHandler(this.handleIncome);
    this.bot.eventHandler(this.handleEvent);

    const apiKey = this.configService.get<string>('DASHBOT_API_KEY');

    if (apiKey) {
      this.dashbot = dashbot(apiKey).universal;
    } else {
      this.logger.log('Working without dashbot');
    }
  }

  async onApplicationBootstrap(): Promise<void> {
    await this.client.connect();
  }

  handleEvent = (event: unknown): void => {
    /* TODO: made event handler */
    this.logger.warn(event);
  };

  handleIncome = (data: any): Observable<void> => {
    if (this.dashbot) {
      this.dashbot.logIncoming(data);
    }

    const message: TelegramMessage = {
      id: data.from.id,
      username: data.from.username,
      message: data.text,
    };

    return this.client.emit('received_message', message);
  };

  async handleError(error: TelegramError, user: number): Promise<Observable<void>> {
    const result: RegExpMatchArray = error.toString().match(TgErrorPattern);

    if (result && result[1] === '403') {
      return this.client.emit<void, number>('handle_block', user);
    }

    return this.client.emit<void, HandleError>('handle_error', { user, error: error.toString(), type: 'TMS:send' });
  }

  @EventPattern('send_message')
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleSendMessage(data: MessageDto): Promise<void> {
    if (this.dashbot) {
      this.dashbot.logOutgoing(data);
    }

    await this.bot
      .sendMessage(data.user, data.message, data.opts)
      .catch(error => this.handleError(error, data.user));
  }

  @EventPattern('send_photo')
  @UsePipes(new ValidationPipe({ transform: true }))
  async handleSendPhoto(data: MessageDto): Promise<void> {
    if (this.dashbot) {
      this.dashbot.logOutgoing(data);
    }

    await this.bot
      .sendPhoto(data.user, data.message, data.opts)
      .catch(error => this.handleError(error, data.user));
  }
}
