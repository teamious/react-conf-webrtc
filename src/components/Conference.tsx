import * as React from 'react';

import {
    ConferenceConnection,
    IConfIncomingMessage,
    IConfMessageSelf,
    IConfIncomingMessageCandidate,
    IConfIncomingMessageOffer,
    IConfIncomingMessageAnswer,
    IConfMessageAddPeer,
    IConfMessageRemovePeer,
    IConfOutgoingMessage
} from '../data';
import {
    createOutgoingMessageJoin,
    createOutgoingMessageCandidate,
    createOutgoingMessageOffer,
    createOutgoingMessageAnswer,
    createOutgoingMessageBye
} from '../services/ConferenceService';
import { MediaStreamControl } from './controls/MediaStreamControl';
import { Stream } from './controls/Stream';

export interface IConferenceProps {
    connect: () => ConferenceConnection;
    room: string;
    peerConnectionConfig: RTCConfiguration;
}

const userMediaConfig = {
    audio: true,
    video: true,
}

export interface IConferenceState {
    localStream: MediaStream | undefined;
    remoteStreams: { [id: string]: MediaStream };
}

export class Conference extends React.Component<IConferenceProps, IConferenceState> {
    private connection: ConferenceConnection;
    private localId: string;
    private peerConnections: { [id: string]: RTCPeerConnection } = {};
    private candidates: { [id: string]: RTCIceCandidateInit[] } = {};

    constructor(props: IConferenceProps) {
        super(props);
        this.handleIncomingMessage = this.handleIncomingMessage.bind(this);
        this.renderRemoteStream = this.renderRemoteStream.bind(this);
        this.state = {
            localStream: undefined,
            remoteStreams: {},
        }

        this.connection = this.props.connect();
        this.joinRoom(this.props.room);
        this.getUserMedia();
    }

    public render() {
        const { localStream, remoteStreams } = this.state;

        if (!localStream) {
            return <div/>
        }

        return (
            <div className='rcw-conference'>
                <MediaStreamControl stream={localStream} />
                <Stream className='rcw-local-stream' stream={localStream} />
                {Object.keys(remoteStreams).map(this.renderRemoteStream)}
            </div>
        )
    }

    public componentWillUnmount() {
        this.leaveRoom()
    }

    private renderRemoteStream(id: string) {
        return (
            <Stream
                key={id}
                className='rcw-remote-stream'
                stream={this.state.remoteStreams[id]}
            />
        )
    }

    private sendMessage(message: IConfOutgoingMessage) {
        this.connection.publish(message);
    }

    private joinRoom(room: string) {
        const message = createOutgoingMessageJoin(room);
        this.sendMessage(message);
    }

    private leaveRoom() {
        const message = createOutgoingMessageBye()
        this.sendMessage(message);
    }

    private getUserMedia() {
        navigator.mediaDevices.getUserMedia(userMediaConfig).then(stream => this.gotStream(stream))
    }

    private gotStream(stream: MediaStream) {
        this.setState({
            localStream: stream,
        })
        this.connection.subscribe(this.handleIncomingMessage);
    }

