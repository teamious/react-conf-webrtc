import * as React from 'react';
import * as DetectRTC from 'detectrtc';
import * as Hark from 'hark';

import {
    ConferenceConnection,
    IConfIncomingMessage,
    IConfMessageSelf,
    IConfIncomingMessageCandidate,
    IConfIncomingMessageOffer,
    IConfIncomingMessageAnswer,
    IConfMessageAddPeer,
    IConfMessageRemovePeer,
    IConfOutgoingMessage,
    ConfUserID,
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

export interface ConferenceStream {
    id: ConfUserID,
    stream: MediaStream,
    local: boolean;
}

export interface ConferenceRenderer {
    (localStream: ConferenceStream | undefined, remoteStreams: ConferenceStream[]): JSX.Element | null | false;
}

export interface IConferenceProps {
    connect: () => ConferenceConnection;
    room: string;
    peerConnectionConfig: RTCConfiguration;
    render?: ConferenceRenderer;
    onError?: (error: any) => void;
}

const userMediaConfig = {
    audio: true,
    video: true,
}

// TODO(yunsi): Add data channel config
// var dataChannelConfig: RTCDataChannelInit = {}

export interface IConferenceState {
    localId: ConfUserID | undefined;
    localStream: MediaStream | undefined;
    remoteStreams: { [id: string]: MediaStream };
    remoteIsSpeaking: { [id: string]: boolean };
}

export class Conference extends React.Component<IConferenceProps, IConferenceState> {
    private connection: ConferenceConnection;
    private localId: string | undefined;
    private peerConnections: { [id: string]: RTCPeerConnection } = {};
    private candidates: { [id: string]: RTCIceCandidateInit[] } = {};
    private sendChannels: { [id: string]: RTCDataChannel } = {};
    private receiveChannels: { [id: string]: RTCDataChannel } = {};

    constructor(props: IConferenceProps) {
        super(props);
        this.handleIncomingMessage = this.handleIncomingMessage.bind(this);
        this.renderStream = this.renderStream.bind(this);
        this.state = {
            localId: undefined,
            localStream: undefined,
            remoteStreams: {},
            remoteIsSpeaking: {},
        }

        if (!this.checkBrowserSupport()) {
            return;
        };

        this.connection = this.props.connect();
        this.joinRoom(this.props.room);
        this.getUserMedia();
    }

    public render() {
        const remoteStreams = this.getRemoteConferenceStreams();
        const localStream = this.getLocalConferenceStream();
        const { render } = this.props;

        if (render) {
            return render(localStream, remoteStreams);
        }

        if (!localStream) {
            return null;
        }

        return (
            <div className='rcw-conference'>
                {this.renderStream(localStream)}
                {remoteStreams.map(this.renderStream)}
                <MediaStreamControl stream={localStream.stream} />
            </div>
        )
    }

    public componentWillUnmount() {
        this.leaveRoom()
    }

    private checkBrowserSupport(): boolean {
        if (DetectRTC.isWebRTCSupported === false) {
            // TODO(yunsi): Define a better error message.
            this.onError('support');
            return false;
        }
        return true;
    }

    private onError(error: any) {
        if (!this.props.onError) {
            return console.warn(error)
        }
        this.props.onError(error);
    }

    private getLocalConferenceStream(): ConferenceStream | undefined {
        if (!this.state.localStream || !this.state.localId) {
            return;
        }
        return {
            id: this.state.localId,
            stream: this.state.localStream,
            local: true,
        }
    }

    private getRemoteConferenceStreams(): ConferenceStream[] {
        return Object.keys(this.state.remoteStreams).map<ConferenceStream>((id: string) => {
            return {
                id,
                stream: this.state.remoteStreams[id],
                local: false,
            }
        });
    }

    private renderStream(stream: ConferenceStream) {
        let className = 'rcw-remote-stream';
        let muted;
        if (stream.local) {
            className = 'rcw-local-stream';
            muted = true;
        }

        return (
            <Stream
                key={stream.id}
                className={className}
                stream={stream.stream}
                muted={muted}
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
        // NOTE(yunsi): DetectRTC.load() makes sure that all devices are captured and valid result is set for relevant properties.
        DetectRTC.load(() => {
            if (DetectRTC.isWebsiteHasWebcamPermissions === false) {
                // TODO(yunsi): Define a better error message.
                this.onError('noWebCamPermission');
            }
            if (DetectRTC.isWebsiteHasMicrophonePermissions === false) {
                // TODO(yunsi): Define a better error message.
                this.onError('noMicPermission');
            }
        })
        navigator.mediaDevices.getUserMedia(userMediaConfig).then(stream => this.gotStream(stream))
    }

    private gotStream(stream: MediaStream) {
        this.setState({
            localStream: stream,
        })

        // NOTE(yunsi): Add an audio monitor to listen to the speaking change of local stream.
        let audioMonitor = Hark(this.state.localStream);
        audioMonitor.on('speaking', () => {
            this.broadcastDataChannelMessage('speaking')
        })
        audioMonitor.on('stopped_speaking', () => {
            this.broadcastDataChannelMessage('stopped_speaking')
        })

        this.connection.subscribe(this.handleIncomingMessage);
    }

    // NOTE(yunsi): Send the speaking message to all clients through data channels
    private broadcastDataChannelMessage(message: string) {
        Object.keys(this.sendChannels).forEach((id: string) => {
            const sendChannel = this.getSendChannelById(id);
            if (sendChannel.readyState === 'open') {
                sendChannel.send(message);
            }
        });
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
        this.setState({
            localId: message.Id
        });
    }

    // NOTE(yunsi): When received an AddPeer event, conference will create a new PeerConnection and add it to the connection list.
    private handleAddPeerMessage(message: IConfMessageAddPeer) {
        const id = message.Id;
        if (!this.state.localId) {
            console.warn('handleAddPeerMessage(): localId is not set.')
            return
        }

        if (id === this.state.localId) {
            return;
        }

        // NOTE(yunsi): Check if a PeerConnection is already established for the given ID.
        if (this.getPeerConnectionById(id)) {
            console.log('PeerConnection is already established for the given ID: ' + id);
            return
        }
        const peerConnection = this.createPeerConnectionById(id);

        // NOTE(yunsi): When two clients both recieved an AddPeer event with the other client's id, they will do a compare to see who should create and send the offer.
        if (this.state.localId.localeCompare(id) === 1) {
            peerConnection
                .createOffer()
                .then(sessionDescription => this.setLocalAndSendMessage(sessionDescription, 'Offer', id))
            // TODO(yunsi): Add error handling.
        }
    }

    private createPeerConnectionById(id: string) {
        const peerConnection = new RTCPeerConnection(this.props.peerConnectionConfig);
        // TODO(yunsi): Add data channel config
        const sendChannel = peerConnection.createDataChannel('dataChannel');
        peerConnection.onicecandidate = (event) => {
            this.handleIceCandidate(event, id)
        };
        peerConnection.onaddstream = (event) => {
            this.handleRemoteStreamAdded(event, id)
        };
        peerConnection.ondatachannel = (event) => {
            this.handleReceiveChannel(event, id)
        }
        if (this.state.localStream) {
            peerConnection.addStream(this.state.localStream);
        }
        this.peerConnections[id] = peerConnection;
        this.sendChannels[id] = sendChannel;

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

    private handleReceiveChannel(event: RTCDataChannelEvent, id: string) {
        if (event.channel) {
            const receiveChannel = event.channel;
            receiveChannel.onmessage = (messageEvent) => { this.handleReceiveChannelMessage(messageEvent, id) };
            this.receiveChannels[id] = receiveChannel;
        }
    }

    private handleReceiveChannelMessage(event: MessageEvent, id: string) {
        if (event.data) {
            switch (event.data) {
                case 'speaking':
                    return this.handleIncomingSpeakingMessage(id, true);
                case 'stopped_speaking':
                    return this.handleIncomingSpeakingMessage(id, false);
                default:
                    return console.log('Unkonw data channel message')
            }
        }
    }

    private handleIncomingSpeakingMessage(id: string, isSpeaking: boolean) {
        console.log('Remote: ' + id + ' is speaking: ', isSpeaking)
        // TODO(yunsi): Add UI to show microphone activity for remote stream
        this.setState({
            remoteIsSpeaking: {
                ...this.state.remoteIsSpeaking,
                [id]: isSpeaking,
            }
        })
    }

    // NOTE(yunsi): When received a RemovePeer event, conference will close that PeerConnection and remove it from the connection list.
    private handleRemovePeerMessage(message: IConfMessageRemovePeer) {
        const id = message.Id;
        const peerConnection = this.getPeerConnectionById(id);
        const sendChannel = this.getSendChannelById(id);
        const receiveChannel = this.getReceiveChannelById(id);

        if (peerConnection) {
            peerConnection.close();
        } else {
            console.warn('handleRemovePeerMessage(): Missing connection Id: %s', id);
        }

        if (sendChannel) {
            sendChannel.close();
        } else {
            console.warn('handleRemovePeerMessage(): Missing sendChannel Id: %s', id);
        }

        if (receiveChannel) {
            receiveChannel.close();
        } else {
            console.warn('handleRemovePeerMessage(): Missing receiveChannel Id: %s', id);
        }

        delete this.peerConnections[id];
        delete this.sendChannels[id];
        delete this.receiveChannels[id];
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

    private getPeerConnectionById(id: string): RTCPeerConnection {
        return this.peerConnections[id]
    }

    private getSendChannelById(id: string): RTCDataChannel {
        return this.sendChannels[id]
    }

    private getReceiveChannelById(id: string): RTCDataChannel {
        return this.receiveChannels[id]
    }
}
