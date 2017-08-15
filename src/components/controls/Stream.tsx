import * as React from 'react';

export interface IStreamProps {
    stream: MediaStream;
    className?: string;
    // TODO(yunsi): Need to figure out if we want
    // 1: each client get their own audioActivityLevel and send to other clients through RTCDataChannel.
    // or 2: each client get the remote clients' audioActivityLevel from the remote stream.
    // audioActivityLevel?: number;
};

export interface IStreamState { };

export class Stream extends React.PureComponent<IStreamProps, IStreamState> {
    public render() {
        const { stream, className } = this.props;
        const srcURL = URL.createObjectURL(stream);

        return (
            <div className={className}>
                <video src={srcURL} />
            </div>
        )
    }
}
