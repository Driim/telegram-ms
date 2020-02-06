import { Controller, Inject, ValidationPipe, UsePipes, Logger } from '@nestjs/common';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { TRANSPORT_SERVICE, TgErrorPattern } from '../../app.constants';
import { MessageDto } from '../dto/message.dto';
import { TelegramService } from '../services/telegram.service';

interface ITelegramError {
    toString(): string
}

@Controller()
export class BotController {
    private readonly logger = new Logger(BotController.name);

    constructor(@Inject(TRANSPORT_SERVICE) private readonly client: ClientProxy,
                private readonly bot: TelegramService) {
        this.bot.incomeHandler(this.handleIncome);
        this.bot.eventHandler(this.handleEvent);
    }

    async onApplicationBootstrap() {
        await this.client.connect();
    }

    handleEvent = (event: any): void => {
        /* TODO: made event handler */
        this.logger.warn(event);
    }

    handleIncome = (message: any): any => {
        this.logger.log(`received: ${message.text}`);
        return this.client.emit('received_message', message);
    }

    async handleError(error: ITelegramError, user: number) {
        const result: RegExpMatchArray | null = error.toString().match(TgErrorPattern);

        if(result !== null && result[1] === '403') {
            return this.client.emit<void, number>('handle_block', user);
        }

        return this.client.emit<[void, any]>('handle_error', [ user, error ]);
    }

    @EventPattern('send_message')
    @UsePipes(new ValidationPipe({ transform: true }))
    async handleSendMessage(data: MessageDto) {
        await this.bot.sendMessage(data.user, data.message, data.opts)
            .catch(error => this.handleError(error, data.user));
    }

    @EventPattern('send_photo')
    @UsePipes(new ValidationPipe({ transform: true }))
    async handleSendPhoto(data: MessageDto) {
        await this.bot.sendPhoto(data.user, data.message, data.opts)
            .catch(error => this.handleError(error, data.user));
    }
}