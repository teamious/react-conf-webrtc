import { DownloadUtil } from './DownloadUtil';

declare var MediaRecorder: any;

const CollectFrequency = 10; // 10MS;
const DelayRevokeDownloadUrl = 100; // 100MS

export class StreamRecorder {
    private recordBlobs: any[] = [];
    private mediaRecoder: any;

    constructor(mediaStream: MediaStream) {
        this.onStopped = this.onStopped.bind(this);
        this.onDataAvailable = this.onDataAvailable.bind(this);

        this.createRecorder(mediaStream);
    }

    public canRecord() {
        return !!this.mediaRecoder;
    }

    public start() {
        if (this.mediaRecoder) {
            this.mediaRecoder.start(CollectFrequency);
        }
    }

    public stop() {
        if (this.mediaRecoder) {
            this.mediaRecoder.stop();
        }
    }

    public download(filename: string) {
        const blob = new Blob(this.recordBlobs, { type: 'video/webm' });
        const url = window.URL.createObjectURL(blob);

        DownloadUtil.download(url, filename);
        setTimeout(function () {
            window.URL.revokeObjectURL(url);
        }, DelayRevokeDownloadUrl);
    }

    private createRecorder(mediaStream: MediaStream) {
        try {
            this.mediaRecoder = new MediaRecorder(mediaStream, this.getRecorderOptions());
            this.mediaRecoder.onstop = this.onStopped;
            this.mediaRecoder.ondataavailable = this.onDataAvailable;
        }
        catch (err) {
            console.error(err);
        }
    }

    private onStopped() {
        console.log('media recorder stopped');
    }

    private onDataAvailable(event: any) {
        if (event.data && event.data.size > 0) {
            this.recordBlobs.push(event.data);
        }
    }

    private getRecorderOptions() {
        let options = { mimeType: 'video/webm;codecs=vp9' };
        if (!MediaRecorder.isTypeSupported(options.mimeType)) {
            options = { mimeType: 'video/webm;codecs=vp8' };
            if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                options = { mimeType: 'video/webm' };
                if (!MediaRecorder.isTypeSupported(options.mimeType)) {
                    options = { mimeType: '' };
                }
            }
        }

        return options;
    }
}
