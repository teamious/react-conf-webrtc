import 'webrtc-adapter';
import * as React from 'react';
import { Conference, Connect } from 'react-conf-webrtc';

export const App = () => {
    return (
        <Conference connect={connect} room='conference/main'/>
    );
}

// TODO(andrew): Figure out how to make this work with env
function connect() {
    return Connect('wss://' + location.hostname + ':8443/ws');
}
