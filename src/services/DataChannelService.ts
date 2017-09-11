import {
    IDataChannelMessageSpeech,
    IDataChannelMessageAudio,
    IDataChannelMessageVideo
} from '../data';

export function createDataChannelMessageSpeech(isSpeaking: boolean): IDataChannelMessageSpeech {
    return {
        type: 'Speech',
        isSpeaking: isSpeaking,
    }
}

export function createDataChannelMessageAudio(enabled: boolean): IDataChannelMessageAudio {
    return {
        type: 'Audio',
        enabled: enabled,
    }
}

export function createDataChannelMessageVideo(enabled: boolean): IDataChannelMessageVideo {
    return {
        type: 'Video',
        enabled: enabled,
    }
}
