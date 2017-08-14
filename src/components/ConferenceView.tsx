// ConferenceView takes the local stream and the remote streams.

import * as React from 'react';

import { Stream } from './controls/Stream';

export interface IConferenceViewProps {
    localStream: MediaStream;
    remoteStreams?: { [id: string]: MediaStream }
}

export interface IConferenceViewState { }

export class ConferenceView extends React.PureComponent<IConferenceViewProps, IConferenceViewState> {
    constructor(props: IConferenceViewProps) {
        super(props)
    }

    public render() {
        return (
            <div>
                <Stream stream={this.props.localStream} />
            </div>
        )
    }
}
