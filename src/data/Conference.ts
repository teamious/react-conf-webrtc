// NOTE(yunsi): This file contains most of the incoming and outgoing messages of the conference component.

export interface IConfMessage {
    Data: ConfMessageData;
    From?: ConfUserID;
    To?: ConfUserID;
}

export type ConfMessageData =
    IConfMessageJoin |
    IConfMessageConference |
    IConfMessageCandidate |
    IConfMessageOffer |
    IConfMessageAnswer |
    IConfMessageAddPeer |
    IConfMessageRemovePeer

export type ConfUserID = string;

// NOTE(yunsi): IConfMessageJoin is sent out when you try to join a conference room.
export interface IConfMessageJoin {
    type: 'Join';
    room: ConfRoom;
}

export type ConfRoom = string;

// NOTE(yunsi): IConfMessageConference is received when you joind a conference room, it contains an array of the id of users in the conference room.
export interface IConfMessageConference {
    type: 'Conference';
    conference: ConfUserID[];
}

export interface IConfMessageCandidate {
    type: 'Candidate';
    candidate: RTCIceCandidate;
}

// NOTE(yunsi): IConfMessageOffer contains the offer you sent to or received from other clients.
export interface IConfMessageOffer {
    type: 'Offer';
    sessionDescription: RTCSessionDescription;
}

// NOTE(yunsi): IConfMessageAnswer contains the answer you sent to or received from other clients.
export interface IConfMessageAnswer {
    type: 'Answer';
    sessionDescription: RTCSessionDescription;
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