import {
    IDataChannelMessageSpeech
} from '../data';

export function createDataChannelMessageSpeech(isSpeaking: boolean): IDataChannelMessageSpeech {
    return {
        type: 'Speech',
        isSpeaking: isSpeaking,
    }
}
