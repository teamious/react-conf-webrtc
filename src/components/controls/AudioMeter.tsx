import * as React from 'react';

import { AudioMonitor } from '../../utils/createAudioMonitor';

export interface IAudioMeterProps {
    audioMonitor: AudioMonitor;
};

export class AudioMeter extends React.PureComponent<IAudioMeterProps, {}> {
    private audioMeterBar: HTMLDivElement;
    private audioMonitor: AudioMonitor;

    constructor(props: IAudioMeterProps) {
        super(props);

        this.refBar = this.refBar.bind(this);
    }

    public componentDidMount() {
        this.audioMonitor = this.props.audioMonitor;

        this.audioMonitor.on('volume_change', (volume: number) => {
            if (this.audioMeterBar) {
                // NOTE(yunsi): volume ranges from -100dB to 0dB, We need to convert it to float value.
                // TODO(yunsi): Find a better way to render audioMeterBar instead of operating on UI element directly.
                const audioLinearValue = Math.pow(10, (volume / 20));
                this.audioMeterBar.style.width = 100 * audioLinearValue + '%';
            }
        })
    }

    public refBar(element: HTMLDivElement) {
        this.audioMeterBar = element;
    }

    public render() {
        return (
            <div className='rcw-audio-meter'>
                <div className='rcw-audio-meter__bar' ref={this.refBar} />
            </div>
        )
    }
}
