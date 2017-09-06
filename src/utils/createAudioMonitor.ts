import * as Hark from 'hark';

export function createAudioMonitor(stream: MediaStream): AudioMonitor {
    return new AudioMonitor(stream);
}

export class AudioMonitor {
    private monitor: any;

    constructor(stream: MediaStream) {
        this.monitor = Hark(stream);
    }

    public on(msg: string, handler: any) {
        this.monitor.on(msg, (resp: any) => handler(resp));
    }

    public stop() {
        this.monitor.stop();
    }
}