    private handleIncomingMessage(message: IConfIncomingMessage) {
        switch (message.type) {
            case 'Self':
                return this.handleSelfMessage(message);
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

    private handleSelfMessage(message: IConfMessageSelf) {
        this.localId = message.Id;
    }

    // NOTE(yunsi): When received an AddPeer event, conference will create a new PeerConnection and add it to the connection list.
    private handleAddPeerMessage(message: IConfMessageAddPeer) {
        const id = message.Id;
        if (id === this.localId) {
            return;
        }

        // NOTE(yunsi): Check if a PeerConnection is already established for the given ID.
        if (this.getPeerConnectionById(id)) {
            console.log('PeerConnection is already established for the given ID: ' + id);
            return
        }
        const peerConnection = this.createPeerConnectionById(id);

        // NOTE(yunsi): When two clients both recieved an AddPeer event with the other client's id, they will do a compare to see who should create and send the offer.
        if (this.localId.localeCompare(id) === 1) {
            peerConnection
                .createOffer()
                .then(sessionDescription => this.setLocalAndSendMessage(sessionDescription, 'Offer', id))
            // TODO(yunsi): Add error handling.
        }
    }

    private createPeerConnectionById(id: string) {
        // TODO(yunsi): Add RTCPeerConnection config.
        const peerConnection = new RTCPeerConnection(this.props.peerConnectionConfig);
        peerConnection.onicecandidate = (event) => {
            this.handleIceCandidate(event, id)
        };
        peerConnection.onaddstream = (event) => {
            this.handleRemoteStreamAdded(event, id)
        };
        if (this.state.localStream) {
            peerConnection.addStream(this.state.localStream);
        }
        this.peerConnections[id] = peerConnection;

        return peerConnection;
    }

    private handleIceCandidate(event: RTCPeerConnectionIceEvent, id: string) {
        if (event.candidate) {
            const message = createOutgoingMessageCandidate(event.candidate.toJSON(), id);
            this.sendMessage(message);
        }
    }

    private setLocalAndSendMessage(sessionDescription: RTCSessionDescription, type: string, id: string) {
        const peerConnection = this.getPeerConnectionById(id);
        if (!peerConnection) {
            console.warn('setLocalAndSendMessage(): Missing connection Id: %s');
            return
        }

        let message;
        if (type === 'Offer') {
            message = createOutgoingMessageOffer(sessionDescription.toJSON(), id);
        } else if (type === 'Answer') {
            message = createOutgoingMessageAnswer(sessionDescription.toJSON(), id);
        }

        if (message) {
            peerConnection.setLocalDescription(sessionDescription);
            // TODO(yunsi): Add error handling.
            this.sendMessage(message);
        }
    }

    private handleRemoteStreamAdded(event: MediaStreamEvent, id: string) {
        if (event.stream) {
            this.setState({
                remoteStreams: {
                    ...this.state.remoteStreams,
                    [id]: event.stream,
                }
            });
        }
    }

    // NOTE(yunsi): When received a RemovePeer event, conference will close that PeerConnection and remove it from the connection list.
    private handleRemovePeerMessage(message: IConfMessageRemovePeer) {
        const id = message.Id;
        const peerConnection = this.getPeerConnectionById(id);

        if (peerConnection) {
            peerConnection.close();
        } else {
            console.warn('handleRemovePeerMessage(): Missing connection Id: %s', id);
        }

        delete this.peerConnections[id];
        const remoteStreams = {
            ...this.state.remoteStreams
        }
        delete remoteStreams[id];
        this.setState({
            remoteStreams
        })
    }

    private handleCandidateMessage(message: IConfIncomingMessageCandidate) {
        const id = message.from;
        const peerConnection = this.getPeerConnectionById(id);
        if (!peerConnection) {
            console.warn('handleCandidateMessage(): Missing connection Id: %s');
            return
        }

        // NOTE(yunsi): Check if remoteDescription exist before call addIceCandidate, if remoteDescription doesn't exist put candidate information in a queue.
        if (peerConnection.remoteDescription) {
            const rtcIceCandidate = this.createRTCIceCandidate(message.candidate);
            peerConnection.addIceCandidate(rtcIceCandidate);
        } else {
            if (this.candidates[id]) {
                this.candidates[id].push(message.candidate);
            } else {
                this.candidates[id] = [message.candidate];
            }
        }
    }

    // NOTE(yunsi): Convert the RTCIceCandidate JSON object to an actual RTCIceCandidate object.
    // TODO(yunsi): Find a better solution besides type cast.
    private createRTCIceCandidate(candidate: RTCIceCandidateInit) {
        return new RTCIceCandidate(candidate)
    }

    // NOTE(yunsi): When received an Offer event, conference will set it as RemoteDescription and create an answer to the offer.
    private handleOfferMessage(message: IConfIncomingMessageOffer) {
        const id = message.from;
        const peerConnection = this.getPeerConnectionById(id);

        if (!peerConnection) {
            console.warn('handleOfferMessage(): Missing connection Id: %s', id);
            return
        }

        const rtcSessionDescription = this.createRTCSessionDescription(message.sessionDescription)
        peerConnection
            .setRemoteDescription(rtcSessionDescription)
            .then(() => {
                this.processCandidates(id);
                return peerConnection.createAnswer()
            })
            .then(sessionDescription => this.setLocalAndSendMessage(sessionDescription, 'Answer', id))
        // TODO(yunsi): Add error handling.
    }

    // NOTE(yunsi): Convert the RTCSessionDescription JSON object to an actual RTCSessionDescription object.
    private createRTCSessionDescription(sessionDescription: RTCSessionDescriptionInit) {
        return new RTCSessionDescription(sessionDescription)
    }

    private handleAnswerMessage(message: IConfIncomingMessageAnswer) {
        const id = message.from;
        const peerConnection = this.getPeerConnectionById(id);

        if (!peerConnection) {
            console.warn('handleAnswerMessage(): Missing connection Id: %s', id);
            return
        }

        const rtcSessionDescription = this.createRTCSessionDescription(message.sessionDescription)
        peerConnection
            .setRemoteDescription(rtcSessionDescription)
            .then(() => this.processCandidates(id));
        // TODO(yunsi): Add error handling.
    }

    private processCandidates(id: string) {
        const peerConnection = this.getPeerConnectionById(id);
        if (!peerConnection) {
            console.warn('processCandidates(): Missing connection Id: %s', id);
            return
        }

        if (this.candidates[id]) {
            while (this.candidates[id].length > 0) {
                const candidate = this.candidates[id].shift();
                if (candidate) {
                    const rtcIceCandidate = this.createRTCIceCandidate(candidate);
                    peerConnection.addIceCandidate(rtcIceCandidate);
                }
            }
        }
    }

    private getPeerConnectionById(id: string) {
        return this.peerConnections[id]
    }
}
