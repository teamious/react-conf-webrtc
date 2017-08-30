import 'webrtc-adapter';
import * as React from 'react';
import { IMediaStreamControlProps } from 'react-conf-webrtc';

export interface ICustomMediaStreamControlStates {
    isAudioEnabled: boolean;
    isVideoEnabled: boolean
}

export default class CustomMediaStreamControl extends React.PureComponent<IMediaStreamControlProps, ICustomMediaStreamControlStates> {
    constructor(props: IMediaStreamControlProps) {
        super(props);

        const { getAudioEnabled, getVideoEnabled } = props;

        this.state = {
            isAudioEnabled: getAudioEnabled(),
            isVideoEnabled: getVideoEnabled(),
        }

        this.handleToggleAudio = this.handleToggleAudio.bind(this);
        this.handleToggleVideo = this.handleToggleVideo.bind(this);
    }

    render() {
        const { isAudioEnabled, isVideoEnabled } = this.state;

        const muteText = isAudioEnabled ? 'Mute Audio' : 'Unmute Audio';
        const disableText = isVideoEnabled ? 'Disable Video' : 'Enable Video';

        return (
            <div className='rcw-stream-controls'>
                <button className='rcw-stream-control-mute' onClick={this.handleToggleAudio}>{muteText}</button>
                <button className='rcw-stream-control-disable' onClick={this.handleToggleVideo}>{disableText}</button>
            </div>
        )
    }

    private handleToggleAudio() {
        const { setAudioEnabled } = this.props;
        const { isAudioEnabled } = this.state;

        this.setState({isAudioEnabled: !isAudioEnabled});
        setAudioEnabled(!isAudioEnabled);
    }

    private handleToggleVideo() {
        const { setVideoEnabled } = this.props;
        const { isVideoEnabled } = this.state;

        this.setState({isVideoEnabled: !isVideoEnabled});
        setVideoEnabled(!isVideoEnabled);
    }
}
