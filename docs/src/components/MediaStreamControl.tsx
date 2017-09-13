import * as React from 'react';
import { ConferenceStream } from 'react-conf-webrtc'

interface IMediaStreamControlProps {
    audioEnabled: boolean;
    videoEnabled: boolean;
    toggleAudioEnabled: (stream?: ConferenceStream) => void;
    toggleVideoEnabled: (stream?: ConferenceStream) => void;
}

export class MediaStreamControl extends React.Component<IMediaStreamControlProps, {}> {

    constructor() {
        super()
        this.onToggleAudioEnabled = this.onToggleAudioEnabled.bind(this);
        this.onToggleVideoEnabled = this.onToggleVideoEnabled.bind(this);
    }

    private onToggleAudioEnabled() {
        this.props.toggleAudioEnabled();
    }

    private onToggleVideoEnabled() {
        this.props.toggleVideoEnabled();
    }

    render() {
        const muteText = this.props.audioEnabled ? 'Mute Audio' : 'Unmute Audio';
        const disableText = this.props.videoEnabled ? 'Disable Video' : 'Enable Video';
        return (
            <div className='rcw-stream-controls'>
                <button className='rcw-stream-control-mute' onClick={this.onToggleAudioEnabled}>{muteText}</button>

                <button className='rcw-stream-control-disable' onClick={this.onToggleVideoEnabled}>{disableText}</button>
            </div>
        )
    }
}
