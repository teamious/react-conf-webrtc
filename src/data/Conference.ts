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
    type: string;
    room: ConfRoom;
}

// NOTE(yunsi): IConfMessageConference is received when you joind a conference room, it contains an array of the id of users in the conference room.
export interface IConfMessageConference {
    type: string
    conference: ConfUserID[];
}

export interface IConfIncomingMessageId {
    from: ConfUserID;
}

export interface IConfOutgoingMessageId {
    to: ConfUserID;
}

export interface IConfMessageCandidate {
    type: string;
    candidate: RTCIceCandidate;
}

// NOTE(yunsi): IConfIncomingMessageCandidate contains the IceCandidate information you received from other clients.
export interface IConfIncomingMessageCandidate extends IConfMessageCandidate, IConfIncomingMessageId { }

// NOTE(yunsi): IConfIncomingMessageCandidate contains the IceCandidate information you sent to other clients.
export interface IConfOutgoingMessageCandidate extends IConfMessageCandidate, IConfOutgoingMessageId { }

export interface IConfMessageOffer {
    type: string;
    sessionDescription: RTCSessionDescription;
}

// NOTE(yunsi): IConfIncomingMessageOffer contains the offer you received from other clients.
export interface IConfIncomingMessageOffer extends IConfMessageOffer, IConfIncomingMessageId { }

// NOTE(yunsi): IConfOutgoingMessageOffer contains the offer you sent to other clients.
export interface IConfOutgoingMessageOffer extends IConfMessageOffer, IConfOutgoingMessageId { }

export interface IConfMessageAnswer {
    type: string;
    sessionDescription: RTCSessionDescription;
}

// NOTE(yunsi): IConfIncomingMessageAnswer contains the answer you received from other clients.
export interface IConfIncomingMessageAnswer extends IConfMessageAnswer, IConfIncomingMessageId { }

// NOTE(yunsi): IConfOutgoingMessageAnswer contains the answer you sent to other clients.
export interface IConfOutgoingMessageAnswer extends IConfMessageAnswer, IConfOutgoingMessageId { }

// NOTE(yunsi): IConMessageAddPeer is received when you need to create and send an offer.
export interface IConfMessageAddPeer {
    type: string;
    Id: ConfUserID;
}

// NOTE(yunsi): IConMessageRemovePeer is received when someone left the conference room.
export interface IConfMessageRemovePeer {
    type: string;
    Id: ConfUserID;
}

// NOTE(yunsi): IConfMessageBye is sent out whe you leave a conference room.
export interface IConfMessageBye {
    type: string;
}

export type ConfRoom = string;

export type ConfUserID = string;