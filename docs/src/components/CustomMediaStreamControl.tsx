import 'webrtc-adapter';
import * as React from 'react';
import { IMediaStreamControlRendererProps } from 'react-conf-webrtc';

export default class CustomMediaStreamControl extends React.PureComponent<IMediaStreamControlRendererProps, {}> {
    constructor(props: IMediaStreamControlRendererProps) {
        super(props);

        this.handleToggleAudio = this.handleToggleAudio.bind(this);
        this.handleToggleVideo = this.handleToggleVideo.bind(this);
    }

    render() {
        const { audioEnabled, videoEnabled } = this.props;

        const muteText = audioEnabled ? 'Mute Audio' : 'Unmute Audio';
        const disableText = videoEnabled ? 'Disable Video' : 'Enable Video';

        return (
            <div className='rcw-stream-controls'>
                <button className='rcw-stream-control-mute' onClick={this.handleToggleAudio}>{muteText}</button>
                <button className='rcw-stream-control-disable' onClick={this.handleToggleVideo}>{disableText}</button>
            </div>
        )
    }

    private handleToggleAudio() {
        const { audioEnabled, setAudioEnabled } = this.props;
        setAudioEnabled(!audioEnabled);
    }

    private handleToggleVideo() {
        const { videoEnabled, setVideoEnabled } = this.props;
        setVideoEnabled(!videoEnabled);
    }
}
