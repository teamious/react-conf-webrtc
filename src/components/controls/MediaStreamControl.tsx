import * as React from 'react';

export interface IMediaStreamControlProps {
    getAudioEnabled: () => boolean;
    setAudioEnabled: (enabled: boolean) => void;
    getVideoEnabled: () => boolean;
    setVideoEnabled: (enabled: boolean) => void;
}

export interface IMediaStreamControlRenderer {
    (props: IMediaStreamControlProps): JSX.Element | null | false;
}

export interface IMediaControlProps {
    stream: MediaStream;
    render? : IMediaStreamControlRenderer
}

export interface IMediaControlState { }

export class MediaStreamControl extends React.PureComponent<IMediaControlProps, IMediaControlState> {
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
                getAudioEnabled: this.getAudioEnabled,
                setAudioEnabled: this.setAudioEnabled,
                getVideoEnabled: this.getVideoEnabled,
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

    private setAudioEnabled(enabled: boolean): void {
        const track = this.props.stream.getAudioTracks()[0];
        if (track) {
            track.enabled = enabled;
        }
    }

    private getVideoEnabled(): boolean {
        const track = this.props.stream.getVideoTracks()[0];
        return track ? track.enabled : false;
    }

    private setVideoEnabled(enabled: boolean): void {
        const track = this.props.stream.getVideoTracks()[0];
        if (track) {
            track.enabled = enabled;
        }
    }

    private onMuteButtonClick(event: any) {
        if (!this.props.stream) {
            console.warn('No local stream');
            return;
        }
        // TODO(yunsi): Save the audioEnabled information for later use, E.g. send it to other clients as a remote stream status information.
        const audioEnabled = this.getAudioEnabled();
        this.setAudioEnabled(!audioEnabled);
    }

    private onDisableButtonClick(event: any) {
        if (!this.props.stream) {
            console.warn('No local stream');
            return;
        }
        // TODO(yunsi): Save the videoEnabled information for later use, E.g. send it to other clients as a remote stream status information.
        const videoEnabled = this.getVideoEnabled();
        this.setVideoEnabled(!videoEnabled);
    }
}
