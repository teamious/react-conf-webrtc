import * as React from 'react';

export interface IMediaStreamControlRendererProps {
    audioEnabled: boolean;
    videoEnabled: boolean;
    setAudioEnabled: (enabled: boolean) => void;
    setVideoEnabled: (enabled: boolean) => void;
}

export interface IMediaStreamControlRenderer {
    (props: IMediaStreamControlRendererProps): JSX.Element | null | false;
}

export interface IMediaControlProps {
    stream: MediaStream;
    render? : IMediaStreamControlRenderer
}

export class MediaStreamControl extends React.PureComponent<IMediaControlProps, {}> {
    constructor(props: IMediaControlProps) {
        super(props);

        this.onMuteButtonClick = this.onMuteButtonClick.bind(this);
        this.onDisableButtonClick = this.onDisableButtonClick.bind(this);
        this.getAudioEnabled = this.getAudioEnabled.bind(this);
        this.setAudioEnabled = this.setAudioEnabled.bind(this);
        this.getVideoEnabled = this.getVideoEnabled.bind(this);
        this.setVideoEnabled = this.setVideoEnabled.bind(this);
    }

    public render() {
        const { render } = this.props;
        if (render) {
            return render({
                audioEnabled: this.getAudioEnabled(),
                videoEnabled: this.getVideoEnabled(),
                setAudioEnabled: this.setAudioEnabled,
                setVideoEnabled: this.setVideoEnabled,
            });
        }
        return (
            <div className='rcw-stream-controls'>
                <button className='rcw-stream-control-mute' onClick={this.onMuteButtonClick}>Mute Audio</button>
                <button className='rcw-stream-control-disable' onClick={this.onDisableButtonClick}>Disable Video</button>
            </div>
        )
    }

    private getAudioEnabled(): boolean {
        const track = this.props.stream.getAudioTracks()[0];
        return track ? track.enabled : false;
    }

    private setAudioEnabled(audioEnabled: boolean): void {
        if (!this.verifyStream()) {
            return;
        }
        const track = this.props.stream.getAudioTracks()[0];
        if (track) {
            // TODO(yunsi): Save the audioEnabled information for later use, E.g. send it to other clients as a remote stream status information.
            track.enabled = audioEnabled;
            this.forceUpdate();
        }
    }

    private getVideoEnabled(): boolean {
        const track = this.props.stream.getVideoTracks()[0];
        return track ? track.enabled : false;
    }

    private setVideoEnabled(videoEnabled: boolean): void {
        if (!this.verifyStream()) {
            return;
        }
        const track = this.props.stream.getVideoTracks()[0];
        if (track) {
            // TODO(yunsi): Save the videoEnabled information for later use, E.g. send it to other clients as a remote stream status information.
            track.enabled = videoEnabled;
            this.forceUpdate();
        }
    }

    private onMuteButtonClick(event: any) {
        if (!this.verifyStream()) {
            return;
        }
        const audioEnabled = this.getAudioEnabled();
        this.setAudioEnabled(!audioEnabled);
    }

    private onDisableButtonClick(event: any) {
        if (!this.verifyStream()) {
            return;
        }
        const videoEnabled = this.getVideoEnabled();
        this.setVideoEnabled(!videoEnabled);
    }

    private verifyStream(): boolean {
        if (!this.props.stream) {
            console.warn('No local stream');
            return false;
        }
        return true;
    }
}
