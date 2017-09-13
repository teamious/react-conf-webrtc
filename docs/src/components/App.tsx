import 'webrtc-adapter';
import * as React from 'react';
import * as classnames from 'classnames';

import {
    Conference,
    Connect,
    ConferenceStream,
    Stream,
    MediaStreamControl,
    IMediaStreamControlRendererProps,
    AudioMeter,
    AudioMonitor,
    IConferenceRendererProps,
} from 'react-conf-webrtc';
import CustomMediaStreamControl from './CustomMediaStreamControl';

const config: RTCConfiguration = {
    'iceServers': [
        { 'urls': 'stun:stun.services.mozilla.com' },
        { 'urls': 'stun:stun.l.google.com:19302' }
    ]
};

export class App extends React.Component<{}, {}> {
    constructor() {
        super();
        this.renderConferenceRoom = this.renderConferenceRoom.bind(this);
        this.onError = this.onError.bind(this);
    }

    render() {
        return (
            <Conference
                render={this.renderConferenceRoom}
                connect={connect}
                room='conference/main'
                peerConnectionConfig={config}
                onError={this.onError}
            />
        );
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

    private renderMediaStreamControl(props: IMediaStreamControlRendererProps) {
        return <CustomMediaStreamControl {...props} />
    }

    private renderConferenceRoom(props: IConferenceRendererProps): JSX.Element | null | false {
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
                        <MediaStreamControl
                            stream={props.localStream.stream}
                            render={this.renderMediaStreamControl}
                            onAudioEnabledChange={props.onAudioEnabledChange}
                            onVideoEnabledChange={props.onVideoEnabledChange}
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
                return console.warn(error)
        }
    }
}

// TODO(andrew): Figure out how to make this work with env
function connect() {
    const conn = Connect('wss://' + 'conf.jingoal.ltd' + '/ws');
    conn.onconnmessage = (msg, done) => {
        console.log('Intercepted SpreedResponse message with type: %s', msg.Data.Type);
        done()
    }
    return conn;
}
