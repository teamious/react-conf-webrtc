import * as Hark from 'hark';

export function createAudioMonitor(stream: MediaStream): AudioMonitor {
    return new AudioMonitor(stream);
}

export class AudioMonitor {
    private monitor: any;

    constructor(stream: MediaStream) {
        this.monitor = Hark(stream);
    }

    public on(event: string, handler: AudioMonitorMessageHandler) {
        this.monitor.on(event, (msg: any) => handler(msg));
    }

    public stop() {
        this.monitor.stop();
    }
}

export interface AudioMonitorMessageHandler {
    (msg: any): void;
}
