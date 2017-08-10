import * as React from 'react';

import {
    ConferenceConnection,
    ConfMessageType,
    IConfIncomingMessage,
    IConfIncomingMessageCandidate,
    IConfIncomingMessageOffer,
    IConfIncomingMessageAnswer,
    IConfMessageAddPeer,
    IConfMessageRemovePeer,
    IConfOutgoingMessage
} from '../data';

export interface IConferenceProps {
    connect: () => ConferenceConnection;
    room: string;
}

export class Conference extends React.Component<IConferenceProps, void> {
    private connection: ConferenceConnection;
    private peerConnections: { [id: string]: RTCPeerConnection };

    constructor() {
        super();
        this.connection = this.props.connect();
        this.connection.subscribe(this.handleIncomingMessage);
        this.joinRoom(this.props.room);
    }

    private sendMessage(message: IConfOutgoingMessage) {
        this.connection.publish(message);
    }

    private joinRoom(room: string) {
        const message = {
            type: ConfMessageType.JOIN,
            room: room,
        };
        this.sendMessage(message);
    }

    private handleIncomingMessage(message: IConfIncomingMessage) {
        switch (message.type) {
            // TODO(yunsi): Currently unused.
            // case ConfMessageType.CONFERENCE:
            case ConfMessageType.CANDIDATE:
                return this.handleCandidateMessage(message as IConfIncomingMessageCandidate);
            case ConfMessageType.OFFER:
                return this.handleOfferMessage(message as IConfIncomingMessageOffer);
            case ConfMessageType.ANSWER:
                return this.handleAnswerMessage(message as IConfIncomingMessageAnswer);
            case ConfMessageType.ADD_PEER:
                return this.handleAddPeerMessage(message as IConfMessageAddPeer);
            case ConfMessageType.REMOVE_PEER:
                return this.handleRemovePeerMessage(message as IConfMessageRemovePeer);
            default:
                return console.log('Unkonw message type')
        }
    }

    private handleCandidateMessage(message: IConfIncomingMessageCandidate) {
        const id = message.from;
        const peerConnections = this.peerConnections[id];
        const candidate = new RTCIceCandidate({
            sdpMLineIndex: message.candidate.sdpMLineIndex,
            candidate: message.candidate.candidate,
        } as any)

        peerConnections.addIceCandidate(candidate);
    }

    private handleOfferMessage(message: IConfIncomingMessageOffer) {
        const id = message.from;
        const peerConnections = this.peerConnections[id];

        peerConnections.setRemoteDescription(new RTCSessionDescription(message.sessionDescription as any));
        peerConnections.createAnswer(
            sessionDescription => this.setLocalAndSendMessage(sessionDescription, ConfMessageType.ANSWER, id)
        )
    }

    private setLocalAndSendMessage(sessionDescription: RTCSessionDescription, type: string, id: string) {
        const peerConnections = this.peerConnections[id];
        const outgoingMessage = {
            type: type,
            sessionDescription: sessionDescription,
            to: id
        }

        peerConnections.setLocalDescription(sessionDescription);
        this.sendMessage(outgoingMessage);
    }

    private handleAnswerMessage(message: IConfIncomingMessageAnswer) {
        const id = message.from;
        const peerConnection = this.peerConnections[id];

        peerConnection.setRemoteDescription(new RTCSessionDescription(message.sessionDescription as any));
    }

    private handleAddPeerMessage(message: IConfMessageAddPeer) {
        const id = message.Id;

        try {
            // TODO(yunsi): Add RTCPeerConnection config.
            const PeerConnection = new RTCPeerConnection({});
            PeerConnection.onicecandidate = (event) => {
                this.handleIceCandidate(event, id)
            };
            PeerConnection.onaddstream = (event) => {
                this.handleRemoteStreamAdded(event, id)
            };
            this.peerConnections[id] = PeerConnection;
        } catch (err) {
            console.log('Failed to create PeerConnection with ' + id + ': ' + err.toString());
            return;
        }

        this.createOffer(id);
    }

    private createOffer(id: string) {
        const peerConnection = this.peerConnections[id];
        peerConnection.createOffer(
            sessionDescription => this.setLocalAndSendMessage(sessionDescription, ConfMessageType.OFFER, id)
        )
    }

    private handleIceCandidate(event: RTCPeerConnectionIceEvent, id: string) {
        if (event.candidate) {
            const message = {
                type: ConfMessageType.CANDIDATE,
                candidate: event.candidate,
                to: id,
            };
            this.sendMessage(message);
        }
    }

    private handleRemoteStreamAdded(event: MediaStreamEvent, id: string) {
        // TODO(yunsi): Send MediaStream to Remote stream component.
    }

    private handleRemovePeerMessage(message: IConfMessageRemovePeer) {
        const id = message.Id;
        const peerConnection = this.peerConnections[id];

        peerConnection.close();
        delete this.peerConnections[id];
    }
}