import 'webrtc-adapter';
import * as React from 'react';
import { Conference, Connect, ConferenceStream, Stream, MediaStreamControl } from 'react-conf-webrtc';

const config: RTCConfiguration = {
    'iceServers': [
        {'urls': 'stun:stun.services.mozilla.com'},
        {'urls': 'stun:stun.l.google.com:19302'}
    ]
};

export class App extends React.Component<{}, {}> {
    constructor() {
        super();
        this.renderConferenceRoom = this.renderConferenceRoom.bind(this);
    }

    render() {
        return (
            <Conference
                render={this.renderConferenceRoom}
                connect={connect}
                room='conference/main'
                peerConnectionConfig={config}
            />
        );
    }

    private renderRemoteStream(stream: ConferenceStream) {
        return (
            <Stream className='docs-conf-remote-stream' key={stream.id} stream={stream.stream}/>
        )
    }

    private renderConferenceRoom(localStream: ConferenceStream | undefined, remoteStreams: ConferenceStream[]): JSX.Element | null | false {
        return (
            <div className='docs-conf'>
                {localStream ? (
                    <div className='docs-conf-local-stream'>
                        <Stream stream={localStream.stream}/>
                    </div>
                ) : null}

                <div className='docs-conf-remote-streams'>
                    {remoteStreams.map(this.renderRemoteStream)}
                </div>

                {localStream ? (
                    <div className='docs-conf-stream-controls'>
                        <MediaStreamControl stream={localStream.stream}/>
                    </div>
                ) : null}
            </div>
        )
    }
}

// TODO(andrew): Figure out how to make this work with env
function connect() {
    return Connect('wss://' + location.hostname + ':8443/ws');
}
