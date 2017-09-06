import * as React from 'react';

export interface IAudioMeterRenderer {
    (audioMonitor: any): JSX.Element | null | false;
}

export interface IAudioMeterProps {
    audioMonitor: any;
    render?: IAudioMeterRenderer
};

export class AudioMeter extends React.PureComponent<IAudioMeterProps, {}> {
    private audioMeter: HTMLDivElement;

    constructor(props: IAudioMeterProps) {
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
        const { render } = this.props;

        if (render) {
            return render(this.props.audioMonitor)
        }

        return (
            <div
                className='rcw-audio-meter'
                ref={this.refMeter}
                style={{
                    height: '20px',
                    backgroundColor: 'red',
                }}
            >
            </div>
        )
    }
}
