import * as React from 'react';
import * as DetectRTC from 'detectrtc';
import 'webrtc-adapter';

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
    IDataChannelMessage,
    IDataChannelMessageSpeech,
    IDataChannelMessageAudio,
    IDataChannelMessageVideo,
    DataChannelReadyState,
    ConferenceError,
} from '../data';
import {
    createOutgoingMessageJoin,
    createOutgoingMessageCandidate,
    createOutgoingMessageOffer,
    createOutgoingMessageAnswer,
    createOutgoingMessageBye,
    createDataChannelMessageSpeech,
    createDataChannelMessageAudio,
    createDataChannelMessageVideo,

    createConferenceErrorCreateAnswer,
    createConferenceErrorCreateOffer,
    createConferenceErrorGetUserMedia,
    createConferenceErrorMicPermissions,
    createConferenceErrorSetLocalDescription,
    createConferenceErrorSetRemoteDescription,
    createConferenceErrorWebcamPermissions,
    createConferenceErrorWebRTCNotSupported,
} from '../services';
import { createAudioMonitor, AudioMonitor } from '../utils/createAudioMonitor';
import * as MediaStreamUtil from '../utils/MediaStreamUtil';
import { ChromeExtension} from '../utils/ChromeExtensionUtil';
import { AudioMeter } from './controls/AudioMeter';
import { Stream } from './controls/Stream';

export interface ConferenceStream {
    id: ConfUserID,
    stream: MediaStream,
    local: boolean;
    isSpeaking: boolean;
    audioEnabled: boolean;
    videoEnabled: boolean;
}

export interface IStreamsRendererProps {
    localStream: ConferenceStream | undefined;
    remoteStreams: ConferenceStream[];
    audioMonitor: AudioMonitor;
}

export interface IMediaStreamControlRendererProps {
    toggleAudioEnabled: ToggleAudioEnabledHandler;
    toggleVideoEnabled: ToggleVideoEnabledHandler;
}

export interface ToggleAudioEnabledHandler {
    (stream?: ConferenceStream): void;
}

export interface ToggleVideoEnabledHandler {
    (stream?: ConferenceStream): void;
}

export interface ConferenceRenderer {
    (streamProps: IStreamsRendererProps, controlProps: IMediaStreamControlRendererProps): JSX.Element | null | false;
}

export interface IConferenceProps {
    connect: () => ConferenceConnection;
    room: string;
    peerConnectionConfig: RTCConfiguration;
    render?: ConferenceRenderer;
    onError?: (error: ConferenceError) => void;
}

const webcamScreenConstraints = {
    audio: true,
    video: true,
}

// TODO(yunsi): Add data channel config
// var dataChannelConfig: RTCDataChannelInit = {}

export interface IConferenceState {
    localStream: ConferenceStream;
    remoteStreams: { [id: string]: ConferenceStream };
    audioMonitor: AudioMonitor;
}

export class Conference extends React.Component<IConferenceProps, IConferenceState> {
    private connection: ConferenceConnection;
    private localId: string | undefined;
    private peerConnections: { [id: string]: RTCPeerConnection } = {};
    private candidates: { [id: string]: RTCIceCandidateInit[] } = {};
    private dataChannels: { [id: string]: RTCDataChannel } = {};

