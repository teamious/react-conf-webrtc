import * as React from 'react';

export interface IAudioMeterRenderer {
    (): JSX.Element | null | false;
}

export interface IAudioMeterProps {
    audioMonitor: any;
    render?: IAudioMeterRenderer
};

export interface IAudioMeterState {
    audioLevel: number;
};

export class AudioMeter extends React.PureComponent<IAudioMeterProps, IAudioMeterState> {
    private audioLevel: number;

    constructor(props: IAudioMeterProps) {
        super(props);

        this.state = {
            audioLevel: 0,
        };
    }

    public componentDidMount() {
        const { audioMonitor } = this.props;

        audioMonitor.on('volume_change', (volume: number) => {
            this.audioLevel = (volume + 100) > 0 ? volume + 100 : 0;
            console.log(this.audioLevel)
            this.setState({ audioLevel: this.audioLevel })
        })
    }

    public render() {
        console.log('re-render')
        const { render } = this.props;

        if (render) {
            return render()
        }

        return (
            <div
                className='rcw-audio-meter'
                style={{
                    height: '20px',
                    width: `${this.state.audioLevel}px`,
                    backgroundColor: 'green',
                }}
            >
            </div>
        )
    }
}
