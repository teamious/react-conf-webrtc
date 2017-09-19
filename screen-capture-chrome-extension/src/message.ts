export const types = {
    extLoaded: 'teamious-screen-capture-ext-loaded',
    getScreenSourceId: 'teamious-screen-capture-get-source-id'
}

export const actions = {
    call: 'teamious-screen-capture-call',
    answer: 'teamious-screen-capture-answer'
}

export const errors = {
    screenPermissionDeied: 'screenPermissionDeied'
}

export interface IMessage {
    id: string;
    action: string,
    type: string,
    data?: Object,
    error?: string
}

export function isWellKnownMessage(message: IMessage) {
    return !!types[message.type];
}
