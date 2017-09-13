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

export function createDataChannelMessageAudio(id: string, enabled: boolean): IDataChannelMessageAudio {
    return {
        type: 'Audio',
        enabled: enabled,
        id,
    }
}

export function createDataChannelMessageVideo(id: string, enabled: boolean): IDataChannelMessageVideo {
    return {
        type: 'Video',
        enabled: enabled,
        id,
    }
}
