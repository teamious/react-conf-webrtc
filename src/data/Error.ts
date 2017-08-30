export type ConferenceError = ConferenceErrorWebcamPermissions |
    ConferenceErrorMicPermissions |
    ConferenceErrorSetLocalDescription |
    ConferenceErrorSetRemoteDescription |
    ConferenceErrorCreateOffer |
    ConferenceErrorCreateAnswer |
    ConferenceErrorWebRTCNotSupported |
    ConferenceErrorGetUserMedia;

export interface ConferenceErrorWebcamPermissions {
    type: 'ConferenceErrorWebcamPermissions';
}

export interface ConferenceErrorMicPermissions {
    type: 'ConferenceErrorMicPermissions';
}

export interface ConferenceErrorSetLocalDescription {
    type: 'ConferenceErrorSetLocalDescription';
    error: any;
    id: string;
}

export interface ConferenceErrorSetRemoteDescription {
    type: 'ConferenceErrorSetRemoteDescription';
    error: any;
    id: string;
}

export interface ConferenceErrorCreateOffer {
    type: 'ConferenceErrorCreateOffer';
    error: any;
    id: string;
}

export interface ConferenceErrorCreateAnswer {
    type: 'ConferenceErrorCreateAnswer';
    error: any;
    id: string;
}

export interface ConferenceErrorWebRTCNotSupported {
    type: 'ConferenceErrorWebRTCNotSupported';
}

export interface ConferenceErrorGetUserMedia {
    type: 'ConferenceErrorGetUserMedia';
    error: MediaStreamError;
}

export const ConferenceError = {
    WebcamPermissions: 'ConferenceErrorWebcamPermissions',
    MicPermissions: 'ConferenceErrorMicPermissions',
    SetLocalDescription: 'ConferenceErrorSetLocalDescription',
    SetRemoteDescription: 'ConferenceErrorSetRemoteDescription',
    CreateOffer: 'ConferenceErrorCreateOffer',
    CreateAnswer: 'ConferenceErrorCreateAnswer',
    WebRTCNotSupported: 'ConferenceErrorWebRTCNotSupported',
    GetUserMedia: 'ConferenceErrorGetUserMedia',
}
