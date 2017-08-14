import 'webrtc-adapter';
import * as React from 'react';
import { Conference, Connect } from 'react-conf-webrtc';

const config: RTCConfiguration = {
    'iceServers': [
        {'urls': 'stun:stun.services.mozilla.com'},
        {'urls': 'stun:stun.l.google.com:19302'}
    ]
};

export const App = () => {
    return (
        <Conference connect={connect} room='conference/main' peerConnectionConfig={config}/>
    );
}

// TODO(andrew): Figure out how to make this work with env
function connect() {
    return Connect('wss://' + location.hostname + ':8443/ws');
}
