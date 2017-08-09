// NOTE(yunsi): This file contains most of the incoming and outgoing messages of the conference component.
export type IConfIncomingMessage =
    IConfMessageConference |
    IConfIncomingMessageCandidate |
    IConfIncomingMessageOffer |
    IConfIncomingMessageAnswer |
    IConfMessageAddPeer |
    IConfMessageRemovePeer

export type IConfOutgoingMessage =
    IConfMessageJoin |
    IConfOutgoingMessageCandidate |
    IConfOutgoingMessageOffer |
    IConfOutgoingMessageAnswer |
    IConfMessageBye

// NOTE(yunsi): IConfMessageJoin is sent out when you try to join a conference room.
export interface IConfMessageJoin {
    type: 'Join';
    room: ConfRoom;
}

// NOTE(yunsi): IConfMessageConference is received when you joind a conference room, it contains an array of the id of users in the conference room.
export interface IConfMessageConference {
    type: 'Conference';
    conference: ConfUserID[];
}

export interface IConfMessageCandidate {
    type: 'Candidate';
    candidate: RTCIceCandidate;
}

// NOTE(yunsi): IConfIncomingMessageCandidate contains the IceCandidate information you received from other clients.
export interface IConfIncomingMessageCandidate extends IConfMessageCandidate {
    from: ConfUserID;
}

// NOTE(yunsi): IConfIncomingMessageCandidate contains the IceCandidate information you sent to other clients.
export interface IConfOutgoingMessageCandidate extends IConfMessageCandidate {
    to: ConfUserID;
}

export interface IConfMessageOffer {
    type: 'Offer';
    sessionDescription: RTCSessionDescription;
}

// NOTE(yunsi): IConfIncomingMessageOffer contains the offer you received from other clients.
export interface IConfIncomingMessageOffer extends IConfMessageOffer {
    from: ConfUserID;
}

// NOTE(yunsi): IConfOutgoingMessageOffer contains the offer you sent to other clients.
export interface IConfOutgoingMessageOffer extends IConfMessageOffer {
    to: ConfUserID;
}

export interface IConfMessageAnswer {
    type: 'Answer';
    sessionDescription: RTCSessionDescription;
}

// NOTE(yunsi): IConfIncomingMessageAnswer contains the answer you received from other clients.
export interface IConfIncomingMessageAnswer extends IConfMessageAnswer{
    from: ConfUserID;
}

// NOTE(yunsi): IConfOutgoingMessageAnswer contains the answer you sent to other clients.
export interface IConfOutgoingMessageAnswer extends IConfMessageAnswer{
    to: ConfUserID;
}

// NOTE(yunsi): IConMessageAddPeer is received when you need to create and send an offer.
export interface IConfMessageAddPeer {
    type: 'AddPeer';
    Id: ConfUserID;
}

// NOTE(yunsi): IConMessageRemovePeer is received when someone left the conference room.
export interface IConfMessageRemovePeer {
    type: 'RemovePeer';
    Id: ConfUserID;
}

// NOTE(yunsi): IConfMessageBye is sent out whe you leave a conference room.
export interface IConfMessageBye {
    type: 'Bye';
}

export type ConfRoom = string;

export type ConfUserID = string;