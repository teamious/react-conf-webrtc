import * as data from '../data';

export function createConferenceErrorWebcamPermissions(): data.ConferenceErrorWebcamPermissions {
    return {
        type: 'ConferenceErrorWebcamPermissions',
    }
}

export function createConferenceErrorMicPermissions(): data.ConferenceErrorMicPermissions {
    return {
        type: 'ConferenceErrorMicPermissions',
    }
}

export function createConferenceErrorSetLocalDescription(error: any, id: string): data.ConferenceErrorSetLocalDescription {
    return {
        type: 'ConferenceErrorSetLocalDescription',
        error,
        id,
    }
}

export function createConferenceErrorSetRemoteDescription(error: any, id: string): data.ConferenceErrorSetRemoteDescription {
    return {
        type: 'ConferenceErrorSetRemoteDescription',
        error,
        id,
    }
}

export function createConferenceErrorCreateOffer(error: any, id: string): data.ConferenceErrorCreateOffer {
    return {
        type: 'ConferenceErrorCreateOffer',
        error,
        id,
    }
}

export function createConferenceErrorCreateAnswer(error: any, id: string): data.ConferenceErrorCreateAnswer {
    return {
        type: 'ConferenceErrorCreateAnswer',
        error,
        id,
    }
}

export function createConferenceErrorWebRTCNotSupported(): data.ConferenceErrorWebRTCNotSupported {
    return {
        type: 'ConferenceErrorWebRTCNotSupported',
    }
}

export function createConferenceErrorGetUserMedia(error: any): data.ConferenceErrorGetUserMedia {
    return {
        type: 'ConferenceErrorGetUserMedia',
        error,
    }
}

export function createConferenceErrorConnect(): data.ConferenceErrorConnect {
    return {
        type: 'ConferenceErrorConnect'
    }
}

export function createConferenceErrorEnumerateDevices(error: any): data.ConferenceErrorEnumerateDevices {
    return {
        type: 'ConferenceErrorEnumerateDevices',
        error,
    }
}

export function createConferenceErrorIncomingMessage(error: any): data.ConferenceErrorIncomingMessage {
    return {
        type: 'ConferenceErrorIncomingMessage',
        error
    }
}
