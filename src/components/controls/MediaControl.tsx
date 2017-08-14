import * as React from 'react';

export interface IMediaControlProps { }

export interface IMediaControlState { }

export class MediaControl extends React.PureComponent<IMediaControlProps, IMediaControlState> {
    constructor(props: IMediaControlProps) {
        super(props);
    }

    public render() {
        return (
            <div className='media-control'>

            </div>
        )
    }
}
