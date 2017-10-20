import * as React from 'react';
import * as DetectRTC from 'detectrtc';
import 'webrtc-adapter';
import { Promise } from 'es6-promise';

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
    IConfUserProfile,
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
import { StreamRecorder } from '../utils/StreamRecorder';
import { ChromeExtension } from '../utils/ChromeExtensionUtil';
import { PeerConnectionManager } from '../utils/PeerConnectionManager';
import { AudioMeter } from './controls/AudioMeter';
import { Stream } from './controls/Stream';

export interface ConferenceStream {
    id: ConfUserID,
    stream: MediaStream,
    local: boolean;
    isSpeaking: boolean;
    audioEnabled: boolean;
    videoEnabled: boolean;
    isScreenSharing: boolean;
    isRecording: boolean;
    profile: IConfUserProfile;
}

export interface IStreamsRendererProps {
    localStream: ConferenceStream | undefined;
    remoteStreams: ConferenceStream[];
    audioMonitor?: AudioMonitor;
}

export interface IMediaStreamControlRendererProps {
    toggleAudioEnabled: ToggleAudioEnabledHandler;
    toggleVideoEnabled: ToggleVideoEnabledHandler;
    toggleLocalScreenShare: () => void;
    toggleRecording: () => void;
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
    peerConnectionConfig?: RTCConfiguration;
    render?: ConferenceRenderer;
    onError?: (error: ConferenceError) => void;
}

const WebCamConstraints = {
    audio: true,
    video: true,
}

const SDPConstraints = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
}

// TODO(yunsi): Add data channel config
// var dataChannelConfig: RTCDataChannelInit = {}

export interface IConferenceState {
    localStream: ConferenceStream;
    remoteStreams: { [id: string]: ConferenceStream };
    audioMonitor?: AudioMonitor;
}

export class Conference extends React.Component<IConferenceProps, IConferenceState> {
    private connection: ConferenceConnection;
    private pcManager = new PeerConnectionManager();
    private localId: string | undefined;
    private localCamStream: MediaStream;
    private renegotiation: { [id: string]: boolean } = {};
    private streamRecorder: StreamRecorder | undefined;
    private pcConfig: RTCConfiguration | undefined;

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
        this.onToggleRecoding = this.onToggleRecoding.bind(this);
        this.onScreenSharing = this.onScreenSharing.bind(this);
        this.onScreenMediaEnded = this.onScreenMediaEnded.bind(this);

