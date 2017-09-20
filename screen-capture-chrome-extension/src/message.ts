export const types: { [string: string]: string } = {
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
    id: string | number;
    action: string,
    type: string,
    data?: Object,
    error?: string
}

export function isWellKnownMessage(message: IMessage): boolean {
    for (var type in types) {
        if (types[type] === message.type) {
            return true;
        }
    }

    return false;
}
