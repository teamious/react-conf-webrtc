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
} from 'react-conf-webrtc';

const config: RTCConfiguration = {
    'iceServers': [
        { 'urls': 'stun:stun.services.mozilla.com' },
        { 'urls': 'stun:stun.l.google.com:19302' }
    ]
};

export class App extends React.Component<{}, {}> {
    constructor() {
        super();
        this.renderStreams = this.renderStreams.bind(this);
        this.onError = this.onError.bind(this);
    }

    render() {
        return (
            <Conference
                renderMediaStreamControl={this.renderMediaStreamControl}
                renderStreams={this.renderStreams}
                connect={connect}
                room='conference/main'
                peerConnectionConfig={config}
                onError={this.onError}
            />
        );
    }

    private renderMediaStreamControl(props: IMediaStreamControlRendererProps) {
        const muteText = props.audioEnabled ? 'Mute Audio' : 'Unmute Audio';
        const disableText = props.videoEnabled ? 'Disable Video' : 'Enable Video';
        return (
            <div className='rcw-stream-controls'>
                <button className='rcw-stream-control-mute' onClick={props.toggleAudioEnabled}>{muteText}</button>
                <button className='rcw-stream-control-disable' onClick={props.toggleVideoEnabled}>{disableText}</button>
            </div>
        )
    }


    private renderRemoteStream(stream: ConferenceStream) {
        // NOTE(yunsi): Use the fisrt 10 characters as the remote name
        // TODO(yunsi): Find a better way to define remote name
        const name = stream.id.substring(0, 10);

        return (
            <div className='docs-conf-remote-stream' key={stream.id}>
                <Stream className='docs-conf-remote-stream__stream' stream={stream.stream} />
                <div className={classnames('docs-conf-remote-stream__name', { 'docs-conf-remote-stream__name--is-speaking': stream.isSpeaking })}>
                    {name}
                </div>
            </div>
        )
    }

    private renderStreams(props: IStreamsRendererProps): JSX.Element | null | false {
        return (
            <div className='docs-conf'>
                {props.localStream ? (
                    <div className='docs-conf-local-stream'>
                        <Stream stream={props.localStream.stream} muted={true} />
                    </div>
                ) : null}

                <div className='docs-conf-remote-streams'>
                    {props.remoteStreams.map(this.renderRemoteStream)}
                </div>

                {props.localStream ? (
                    <div className='docs-conf-stream-controls'>
                        <AudioMeter audioMonitor={props.audioMonitor} />
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
                return console.warn(error)
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
