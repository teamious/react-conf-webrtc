import 'webrtc-adapter';
import * as React from 'react';
import { IMediaStreamControlHandle } from 'react-conf-webrtc';

export interface ICustomMediaStreamControlProps {
    handle: IMediaStreamControlHandle;
}

export interface ICustomMediaStreamControlStates {
    isAudioEnabled: boolean;
    isVideoEnabled: boolean
}

export default class CustomMediaStreamControl extends React.PureComponent<ICustomMediaStreamControlProps, ICustomMediaStreamControlStates> {
    constructor(props: ICustomMediaStreamControlProps) {
        super(props);

        const { handle } = props;

        this.state = {
            isAudioEnabled: handle.getAudioEnabled(),
            isVideoEnabled: handle.getVideoEnabled(),
        }

        this.handleToggleAudio = this.handleToggleAudio.bind(this);
        this.handleToggleVideo = this.handleToggleVideo.bind(this);
    }

    render() {
        const { handle } = this.props;
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
        const { handle } = this.props;
        const { isAudioEnabled } = this.state;

        this.setState({isAudioEnabled: !isAudioEnabled});
        handle.setAudioEnabled(!isAudioEnabled);
    }

    private handleToggleVideo() {
        const { handle } = this.props;
        const { isVideoEnabled } = this.state;

        this.setState({isVideoEnabled: !isVideoEnabled});
        handle.setVideoEnabled(!isVideoEnabled);
    }
}
