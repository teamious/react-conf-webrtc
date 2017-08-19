import * as React from 'react';

export interface IMediaStreamControlHandle {
    getDisable: () => boolean;
    setDisable: (disableState: boolean) => void;
    getMute: () => boolean;
    setMute: (muteState: boolean) => void;
}

export interface IMediaStreamControlRenderer {
    (handle: IMediaStreamControlHandle): JSX.Element | null | false;
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
    }

    // TODO(yunsi): Accept JSX.Element from props and let user customize the button style or button label.
    public render() {
        const { render } = this.props;
        if (render) {
            render({
                getDisable: this.getDisable,
                setDisable: this.setDisable,
                getMute: this.getMute,
                setMute: this.setMute,
            });
        }
        return (
            <div className='rcw-stream-controls'>
                <button className='rcw-stream-control-mute' onClick={this.onMuteButtonClick}>Mute Audio</button>
                <button className='rcw-stream-control-disable' onClick={this.onDisableButtonClick}>Disable Video</button>
            </div>
        )
    }

    private getMute(): boolean {
        return this.props.stream.getAudioTracks()[0].enabled;
    }

    private setMute(state: boolean) {
        return this.props.stream.getAudioTracks()[0].enabled = state;
    }

    private getDisable(): boolean {
        return this.props.stream.getVideoTracks()[0].enabled;
    }

    private setDisable(state: boolean) {
        return this.props.stream.getVideoTracks()[0].enabled = state;
    }

    private onMuteButtonClick(event: any) {
        if (!this.props.stream) {
            console.warn('No local stream');
            return;
        }
        // TODO(yunsi): Save the audioEnabled information for later use, E.g. send it to other clients as a remote stream status information.
        const audioEnabled = this.getMute();
        this.setMute(!audioEnabled);
    }

    private onDisableButtonClick(event: any) {
        if (!this.props.stream) {
            console.warn('No local stream');
            return;
        }
        // TODO(yunsi): Save the videoEnabled information for later use, E.g. send it to other clients as a remote stream status information.
        const videoEnabled = this.getDisable();
        this.setDisable(!videoEnabled);
    }
}
