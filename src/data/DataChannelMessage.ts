export type IDataChannelMessage =
    IDataChannelMessageSpeech |
    IDataChannelMessageAudio |
    IDataChannelMessageVideo

export interface IDataChannelMessageSpeech {
    type: 'Speech';
    isSpeaking: boolean;
}

export interface IDataChannelMessageAudio {
    type: 'Audio';
    enabled: boolean;
}

export interface IDataChannelMessageVideo {
    type: 'Video';
    enabled: boolean;
}
