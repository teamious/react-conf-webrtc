export type IDataChannelMessage = IDataChannelMessageSpeech

export interface IDataChannelMessageSpeech {
    type: 'Speech';
    isSpeaking: boolean;
}
