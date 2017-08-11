import { SpreedRequest } from './SpreedRequest';
import { SpreedResponse } from './SpreedResponse';
import {
    IConfOutgoingMessage,
    IConfIncomingMessage,
} from '../data/ConferenceMessage'
import { TranslateSpreedMessage } from './TranslateSpreedMessage';
import { TranslateConferenceMessage } from './TranslateConferenceMessage';

// NOTE(andrews): SpreedAdapter is responsible for turning SpreedMessages into Conference messages
// and vice-versa. If either receiving end has no receiver, it will queue the messages.
export class SpreedAdapter {
    private conferenceMessageHandler?: AdapterHandlerConferenceMessage;
    private spreedMessageHandler?: AdapterHandlerSpreedMessage;
    private conferenceMessages: IConfIncomingMessage[] = [];
    private spreedMessages: SpreedRequest[] = []

    // NOTE(andrews): handleSpreedMessage should be called whenever you want to translate a message from spreed -> conference.
    // Not all message types will be handled
    public handleSpreedMessage(message: SpreedResponse): void {
        const msg = TranslateSpreedMessage(message);
        if (!msg) {
            console.log('handleSpreedMessage(): No translation was found for SpreedResponse type: %s', message.Data.Type);
            return;
        }
        if (msg instanceof Array) {
            msg.forEach(m => {
                this.sendConferenceMessage(m);
            });
            return
        }
        this.sendConferenceMessage(msg);
    }

    // NOTE(andrews): handleConferenceMessage should be called whenever you want to translate a message from conference -> spreed.
    public handleConferenceMessage(message: IConfOutgoingMessage): void {
        const msg = TranslateConferenceMessage(message);
        if (!msg) {
            console.log('handleConferenceMessage(): No translation was found for IConfOutgoingMessage type: %s', message.type);
            return
        }
        this.sendSpreedMessage(msg);
    }

    // NOTE(andrews): onConferenceMessage is used to notify your handler when a conference message is available.
    set onConferenceMessage(handler: AdapterHandlerConferenceMessage) {
        this.conferenceMessageHandler = handler;
        this.processConferenceMessages();
    }

    // NOTE(andrews): onSpreedMessage is used to notify your handler when a spreed message is available.
    set onSpreedMessage(handler: AdapterHandlerSpreedMessage) {
        this.spreedMessageHandler = handler;
        this.processSpreedMessages();
    }

    // NOTE(andrews): processConferenceMessages will process all of the queued conference messages.
    // If no handler is defined this function will return before attempting to process the queue.
    private processConferenceMessages() {
        if (!this.conferenceMessageHandler) {
            return;
        }
        while (this.conferenceMessages.length > 0) {
            const message = this.conferenceMessages.shift();
            if (!message) {
                console.warn('processConferenceMessages(): undefined message in queue');
                continue
            }
            this.conferenceMessageHandler(message);
        }
    }

    // NOTE(andrews): processSpreedMessages will process all of the queued spreed messages.
    // If no handler is defined this function will return before attempting to process the queue.
    private processSpreedMessages() {
        if (!this.spreedMessageHandler) {
            return;
        }
        while (this.spreedMessages.length > 0) {
            const message = this.spreedMessages.shift();
            if (!message) {
                console.warn('processSpreedMessages(): undefined message in queue');
                continue
            }
            this.spreedMessageHandler(message);
        }
    }

    // NOTE(andrews): sendConferenceMessage is used to send a conference message to the handler. If no handler
    // is defined the message will be queued.
    private sendConferenceMessage(message: IConfIncomingMessage) {
        if (this.conferenceMessageHandler) {
            this.conferenceMessageHandler(message);
            return
        }
        this.conferenceMessages.push(message);
    }

    // NOTE(andrews): sendSpreedMessage is used to send a conference message to the handler. If no handler
    // is defined the message will be queued.
    private sendSpreedMessage(message: SpreedRequest) {
        if (this.spreedMessageHandler) {
            this.spreedMessageHandler(message);
            return
        }
        this.spreedMessages.push(message);
    }
}

export interface AdapterHandlerConferenceMessage {
    (message: IConfIncomingMessage): void;
}

export interface AdapterHandlerSpreedMessage {
    (message: SpreedRequest): void;
}
