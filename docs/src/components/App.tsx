import 'webrtc-adapter';
import * as React from 'react';
import * as classnames from 'classnames';

import {
    Conference,
    Connect,
    ConferenceStream,
    Stream,
    IMediaStreamControlRendererProps,
    AudioMeter,
    AudioMonitor,
    IStreamsRendererProps,
    ToggleAudioEnabledHandler,
    ToggleVideoEnabledHandler,
} from 'react-conf-webrtc';
import { MediaStreamControl } from './MediaStreamControl';

const config: RTCConfiguration = {
    'iceServers': [
        { 'urls': 'stun:stun.services.mozilla.com' },
        { 'urls': 'stun:stun.l.google.com:19302' }
    ]
};

export class App extends React.Component<{}, {}> {
    constructor() {
        super();
        this.renderConference = this.renderConference.bind(this);
        this.onError = this.onError.bind(this);
    }

    render() {
        return (
            <Conference
                render={this.renderConference}
                connect={connect}
                room='conference/main'
                peerConnectionConfig={config}
                onError={this.onError}
            />
        );
    }

    private onMuteStream(stream: ConferenceStream, toggleAudio: ToggleAudioEnabledHandler) {
        toggleAudio(stream);
    }

    private onDisableStream(stream: ConferenceStream, toggleVideo: ToggleVideoEnabledHandler) {
        toggleVideo(stream);
    }

    private renderRemoteStream(toggleAudioEnabled: ToggleAudioEnabledHandler, toggleVideoEnabled: ToggleVideoEnabledHandler, stream: ConferenceStream) {
        // NOTE(yunsi): Use the first 10 characters as the remote name
        // TODO(yunsi): Find a better way to define remote name
        const name = stream.id.substring(0, 10);

        return (
            <div className='docs-conf-remote-stream' key={stream.id}>
                <button type='button' onClick={this.onMuteStream.bind(this, stream, toggleAudioEnabled)}>
                    Mute
                </button>
                <button type='button' onClick={this.onDisableStream.bind(this, stream, toggleVideoEnabled)}>
                    Video
                </button>
                <Stream className='docs-conf-remote-stream__stream' stream={stream.stream} />
                <div className={classnames('docs-conf-remote-stream__name', { 'docs-conf-remote-stream__name--is-speaking': stream.isSpeaking })}>
                    {name}
                </div>
            </div>
        )
    }

    private renderConference(streamProps: IStreamsRendererProps, controlProps: IMediaStreamControlRendererProps): JSX.Element | null | false {
        const { localStream, remoteStreams, audioMonitor } = streamProps;
        const { toggleAudioEnabled, toggleVideoEnabled, toggleLocalScreenShare } = controlProps;

        return (
            <div className='docs-conf'>
                {localStream ? (
                    <div className='docs-conf-local-stream'>
                        <Stream stream={localStream.stream} muted={true} />
                    </div>
                ) : null}

                <div className='docs-conf-remote-streams'>
                    {streamProps.remoteStreams.map(this.renderRemoteStream.bind(this, toggleAudioEnabled, toggleVideoEnabled))}
                </div>

                {localStream ? (
                    <div className='docs-conf-stream-controls'>
                        <AudioMeter audioMonitor={streamProps.audioMonitor} />
                        <MediaStreamControl
                            audioEnabled={localStream.audioEnabled}
                            videoEnabled={localStream.videoEnabled}
                            toggleAudioEnabled={toggleAudioEnabled}
                            toggleVideoEnabled={toggleVideoEnabled}
                            toggleScreenShare={toggleLocalScreenShare}
                        />
                    </div>
                ) : null}
            </div>
        )
    }

    private onError(error: any) {
        switch (error) {
            case 'support':
                return console.warn('WebRTC is not supported, use Chrome or Firefox')
            case 'noWebCamPermission':
                return console.warn('No webcam permission')
            case 'noMicPermission':
                return console.warn('No mic permission')
            default:
                return console.trace(error)
        }
    }
}

// TODO(andrew): Figure out how to make this work with env
function connect() {
    const conn = Connect('wss://' + location.hostname + ':8443/ws');
    conn.onconnmessage = (msg, done) => {
        console.log('Intercepted SpreedResponse message with type: %s', msg.Data.Type);
        done()
    }
    return conn;
}
