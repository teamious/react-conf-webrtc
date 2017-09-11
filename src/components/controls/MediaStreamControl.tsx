import * as React from 'react';

import { ConferenceStream } from '../Conference'

export interface IMediaStreamControlRendererProps {
    audioEnabled: boolean;
    videoEnabled: boolean;
    toggleAudioEnabled: () => void;
    toggleVideoEnabled: () => void;
}

export interface IMediaStreamControlRenderer {
    (props: IMediaStreamControlRendererProps): JSX.Element | null | false;
}

export interface IMediaControlProps {
    stream: ConferenceStream;
    render?: IMediaStreamControlRenderer;
    onAudioEnabledChange: (enabled: boolean) => void;
    onVideoEnabledChange: (enabled: boolean) => void;
}

export class MediaStreamControl extends React.PureComponent<IMediaControlProps, {}> {
    constructor(props: IMediaControlProps) {
        super(props);

        this.onMuteButtonClick = this.onMuteButtonClick.bind(this);
        this.onDisableButtonClick = this.onDisableButtonClick.bind(this);
        this.toggleAudioEnabled = this.toggleAudioEnabled.bind(this);
        this.toggleVideoEnabled = this.toggleVideoEnabled.bind(this);
    }

    public render() {
        const { render } = this.props;
        const { audioEnabled, videoEnabled } = this.props.stream;

        if (render) {
            return render({
                audioEnabled: audioEnabled,
                videoEnabled: videoEnabled,
                toggleAudioEnabled: this.toggleAudioEnabled,
                toggleVideoEnabled: this.toggleVideoEnabled,
            });
        }
        return (
            <div className='rcw-stream-controls'>
                <button className='rcw-stream-control-mute' onClick={this.onMuteButtonClick}>Mute Audio</button>
                <button className='rcw-stream-control-disable' onClick={this.onDisableButtonClick}>Disable Video</button>
            </div>
        )
    }

    private toggleAudioEnabled(): void {
        if (!this.verifyStream()) {
            return;
        }

        const { audioEnabled } = this.props.stream;
        this.props.onAudioEnabledChange(!audioEnabled);

        // TODO(yunsi): Maybe later we should move this method to somewhere else.
        const track = this.props.stream.stream.getAudioTracks()[0];
        if (track) {
            track.enabled = !audioEnabled;
        }
    }

    private toggleVideoEnabled(): void {
        if (!this.verifyStream()) {
            return;
        }

        const { videoEnabled } = this.props.stream;
        this.props.onVideoEnabledChange(!videoEnabled);

        // TODO(yunsi): Maybe later we should move this method to somewhere else.
        const track = this.props.stream.stream.getVideoTracks()[0];
        if (track) {
            track.enabled = !videoEnabled;
        }
    }

    private onMuteButtonClick(event: any) {
        if (!this.verifyStream()) {
            return;
        }

        return this.toggleAudioEnabled();
    }

    private onDisableButtonClick(event: any) {
        if (!this.verifyStream()) {
            return;
        }

        return this.toggleVideoEnabled();
    }

    private verifyStream(): boolean {
        if (!this.props.stream.stream) {
            console.warn('No local stream');
            return false;
        }
        return true;
    }
}
