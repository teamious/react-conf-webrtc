import * as React from 'react';

import {
    ConferenceConnection,
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

const userMediaConfig = {
    audio: true,
    video: true,
}

export class Conference extends React.Component<IConferenceProps, void> {
    private connection: ConferenceConnection;
    private peerConnections: { [id: string]: RTCPeerConnection };

    constructor() {
        super();
        this.connection = this.props.connect();
        this.connection.subscribe(this.handleIncomingMessage);
        this.joinRoom(this.props.room);
        this.getUserMedia();
    }

    // TODO(yunsi): Complete display view.
    public render() {
        return (
            <div />
        )
    }

    public componentWillMount() {
        this.leaveRoom()
    }

    private sendMessage(message: IConfOutgoingMessage) {
        this.connection.publish(message);
    }

    private joinRoom(room: string) {
        const message = {
            type: 'Join',
            room: room,
        } as IConfOutgoingMessage;
        this.sendMessage(message);
    }

    private leaveRoom() {
        const message = {
            type: 'Bye',
        } as IConfOutgoingMessage;
        this.sendMessage(message);
    }

    private getUserMedia() {
        navigator.mediaDevices.getUserMedia(userMediaConfig).then(stream => {
            // TODO(yunsi): Send MediaStream to Local stream component.
        })
    }

    private handleIncomingMessage(message: IConfIncomingMessage) {
        switch (message.type) {
            case 'AddPeer':
                return this.handleAddPeerMessage(message);
            case 'RemovePeer':
                return this.handleRemovePeerMessage(message);
            case 'Candidate':
                return this.handleCandidateMessage(message);
            case 'Offer':
                return this.handleOfferMessage(message);
            case 'Answer':
                return this.handleAnswerMessage(message);
            default:
                return console.log('Unkonw message type')
        }
    }

    // NOTE(yunsi): When received an AddPeer event, conference will create a new PeerConnection and add it to the connection list.
    private handleAddPeerMessage(message: IConfMessageAddPeer) {
        const id = message.Id;
        const peerConnection = this.createPeerConnectionById(id);

        if (peerConnection) {
            peerConnection.createOffer(
                sessionDescription => this.setLocalAndSendMessage(sessionDescription, 'Offer', id)
            )
        }
    }

    private createPeerConnectionById(id: string) {
        try {
            // TODO(yunsi): Add RTCPeerConnection config.
            const peerConnection = new RTCPeerConnection({});
            peerConnection.onicecandidate = (event) => {
                this.handleIceCandidate(event, id)
            };
            peerConnection.onaddstream = (event) => {
                this.handleRemoteStreamAdded(event, id)
            };
            this.peerConnections[id] = peerConnection;

            return peerConnection;
        } catch (err) {
            console.log('Can not create PeerConnection by id: ' + id);
        }
    }

    private handleIceCandidate(event: RTCPeerConnectionIceEvent, id: string) {
        if (event.candidate) {
            const message = {
                type: 'Candidate',
                candidate: event.candidate,
                to: id,
            } as IConfOutgoingMessage;
            this.sendMessage(message);
        }
    }

    private setLocalAndSendMessage(sessionDescription: RTCSessionDescription, type: string, id: string) {
        const peerConnection = this.getPeerConnectionById(id);
        const outgoingMessage = {
            type: type,
            sessionDescription: sessionDescription,
            to: id
        } as IConfOutgoingMessage

        if (peerConnection) {
            peerConnection.setLocalDescription(sessionDescription);
            this.sendMessage(outgoingMessage);
        }
    }

    private handleRemoteStreamAdded(event: MediaStreamEvent, id: string) {
        // TODO(yunsi): Send MediaStream to Remote stream component.
    }

    // NOTE(yunsi): When received a RemovePeer event, conference will close that PeerConnection and remove it from the connection list.
    private handleRemovePeerMessage(message: IConfMessageRemovePeer) {
        const id = message.Id;
        const peerConnection = this.getPeerConnectionById(id);

        if (peerConnection) {
            peerConnection.close();
            delete this.peerConnections[id];
        }
    }

    private handleCandidateMessage(message: IConfIncomingMessageCandidate) {
        const id = message.from;
        const peerConnection = this.getPeerConnectionById(id);

        if (peerConnection) {
            peerConnection.addIceCandidate(message.candidate);
        }
    }

    // NOTE(yunsi): When received an Offer event, conference will create a new PeerConnection and add it to the connection list, then create an answer to the offer.
    private handleOfferMessage(message: IConfIncomingMessageOffer) {
        const id = message.from;
        const peerConnection = this.createPeerConnectionById(id);

        if (peerConnection) {
            peerConnection.setRemoteDescription(message.sessionDescription);
            peerConnection.createAnswer(
                sessionDescription => this.setLocalAndSendMessage(sessionDescription, 'Answer', id)
            )
        }
    }

    private handleAnswerMessage(message: IConfIncomingMessageAnswer) {
        const id = message.from;
        const peerConnection = this.getPeerConnectionById(id);

        if (peerConnection) {
            peerConnection.setRemoteDescription(message.sessionDescription);
        }
    }

    private getPeerConnectionById(id: string) {
        if (this.peerConnections[id]) {
            return this.peerConnections[id]
        } else {
            console.log('Can not find PeerConneciotn by id: ' + id);
        }
    }
}