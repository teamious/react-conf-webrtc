import * as React from 'react';

import { Stream } from './Stream'

export interface ILocalStreamProps {
    localStream: MediaStream;
}

export interface ILocalStreamState { }

export class LocalStream extends React.PureComponent<ILocalStreamProps, ILocalStreamState> {
    public render() {
        const { localStream } = this.props;
        return (
            <div className='local-stream'>
                <Stream stream={localStream} />
            </div>
        )
    }
}