    constructor(props: IConferenceProps) {
        super(props);
        this.handleIncomingMessage = this.handleIncomingMessage.bind(this);
        this.handleMediaException = this.handleMediaException.bind(this);
        this.renderStream = this.renderStream.bind(this);
        this.onAudioEnabledChange = this.onAudioEnabledChange.bind(this);
        this.onVideoEnabledChange = this.onVideoEnabledChange.bind(this);
        this.toggleAudioEnabled = this.toggleAudioEnabled.bind(this);
        this.toggleVideoEnabled = this.toggleVideoEnabled.bind(this);
        this.renderMediaStreamControlDefault = this.renderMediaStreamControlDefault.bind(this);
        this.renderStreamsDefault = this.renderStreamsDefault.bind(this);
        this.onToggleAudio = this.onToggleAudio.bind(this);
        this.onToggleVideo = this.onToggleVideo.bind(this);

        this.state = {
            localStream: {} as ConferenceStream,
            remoteStreams: {},
            audioMonitor: {} as AudioMonitor,
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
        const { audioMonitor } = this.state;

        if (localStream) {
            this.changeAudioTrackEnabled(localStream.audioEnabled);
            this.changeVideoTrackEnabled(localStream.videoEnabled);
        }

        if (render) {
            return render({
                localStream,
                remoteStreams,
                audioMonitor,
            }, {
                    toggleAudioEnabled: this.toggleAudioEnabled,
                    toggleVideoEnabled: this.toggleVideoEnabled,
                });
        }

        if (!localStream) {
            return null;
        }

        return (
            <div className='rcw-conference'>
                {this.renderStream(localStream)}
                {remoteStreams.map(this.renderStream)}
                {this.renderMediaStreamControlDefault()}
                <AudioMeter audioMonitor={audioMonitor} />
            </div>
        )
    }

    public componentWillUnmount() {
        if (this.state.localStream.stream) {
            MediaStreamUtil.stopMediaStream(this.state.localStream.stream);
        }
        this.leaveRoom();
    }

    // NOTE(andrews): toggleAudioEnabled allows you to control the audio tracks
    // of any stream. If no stream is provided, then it defaults to using the
    // local stream object.
    private toggleAudioEnabled(stream?: ConferenceStream): void {
        if (!stream) {
            stream = this.state.localStream;
        }
        const trackStatus = stream.audioEnabled;
        this.onAudioEnabledChange(stream, !trackStatus);
    }

    // NOTE(andrews): toggleVideoEnabled allows you to control the videos tracks
    // of any stream. If no stream is provided, then it defaults to using the
    // local stream object.
    private toggleVideoEnabled(stream?: ConferenceStream): void {
        if (!stream) {
            stream = this.state.localStream;
        }
        const trackStatus = stream.videoEnabled;
        this.onVideoEnabledChange(stream, !trackStatus);
    }

    private onToggleAudio() {
        this.toggleAudioEnabled();
    }

    private onToggleVideo() {
        this.toggleVideoEnabled();
    }

    private renderMediaStreamControlDefault(): JSX.Element | null | false {
        return (
            <div className='rcw-conference__media-stream-controls-default'>
                <div className='rcw-stream-controls'>
                    <button className='rcw-stream-control-mute' onClick={this.onToggleAudio}>Mute Audio</button>
                    <button className='rcw-stream-control-disable' onClick={this.onToggleVideo}>Disable Video</button>
                </div>
            </div>
        )
    }

    private renderStreamsDefault() {
        const localStream = this.getLocalConferenceStream();
        const remoteStreams = this.getRemoteConferenceStreams();

        if (!localStream) {
            return null;
        }

        return (
            <div className='rcw-conference__streams-default'>
                {this.renderStream(localStream)}
                {remoteStreams.map(this.renderStream)}
                {this.renderMediaStreamControlDefault()}
                <AudioMeter audioMonitor={this.state.audioMonitor} />
            </div>
        )
    }

    private checkBrowserSupport(): boolean {
        if (DetectRTC.isWebRTCSupported === false) {
            this.onError(createConferenceErrorWebRTCNotSupported());
            return false;
        }
        return true;
    }

    private onError(error: ConferenceError) {
        if (!this.props.onError) {
            return console.warn(error)
        }
        this.props.onError(error);
    }

    private getLocalConferenceStream(): ConferenceStream | undefined {
        if (!this.state.localStream.stream || !this.state.localStream.id) {
            return;
        }
        return this.state.localStream
    }

    private getRemoteConferenceStreams(): ConferenceStream[] {
        return Object.keys(this.state.remoteStreams).map<ConferenceStream>((id: string) => {
            return this.state.remoteStreams[id]
        });
    }

    private changeAudioTrackEnabled(enabled: boolean) {
        const stream = this.state.localStream.stream;
        if (!stream) {
            console.warn('changeAudioTrackEnabled(): No local stream.')
            return;
        }
        const track = stream.getAudioTracks()[0];
        if (!track) {
            console.warn('changeAudioTrackEnabled(): No audio track')
            return
        }
        track.enabled = enabled;
    }

    private changeVideoTrackEnabled(enabled: boolean) {
        const stream = this.state.localStream.stream;
        if (!stream) {
            console.warn('changeVideoTrackEnabled(): No local stream.')
            return;
        }
        const track = stream.getVideoTracks()[0];
        if (!track) {
            console.warn('changeVideoTrackEnabled(): No video track')
            return
        }
        track.enabled = enabled;
    }

    private onAudioEnabledChange(stream: ConferenceStream, enabled: boolean) {
        if (stream.id === this.state.localStream.id) {
            this.setState({
                localStream: {
                    ...this.state.localStream,
                    audioEnabled: enabled
                }
            });
        } else {
            this.setState({
                remoteStreams: {
                    ...this.state.remoteStreams,
                    [stream.id]: {
                        ...this.state.remoteStreams[stream.id],
                        audioEnabled: enabled,
                    }
                }
            })
        }
        const message = createDataChannelMessageAudio(stream.id, enabled);
        this.broadcastDataChannelMessage(message);
    }

    private onVideoEnabledChange(stream: ConferenceStream, enabled: boolean) {
        if (stream.id === this.state.localStream.id) {
            this.setState({
                localStream: {
                    ...this.state.localStream,
                    videoEnabled: enabled
                }
            });
        } else {
            this.setState({
                remoteStreams: {
                    ...this.state.remoteStreams,
                    [stream.id]: {
                        ...this.state.remoteStreams[stream.id],
                        videoEnabled: enabled,
                    }
                }
            })
        }
        const message = createDataChannelMessageVideo(stream.id, enabled);
        this.broadcastDataChannelMessage(message);
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
        // NOTE(yunsi): Send Bye message to spreed server.
        const message = createOutgoingMessageBye()
        this.sendMessage(message);

        // NOTE(yunsi): Close the WebSocket connection to spreed server.
        this.connection.close();

        // NOTE(yunsi): Close all peer connections.
        Object.keys(this.peerConnections).forEach((id: string) => {
            // NOTE(yunsi): This will also close all datachannels created on the peerconnection
            this.peerConnections[id].close();
        })
    }

    private getUserMedia() {
        // NOTE(yunsi): DetectRTC.load() makes sure that all devices are captured and valid result is set for relevant properties.
        DetectRTC.load(() => {
            if (DetectRTC.isWebsiteHasWebcamPermissions === false) {
                this.onError(createConferenceErrorWebcamPermissions())
            }
            if (DetectRTC.isWebsiteHasMicrophonePermissions === false) {
                this.onError(createConferenceErrorMicPermissions())
            }
        })

        this.getMediaStream(webcamScreenConstraints);
        // const constraints = {
        //     video: {
        //         mandatory: {
        //             chromeMediaSource: 'desktop',
        //             chromeMediaSourceId: '',
        //             maxWidth: screen.width > 1920 ? screen.width : 1920,
        //             maxHeight: screen.height > 1080 ? screen.height : 1080
        //         }
        //     },
        //     audio: false,
        // };

        // const ext = new ChromeExtension();
        // let screenStream: MediaStream;
        // ext.call('get-sourceId')
        //     .then(sourceId => {
        //         constraints.video.mandatory.chromeMediaSourceId = sourceId;
        //         return navigator.mediaDevices.getUserMedia(constraints as any)
        // }).then(stream => {
        //     screenStream = stream;
        //     return navigator.mediaDevices.getUserMedia(webcamScreenConstraints);
        // }).then(stream => {
        //     screenStream.addTrack(stream.getAudioTracks()[0]);
        //     this.gotStream(screenStream);
        // });
    }

    private getMediaStream(constraints: any) {
        return navigator.mediaDevices.getUserMedia(constraints)
            .then(stream => this.gotStream(stream))
            .catch(this.handleMediaException);
    }

    private getScreenMedia() {
        const constraints = {
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: '',
                    maxWidth: screen.width > 1920 ? screen.width : 1920,
                    maxHeight: screen.height > 1080 ? screen.height : 1080
                }
            },
            audio: false,
        };

