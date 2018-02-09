import {
    IConfMessageJoin,
    IConfOutgoingMessageCandidate,
    IConfOutgoingMessageOffer,
    IConfOutgoingMessageAnswer,
    IConfMessageBye,
    IConfMessageChat,
    IConfChat,
} from '../data';

export function createOutgoingMessageJoin(room: string): IConfMessageJoin {
    return {
        type: 'Join',
        room: room,
    }
}

export function createOutgoingMessageCandidate(candidate: RTCIceCandidateInit, id: string): IConfOutgoingMessageCandidate {
    return {
        type: 'Candidate',
        candidate: candidate,
        to: id,
    }
}

export function createOutgoingMessageOffer(sessionDescription: RTCSessionDescription, id: string): IConfOutgoingMessageOffer {
    return {
        type: 'Offer',
        sessionDescription: sessionDescription,
        to: id,
    }
}

export function createOutgoingMessageAnswer(sessionDescription: RTCSessionDescription, id: string): IConfOutgoingMessageAnswer {
    return {
        type: 'Answer',
        sessionDescription: sessionDescription,
        to: id,
    }
}

export function createOutgoingMessageBye(): IConfMessageBye {
    return {
        type: 'Bye',
    }
}

export function createOutgoingMessageChat(chat: IConfChat, id?: string): IConfMessageChat {
    return {
        type: 'Chat',
        chat: chat,
        to: id
    }
}
