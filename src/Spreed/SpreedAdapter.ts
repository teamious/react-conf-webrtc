import { SpreedRequest } from './SpreedRequest';
import { SpreedResponse } from './SpreedResponse';
import {
    IConfOutgoingMessage,
    IConfIncomingMessage,
    IMessageAdapter,
} from '../data'
import { TranslateSpreedMessage } from './TranslateSpreedMessage';
import { TranslateConferenceMessage } from './TranslateConferenceMessage';

// NOTE(andrews): SpreedAdapter is responsible for turning SpreedMessages into Conference messages
// and vice-versa.
export class SpreedAdapter implements IMessageAdapter {
    // NOTE(andrews): handleSpreedMessage should be called whenever you want to translate a message from spreed -> conference.
    // Not all message types will be handled
    public translateIncomingMessage(message: SpreedResponse): IConfIncomingMessage[] | IConfIncomingMessage | undefined {
        const msg = TranslateSpreedMessage(message);
        if (!msg) {
            console.log('translateIncomingMessage(): No translation was found for SpreedResponse type: %s', message.Data.Type);
            return
        }

        return msg;
    }

    // NOTE(andrews): handleConferenceMessage should be called whenever you want to translate a message from conference -> spreed.
    public translateOutgoingMessage(message: IConfOutgoingMessage): any {
        const msg = TranslateConferenceMessage(message);
        if (!msg) {
            console.log('translateOutgoingMessage(): No translation was found for IConfOutgoingMessage type: %s', message.type);
            return
        }

        return msg;
    }
}