        const ext = new ChromeExtension();
        ext.call('get-sourceId')
            .then(sourceId => {
                constraints.video.mandatory.chromeMediaSourceId = sourceId;
                this.getMediaStream(constraints);
        })
    }

    private handleMediaException(error: MediaStreamError) {
        // Exception type list: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
        this.onError(createConferenceErrorGetUserMedia(error));
    }

    private gotStream(stream: MediaStream) {
        this.setState({
            localStream: {
                ...this.state.localStream,
                stream,
                local: true,
                audioEnabled: true,
                videoEnabled: true,
            }
        }, () => {
            this.createAudioMonitor();
        })

        this.connection.subscribe(this.handleIncomingMessage);
    }

    private createAudioMonitor() {
        if (!this.state.localStream) {
            return;
        }

        if (this.state.localStream.stream.getAudioTracks().length === 0) {
            return;
        }

        // NOTE(yunsi): Add an audio monitor to listen to the speaking change of local stream.
        const audioMonitor = createAudioMonitor(this.state.localStream.stream);
        audioMonitor.on('speaking', () => {
            const message = createDataChannelMessageSpeech(true);
            this.broadcastDataChannelMessage(message)
        })
        audioMonitor.on('stopped_speaking', () => {
            const message = createDataChannelMessageSpeech(false);
            this.broadcastDataChannelMessage(message)
        })
        this.setState({ audioMonitor });
    }

    // NOTE(yunsi): Send the speaking message to all clients through data channels
    private broadcastDataChannelMessage(message: IDataChannelMessage) {
        Object.keys(this.dataChannels).forEach((id: string) => {
            this.sendMessageToDataChannel(message, id)
        });
    }

    private sendMessageToDataChannel(message: IDataChannelMessage, id: string) {
        const dataChannel = this.getDataChannelById(id);

        if (!dataChannel) {
            console.log(`Data channel for id ${id} does not exist`);
            return
        }
        if (dataChannel.readyState !== DataChannelReadyState.OPEN) {
            console.log(`Data channel for id ${id} is not ready yet`);
            return
        }

        dataChannel.send(JSON.stringify(message));
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
        this.setState({ localStream: { ...this.state.localStream, id: message.Id } });
    }

    // NOTE(yunsi): When received an AddPeer event, conference will create a new PeerConnection and add it to the connection list.
    private handleAddPeerMessage(message: IConfMessageAddPeer) {
        const id = message.Id;
        if (!this.state.localStream.id) {
            console.warn('handleAddPeerMessage(): localId is not set.')
            return
        }

        if (id === this.state.localStream.id) {
            return;
        }

        // NOTE(yunsi): Check if a PeerConnection is already established for the given ID.
        if (this.getPeerConnectionById(id)) {
            console.log('PeerConnection is already established for the given ID: ' + id);
            return
        }
        const peerConnection = this.createPeerConnectionById(id);

        // NOTE(yunsi): When two clients both recieved an AddPeer event with the other client's id,
        // they will do a compare to see who should create and send the offer and dataChannel.
        if (this.state.localStream.id.localeCompare(id) === 1) {
            const dataChannel = peerConnection.createDataChannel('dataChannel');
            this.setDataChannelMessageHandler(dataChannel, id);
            peerConnection
                .createOffer()
                .then(sessionDescription => this.setLocalAndSendMessage(sessionDescription, 'Offer', id))
                .catch(err => {
                    this.onError(createConferenceErrorCreateOffer(err, id));
                })
        }
    }

    private setDataChannelMessageHandler(dataChannel: RTCDataChannel, id: string) {
        let oldChannel = this.getDataChannelById(id);
        if (oldChannel) {
            // NOTE(yunsi): Ideally only one side of the RTCPeerConnection should create a data channel, but in case they
            // both create a data channel, we will replace the old channel with the new one.
            console.log(`Replace old dataChannel: ${oldChannel} of id: ${id} with new dataChannel: ${dataChannel}`)
        }
        dataChannel.onmessage = (messageEvent) => { this.handleDataChannelMessage(messageEvent, id) };
        this.dataChannels[id] = dataChannel;
    }

    private createPeerConnectionById(id: string) {
        const peerConnection = new RTCPeerConnection(this.props.peerConnectionConfig);
        // TODO(yunsi): Add data channel config
        peerConnection.onicecandidate = (event) => {
            this.handleIceCandidate(event, id)
        };
        peerConnection.onaddstream = (event) => {
            this.handleRemoteStreamAdded(event, id)
        };
        peerConnection.ondatachannel = (event) => {
            this.handleDataChannelReceived(event, id)
        };
        if (this.state.localStream.stream) {
            peerConnection.addStream(this.state.localStream.stream);
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
            peerConnection.setLocalDescription(sessionDescription)
                .catch(err => {
                    this.onError(createConferenceErrorSetLocalDescription(err, id))
                })
            this.sendMessage(message);
        }
    }

    private handleRemoteStreamAdded(event: MediaStreamEvent, id: string) {
        if (event.stream) {
            this.setState({
                remoteStreams: {
                    ...this.state.remoteStreams,
                    [id]: {
                        ...this.state.remoteStreams[id],
                        id: id,
                        stream: event.stream,
                        local: false,
                        audioEnabled: true,
                        videoEnabled: true,
                    }
                }
            })
        }
    }

    private handleDataChannelReceived(event: RTCDataChannelEvent, id: string) {
        if (event.channel) {
            this.setDataChannelMessageHandler(event.channel, id);
        }
    }

    private handleDataChannelMessage(event: MessageEvent, id: string) {
        if (event.data) {
            const message: IDataChannelMessage = JSON.parse(event.data);
            switch (message.type) {
                case 'Speech':
                    return this.handleSpeechMessage(id, message);
                case 'Audio':
                    return this.handleAudioMessage(id, message);
                case 'Video':
                    return this.handleVideoMessage(id, message);
                default:
                    return console.log('Unkonw data channel message')
            }
        }
    }

    private handleSpeechMessage(id: string, message: IDataChannelMessageSpeech) {
        console.log('Remote: ' + id + ' is speaking: ', message.isSpeaking)
        this.setState({
            remoteStreams: {
                ...this.state.remoteStreams,
                [id]: {
                    ...this.state.remoteStreams[id],
                    isSpeaking: message.isSpeaking
                }
            }
        })
    }

    private handleAudioMessage(id: string, message: IDataChannelMessageAudio) {
        if (message.id === this.state.localStream.id) {
            this.setState({
                localStream: {
                    ...this.state.localStream,
                    audioEnabled: message.enabled,
                }
            })
        } else {
            this.setState({
                remoteStreams: {
                    ...this.state.remoteStreams,
                    [id]: {
                        ...this.state.remoteStreams[id],
                        audioEnabled: message.enabled
                    }
                }
            })
        }
    }

    private handleVideoMessage(id: string, message: IDataChannelMessageVideo) {
        if (message.id === this.state.localStream.id) {
            this.setState({
                localStream: {
                    ...this.state.localStream,
                    videoEnabled: message.enabled,
                }
            })
        } else {
            this.setState({
                remoteStreams: {
                    ...this.state.remoteStreams,
                    [id]: {
                        ...this.state.remoteStreams[id],
                        videoEnabled: message.enabled
                    }
                }
            })
        }
    }

    // NOTE(yunsi): When received a RemovePeer event, conference will close that PeerConnection and remove it from the connection list.
    private handleRemovePeerMessage(message: IConfMessageRemovePeer) {
        const id = message.Id;
        const peerConnection = this.getPeerConnectionById(id);
        const dataChannel = this.getDataChannelById(id);

        if (peerConnection) {
            peerConnection.close();
        } else {
            console.warn('handleRemovePeerMessage(): Missing connection Id: %s', id);
        }

        if (dataChannel) {
            dataChannel.close();
        } else {
            console.warn('handleRemovePeerMessage(): Missing data channel Id: %s', id);
        }

        delete this.peerConnections[id];
        delete this.dataChannels[id];
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
                const promise = peerConnection.createAnswer()
                promise.catch(err => {
                    this.onError(createConferenceErrorCreateAnswer(err, id));
                })
                return promise;
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
            .then(() => this.processCandidates(id))
            .catch(err => {
                this.onError(createConferenceErrorSetRemoteDescription(err, id));
            })
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

    private getDataChannelById(id: string): RTCDataChannel {
        return this.dataChannels[id]
    }
}
