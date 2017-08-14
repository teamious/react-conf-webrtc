import * as React from 'react';

import { Stream } from './Stream'

export interface IRemoteStreamProps {
    remoteStream: { [id: string]: MediaStream };
}

export interface IRemoteStreamState { }

export class RemoteStream extends React.PureComponent<IRemoteStreamProps, IRemoteStreamState> {
    public render() {
        const { remoteStream } = this.props;
        return (
            <div className='remote-stream'>
                {Object.keys(remoteStream).map(id => {
                    return <Stream stream={remoteStream[id]} />
                })}
            </div>
        )
    }
}
