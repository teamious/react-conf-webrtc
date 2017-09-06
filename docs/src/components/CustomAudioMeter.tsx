import * as React from 'react';

export interface ICustomAudioMeterProps {
    audioMonitor: any
}

export class CustomAudioMeter extends React.PureComponent<ICustomAudioMeterProps, {}> {
    private audioMeter: HTMLDivElement;

    constructor(props: ICustomAudioMeterProps) {
        super(props);

        this.refMeter = this.refMeter.bind(this);
    }

    public componentDidMount() {
        const { audioMonitor } = this.props;

        audioMonitor.on('volume_change', (volume: number) => {
            if (this.audioMeter) {
                // NOTE(yunsi): volume ranges from -100 to 0.
                // TODO(yunsi): Find a better algorithm to convert db to gain.
                const audioGain = Math.pow(10, (volume / 20));
                this.audioMeter.style.width = 1000 * audioGain + 'px';
            }
        })
    }

    public refMeter(element: HTMLDivElement) {
        this.audioMeter = element;
    }

    public render() {
        return <div className='docs-conf-audio-meter' ref={this.refMeter} />
    }
}
