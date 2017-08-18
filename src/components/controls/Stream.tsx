import * as React from 'react';
import * as classnames from 'classnames';

export interface IStreamProps {
    stream: MediaStream;
    className?: string;
    muted?: boolean;
    // TODO(yunsi): Need to figure out if we want
    // 1: each client get their own audioActivityLevel and send to other clients through RTCDataChannel.
    // or 2: each client get the remote clients' audioActivityLevel from the remote stream.
    // audioActivityLevel?: number;
};

export interface IStreamState { };

export class Stream extends React.PureComponent<IStreamProps, IStreamState> {
    videoRef: HTMLVideoElement;

    public componentDidMount() {
        this.videoRef.srcObject = this.props.stream;
    }

    public componentDidUpdate(nextProps: IStreamProps) {
        if (nextProps.stream !== this.props.stream) {
            // NOTE(denggl): Not running here now.
            // But in future, maybe it will switch the stream and reload the video.
            this.videoRef.srcObject = this.props.stream;
        }
    }

    public render() {
        const { className, muted } = this.props;

        return (
            <div className={classnames(this.props.className, 'rcw-stream')}>
                <video
                    className='rcw-stream-video'
                    ref={(node: HTMLVideoElement) => this.videoRef = node}
                    autoPlay={true}
                    muted={muted}
                />
            </div>
        )
    }
}
