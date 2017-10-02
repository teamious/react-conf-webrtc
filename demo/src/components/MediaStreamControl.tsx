import * as React from 'react';
import { ConferenceStream, ChromeExtension, DownloadUtil } from 'react-conf-webrtc';

interface IMediaStreamControlProps {
    audioEnabled: boolean;
    videoEnabled: boolean;
    recording: boolean;
    toggleAudioEnabled: (stream?: ConferenceStream) => void;
    toggleVideoEnabled: (stream?: ConferenceStream) => void;
    toggleScreenShare?: () => void;
    toggleRecording?: () => void;
}

export class MediaStreamControl extends React.Component<IMediaStreamControlProps, {}> {

    constructor() {
        super()
        this.onToggleAudioEnabled = this.onToggleAudioEnabled.bind(this);
        this.onToggleVideoEnabled = this.onToggleVideoEnabled.bind(this);
        this.onToggleScreenShare = this.onToggleScreenShare.bind(this);
        this.onToggleRecording = this.onToggleRecording.bind(this);
    }

    private onToggleAudioEnabled() {
        this.props.toggleAudioEnabled();
    }

    private onToggleVideoEnabled() {
        this.props.toggleVideoEnabled();
    }

    private onToggleScreenShare() {
        ChromeExtension.Instance.isExtensionAvailable()
            .then(available => {
                if (available) {
                    if (this.props.toggleScreenShare) {
                        this.props.toggleScreenShare();
                    }
                }
                else {
                    DownloadUtil.download('https://github.com/teamious/react-conf-webrtc/raw/master/docs/ext/teamious.screen.chrome.crx');
                }
            })
    }

    private onToggleRecording() {
        if (this.props.toggleRecording) {
            this.props.toggleRecording();
        }
    }

    render() {
        const muteText = this.props.audioEnabled ? 'Mute Audio' : 'Unmute Audio';
        const disableText = this.props.videoEnabled ? 'Disable Video' : 'Enable Video';
        const shareText = 'Share Screen';
        const recodingText = !this.props.recording ? 'Record' : 'Stop recordig';
        return (
            <div className='rcw-stream-controls'>
                <button className='rcw-stream-control-mute' onClick={this.onToggleAudioEnabled}>{muteText}</button>

                <button className='rcw-stream-control-disable' onClick={this.onToggleVideoEnabled}>{disableText}</button>

                {
                    this.props.toggleScreenShare && ChromeExtension.Instance.isChrome() &&
                    <button className='rcw-stream-control-share' onClick={this.onToggleScreenShare}>{shareText}</button>
                }
                {
                    this.props.toggleRecording &&
                    <button className='rcw-stream-control-recoding' onClick={this.onToggleRecording}>{recodingText}</button>
                }
            </div>
        )
    }
}
