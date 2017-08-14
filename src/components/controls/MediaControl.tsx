import * as React from 'react';

export interface IMediaControlProps {
    onToggleMute: (event: any) => void;
    onToggleDisable: (event: any) => void;
}

export interface IMediaControlState { }

export class MediaControl extends React.PureComponent<IMediaControlProps, IMediaControlState> {
    constructor(props: IMediaControlProps) {
        super(props);

        this.onMuteButtonClick = this.onMuteButtonClick.bind(this);
        this.onDisableButtonClick = this.onDisableButtonClick.bind(this);
    }

    // TODO(yunsi): Accept JSX.Element from props and let user customize the button style.
    public render() {
        return (
            <div className='media-control'>
                <button className='media-control-mute-audio-button' onClick={this.onMuteButtonClick}>Mute Audio</button>
                <button className='media-control-disable-video-button' onClick={this.onDisableButtonClick}>Disable Video</button>
            </div>
        )
    }

    private onMuteButtonClick(event: any) {
        this.props.onToggleMute(event);
    }

    private onDisableButtonClick(event: any) {
        this.props.onToggleDisable(event);
    }
}