        this.state = {
            localStream: { audioEnabled: true, videoEnabled: true } as ConferenceStream,
            remoteStreams: {},
        }
    }

    public componentWillMount() {
        if (!this.checkBrowserSupport()) {
            return;
        };

        this.connection = this.props.connect();
        this.joinRoom(this.props.room);
        this.getUserMedia().then(() => {
            this.connection.subscribe(this.handleIncomingMessage)
        });
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
                    toggleLocalScreenShare: this.onScreenSharing,
                    toggleRecording: this.onToggleRecoding,
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
                {audioMonitor ? <AudioMeter audioMonitor={audioMonitor} /> : null}
            </div>
        )
    }

    public componentWillUnmount() {
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

    private onScreenSharing(): void {
        this.getScreenMedia();
    }

    private onToggleRecoding() {
        if (this.streamRecorder) {
            this.stopRecording();
            this.setLocalStream(this.state.localStream.stream, {
                isRecording: false
            });
        }
        else {
            if (this.state.localStream && this.state.localStream.stream) {
                this.streamRecorder = new StreamRecorder(this.state.localStream.stream);
                if (this.streamRecorder.canRecord) {
                    this.streamRecorder.start();
                    this.setLocalStream(this.state.localStream.stream, {
                        isRecording: true
                    });
                }
                else {
                    console.error('cannot record');
                    this.streamRecorder = undefined;
                }
            }
            else {
                console.error('No local stream for recording');
            }
        }
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
        const { audioMonitor } = this.state;

        if (!localStream) {
            return null;
        }

        return (
            <div className='rcw-conference__streams-default'>
                {this.renderStream(localStream)}
                {remoteStreams.map(this.renderStream)}
                {this.renderMediaStreamControlDefault()}
                {audioMonitor ? <AudioMeter audioMonitor={audioMonitor} /> : null}
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
        if (!this.state.localStream.id) {
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
        this.pcManager.broadcastMessage(message);
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
        this.pcManager.broadcastMessage(message);
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
        const { audioMonitor, localStream } = this.state;

        if (localStream.stream) {
            MediaStreamUtil.stopMediaStream(localStream.stream);
        }

        if (audioMonitor) {
            audioMonitor.stop();
        }

        if (!this.connection) {
            return
        }
        // NOTE(yunsi): Send Bye message to spreed server.
        const message = createOutgoingMessageBye()
        this.sendMessage(message);

        // NOTE(yunsi): Close the WebSocket connection to spreed server.
        this.connection.close();

        this.pcManager.close();
    }

    private getUserMedia() {
        return new Promise((resolve: () => void) => {
            navigator.mediaDevices.getUserMedia(WebCamConstraints)
                .then(stream => {
                    this.localCamStream = stream;
                    this.stopRecording();
                    this.setLocalStream(stream, {
                        isScreenSharing: false,
                        isRecording: false,
                    });
                    resolve()
                })
                .catch(err => {
                    // NOTE(yunsi): Didn't get stream
                    this.handleMediaException(err)
                    resolve()
                });
        })
    }

    private getScreenMedia() {
        const screenCaptureConstraints = {
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

        ChromeExtension.Instance.getShareScreenId()
            .then(sourceId => {
                screenCaptureConstraints.video.mandatory.chromeMediaSourceId = sourceId;
                return navigator.mediaDevices.getUserMedia(screenCaptureConstraints as any);
            }).then(stream => {
                if (this.localCamStream && this.localCamStream.getAudioTracks().length > 0) {
                    // NOTE(gaolw): Merge the audio track into the screen capture stream.
                    stream.addTrack(this.localCamStream.getAudioTracks()[0]);
                }

                stream.getVideoTracks()[0].onended = this.onScreenMediaEnded;
                this.stopRecording();
                this.setLocalStream(stream, {
                    isScreenSharing: true,
                    isRecording: false
                });

            })
            .catch(this.handleMediaException);;
    }

    private onScreenMediaEnded(e: any) {
        // NOTE(gaolw): switch back to web cam media.
        this.getUserMedia();
    }

    private handleMediaException(error: MediaStreamError) {
        // Exception type list: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
        this.onError(createConferenceErrorGetUserMedia(error));
    }

    private setLocalStream(stream: MediaStream, conferenceStream?: Partial<ConferenceStream>) {
        const oldStream = this.state.localStream ? this.state.localStream.stream : null;
        this.setState({
            localStream: {
                ...this.state.localStream,
                ...conferenceStream,
                stream,
                local: true,
            }
        }, () => {
            this.createAudioMonitor();
        })

        if (oldStream !== stream) {
            for (let peerId in this.pcManager.peerConnections) {
                let peerConnection = this.pcManager.getPeerConnectionById(peerId);
                if (oldStream) {
                    peerConnection.removeStream(oldStream);
                    this.renegotiation[peerId] = true;
                }
                peerConnection.addStream(stream);
            }
        }
    }

    private getRecordName() {
        // TODO(gaolw): define recording name.
        return 'recoding.webm';
    }

    private stopRecording() {
        if (this.streamRecorder) {
            this.streamRecorder.stop();
            this.streamRecorder.download(this.getRecordName());
            this.streamRecorder = undefined;
            return true;
        }

        return false;
    }

    private createAudioMonitor() {
        if (!this.state.localStream || !this.state.localStream.stream) {
            return;
        }

        if (this.state.localStream.stream.getAudioTracks().length === 0) {
            return;
        }

        // NOTE(yunsi): Add an audio monitor to listen to the speaking change of local stream.
        const audioMonitor = createAudioMonitor(this.state.localStream.stream);
        audioMonitor.on('speaking', () => {
            const message = createDataChannelMessageSpeech(true);
            this.pcManager.broadcastMessage(message)
        })
        audioMonitor.on('stopped_speaking', () => {
            const message = createDataChannelMessageSpeech(false);
            this.pcManager.broadcastMessage(message)
        })
        this.setState({ audioMonitor });
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
        if (message.pcConfig) {
            this.pcConfig = message.pcConfig;
        }
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
            this.updatePeerProfile(message.profile, id)
            return;
        }

        // NOTE(yunsi): Check if a PeerConnection is already established for the given ID.
        if (this.pcManager.getPeerConnectionById(id)) {
            console.log('PeerConnection is already established for the given ID: ' + id);
            return
        }
        const peerConnection = this.createPeerConnectionById(id);
        this.createRemoteStreamById(id);
        this.updatePeerProfile(message.profile, id)

        // NOTE(yunsi): When two clients both recieved an AddPeer event with the other client's id,
        // they will do a compare to see who should create and send the offer and dataChannel.
        if (this.state.localStream.id.localeCompare(id) === 1) {
            const dataChannel = peerConnection.createDataChannel('dataChannel');
            this.setDataChannelMessageHandler(dataChannel, id);
            return peerConnection.createOffer(
                (sessionDescription: RTCSessionDescription) => {
                    this.setLocalAndSendMessage(sessionDescription, 'Offer', id)
                },
                (err) => {
                    this.onError(createConferenceErrorCreateOffer(err, id))
                },
                SDPConstraints
            )
        }
    }

    private setDataChannelMessageHandler(dataChannel: RTCDataChannel, id: string) {
        this.pcManager.setDataChannel(dataChannel, id);
        dataChannel.onmessage = (messageEvent) => { this.handleDataChannelMessage(messageEvent, id) };
    }

    private createPeerConnectionById(id: string) {
        const pcConfig = this.getPcConfig();
        const peerConnection = this.pcManager.createPeerConnectionById(id, pcConfig);
        // TODO(yunsi): Add data channel config
        peerConnection.onicecandidate = (event) => {
            this.handleIceCandidate(event, id)
        };
        peerConnection.onaddstream = (event) => {
            console.log('peerConnection.onaddstream', event);
            this.handleRemoteStreamAdded(event, id)
        };
        peerConnection.onremovestream = (event) => {
            console.log('peerConnection.onremovestream:', event);
        }
        peerConnection.ondatachannel = (event) => {
            this.handleDataChannelReceived(event, id)
        };
        peerConnection.onnegotiationneeded = (event) => {
            // NOTE(gaolw): when negotiation needed, create offer.
            console.log('peerConnection.onnegotiationneeded:', id, this.renegotiation);
            if (this.renegotiation[id]) {
                console.log('peerConnection.onnegotiationneeded:createOffer', peerConnection);
                // NOTE(gaolw): Somehow the onnegotiationneeded will fire twice, so that offer will be created twice which will cause some errors when answering.
                this.renegotiation[id] = false;
                peerConnection.createOffer()
                    .then(sessionDescription => this.setLocalAndSendMessage(sessionDescription, 'Offer', id))
                    .catch(err => {
                        this.onError(createConferenceErrorCreateOffer(err, id));
                    });
            }
        }

        if (this.state.localStream.stream) {
            peerConnection.addStream(this.state.localStream.stream);
        }

        return peerConnection;
    }

    private getPcConfig() {
        if (this.props.peerConnectionConfig) {
            return this.props.peerConnectionConfig
        }
        if (this.pcConfig) {
            return this.pcConfig
        }
        return {}
    }

    private handleIceCandidate(event: RTCPeerConnectionIceEvent, id: string) {
        if (event.candidate) {
            const message = createOutgoingMessageCandidate(event.candidate.toJSON(), id);
            this.sendMessage(message);
        }
    }

    private setLocalAndSendMessage(sessionDescription: RTCSessionDescription, type: string, id: string) {
        const peerConnection = this.pcManager.getPeerConnectionById(id);
        if (!peerConnection) {
            console.warn('setLocalAndSendMessage(): Missing connection Id: %s');
            return
        }

        let message;
        if (type === 'Offer') {
            message = createOutgoingMessageOffer(sessionDescription, id);
        } else if (type === 'Answer') {
            message = createOutgoingMessageAnswer(sessionDescription, id);
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
                        stream: event.stream,
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

    private createRemoteStreamById(id: string) {
        this.setState({
            remoteStreams: {
                ...this.state.remoteStreams,
                [id]: {
                    ...this.state.remoteStreams[id],
                    id: id,
                    local: false
                }
            }
        })
    }

    // NOTE(yunsi): When received a RemovePeer event, conference will close that PeerConnection and remove it from the connection list.
    private handleRemovePeerMessage(message: IConfMessageRemovePeer) {
        const id = message.Id;
        this.pcManager.removePeerConnection(id);
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
        const peerConnection = this.pcManager.getPeerConnectionById(id);
        if (!peerConnection) {
            console.warn('handleCandidateMessage(): Missing connection Id: %s');
            return
        }

        // NOTE(yunsi): Check if remoteDescription exist before call addIceCandidate, if remoteDescription doesn't exist put candidate information in a queue.
        if (peerConnection.remoteDescription) {
            const rtcIceCandidate = this.createRTCIceCandidate(message.candidate);
            peerConnection.addIceCandidate(rtcIceCandidate);
        } else {
            this.pcManager.addCandidate(message.candidate, id);
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
        const peerConnection = this.pcManager.getPeerConnectionById(id);

        if (!peerConnection) {
            console.warn('handleOfferMessage(): Missing connection Id: %s', id);
            return
        }

        console.log('handleOfferMessage', peerConnection.getRemoteStreams());

        const rtcSessionDescription = message.sessionDescription;
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
            .catch(err => {
                console.warn('setRemoteDescription,', err);
                this.onError(createConferenceErrorSetRemoteDescription(err, id));
            })
        // TODO(yunsi): Add error handling.
    }

    private handleAnswerMessage(message: IConfIncomingMessageAnswer) {
        const id = message.from;
        const peerConnection = this.pcManager.getPeerConnectionById(id);

        if (!peerConnection) {
            console.warn('handleAnswerMessage(): Missing connection Id: %s', id);
            return
        }

        const rtcSessionDescription = message.sessionDescription;
        peerConnection
            .setRemoteDescription(rtcSessionDescription)
            .then(() => this.processCandidates(id))
            .catch(err => {
                console.warn('setRemoteDescription,', err);
                this.onError(createConferenceErrorSetRemoteDescription(err, id));
            })
    }

    private processCandidates(id: string) {
        const peerConnection = this.pcManager.getPeerConnectionById(id);
        if (!peerConnection) {
            console.warn('processCandidates(): Missing connection Id: %s', id);
            return
        }

        if (this.pcManager.candidates[id]) {
            while (this.pcManager.candidates[id].length > 0) {
                const candidate = this.pcManager.candidates[id].shift();
                if (candidate) {
                    const rtcIceCandidate = this.createRTCIceCandidate(candidate);
                    peerConnection.addIceCandidate(rtcIceCandidate);
                }
            }
        }
    }

    private updatePeerProfile(profile: IConfUserProfile | undefined, id: string) {
        if (!profile) {
            return;
        }

        if (id === this.state.localStream.id) {
            this.setState({
                localStream: {
                    ...this.state.localStream,
                    profile,
                }
            })
        } else {
            this.setState({
                remoteStreams: {
                    ...this.state.remoteStreams,
                    [id]: {
                        ...this.state.remoteStreams[id],
                        profile,
                    }
                }
            })
        }
    }
}
