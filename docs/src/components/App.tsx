import 'webrtc-adapter';
import * as React from 'react';
import {
    Conference,
    Connect,
    ConferenceStream,
    Stream,
    MediaStreamControl,
    IMediaStreamControlRendererProps,
    AudioMeter,
    AudioMonitor,
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
        return (
            <Stream className='docs-conf-remote-stream' key={stream.id} stream={stream.stream} />
        )
    }

    private renderMediaStreamControl(props: IMediaStreamControlRendererProps) {
        return <CustomMediaStreamControl {...props} />
    }

    private renderConferenceRoom(localStream: ConferenceStream | undefined, remoteStreams: ConferenceStream[], audioMonitor: AudioMonitor): JSX.Element | null | false {
        return (
            <div className='docs-conf'>
                {localStream ? (
                    <div className='docs-conf-local-stream'>
                        <Stream stream={localStream.stream} muted={true} />
                    </div>
                ) : null}

                <div className='docs-conf-remote-streams'>
                    {remoteStreams.map(this.renderRemoteStream)}
                </div>

                {localStream ? (
                    <div className='docs-conf-stream-controls'>
                        <AudioMeter audioMonitor={audioMonitor} />
                        <MediaStreamControl
                            stream={localStream.stream}
                            render={this.renderMediaStreamControl}
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
    const conn = Connect('wss://' + location.hostname + ':8443/ws');
    conn.onconnmessage = (msg, done) => {
        console.log('Intercepted SpreedResponse message with type: %s', msg.Data.Type);
        done()
    }
    return conn;
}
