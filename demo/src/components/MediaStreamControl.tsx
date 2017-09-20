import * as React from 'react';
import { ConferenceStream } from 'react-conf-webrtc'

interface IMediaStreamControlProps {
    audioEnabled: boolean;
    videoEnabled: boolean;
    toggleAudioEnabled: (stream?: ConferenceStream) => void;
    toggleVideoEnabled: (stream?: ConferenceStream) => void;
    toggleScreenShare?: () => void;
}

export class MediaStreamControl extends React.Component<IMediaStreamControlProps, {}> {

    constructor() {
        super()
        this.onToggleAudioEnabled = this.onToggleAudioEnabled.bind(this);
        this.onToggleVideoEnabled = this.onToggleVideoEnabled.bind(this);
        this.onToggleScreenShare = this.onToggleScreenShare.bind(this);
    }

    private onToggleAudioEnabled() {
        this.props.toggleAudioEnabled();
    }

    private onToggleVideoEnabled() {
        this.props.toggleVideoEnabled();
    }

    private onToggleScreenShare() {
        if (this.props.toggleScreenShare) {
            this.props.toggleScreenShare();
        }
    }

    render() {
        const muteText = this.props.audioEnabled ? 'Mute Audio' : 'Unmute Audio';
        const disableText = this.props.videoEnabled ? 'Disable Video' : 'Enable Video';
        const shareText = this.props.videoEnabled ? 'Share Screen' : 'Stop';
        return (
            <div className='rcw-stream-controls'>
                <button className='rcw-stream-control-mute' onClick={this.onToggleAudioEnabled}>{muteText}</button>

                <button className='rcw-stream-control-disable' onClick={this.onToggleVideoEnabled}>{disableText}</button>

                {
                    this.props.toggleScreenShare &&
                    <button className='rcw-stream-control-share' onClick={this.onToggleScreenShare}>{shareText}</button>
                }

                <a href='https://drive.google.com/uc?id=0B6HhjxLaiisFeTVzZUo1bGZ5QTQ&authuser=0&export=download'>Download ext</a>
            </div>
        )
    }
}
