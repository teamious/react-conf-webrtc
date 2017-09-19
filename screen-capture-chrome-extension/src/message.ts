export const types = {
    extLoaded: 'teamious-screen-capture-ext-loaded',
    getScreenSourceId: 'teamious-screen-capture-get-source-id'
}

export const errors = {
    screenPermissionDeied: 'screenPermissionDeied'
}

export interface IMessage {
    type: string,
    data?: Object,
    error?: string
}

export function isWellKnownMessage(message: IMessage) {
    return !!types[message.type];
}
