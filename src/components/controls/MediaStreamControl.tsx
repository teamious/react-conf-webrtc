import * as React from 'react';

export interface IMediaControlProps {
    stream: MediaStream;
}

export interface IMediaControlState { }

export class MediaStreamControl extends React.PureComponent<IMediaControlProps, IMediaControlState> {
    constructor(props: IMediaControlProps) {
        super(props);

        this.onMuteButtonClick = this.onMuteButtonClick.bind(this);
        this.onDisableButtonClick = this.onDisableButtonClick.bind(this);
    }

    // TODO(yunsi): Accept JSX.Element from props and let user customize the button style or button label.
    public render() {
        return (
            <div className='media-stream-control'>
                <button className='media-stream-control-mute-audio-button' onClick={this.onMuteButtonClick}>Mute Audio</button>
                <button className='media-stream-control-disable-video-button' onClick={this.onDisableButtonClick}>Disable Video</button>
            </div>
        )
    }

    private onMuteButtonClick(event: any) {
        if (!this.props.stream) {
            console.warn('No local stream');
            return;
        }
        // TODO(yunsi): Save the audioEnabled information for later use, E.g. send it to other clients as a remote stream status information.
        const audioEnabled = this.props.stream.getAudioTracks()[0].enabled;
        this.props.stream.getAudioTracks()[0].enabled = !audioEnabled;
    }

    private onDisableButtonClick(event: any) {
        if (!this.props.stream) {
            console.warn('No local stream');
            return;
        }
        // TODO(yunsi): Save the videoEnabled information for later use, E.g. send it to other clients as a remote stream status information.
        const videoEnabled = this.props.stream.getVideoTracks()[0].enabled;
        this.props.stream.getVideoTracks()[0].enabled = !videoEnabled;
    }
}
