export class MediaStreamConstraintsUtil {
    public static getConstraints(mediaStreamConstraints?: MediaStreamConstraints, audioInputId?: string, videoInputId?: string): MediaStreamConstraints {

        const audioConstraints = this.getAudioConstraints(mediaStreamConstraints, audioInputId)
        const videoConstraints = this.getVideoConstraints(mediaStreamConstraints, videoInputId)

        return {
            audio: audioConstraints,
            video: videoConstraints
        }
    }

    public static getAudioOnlyConstraints(mediaStreamConstraints?: MediaStreamConstraints, audioInputId?: string) {
        const audioConstraints = this.getAudioConstraints(mediaStreamConstraints, audioInputId)

        return {
            audio: audioConstraints,
            video: false
        }
    }

    public static getVideoOnlyConstraints(mediaStreamConstraints?: MediaStreamConstraints, videoInputId?: string) {
        const videoConstraints = this.getVideoConstraints(mediaStreamConstraints, videoInputId)

        return {
            audio: false,
            video: videoConstraints
        }
    }

    private static getAudioConstraints(mediaStreamConstraints?: MediaStreamConstraints, audioInputId?: string) {
        if (!mediaStreamConstraints || mediaStreamConstraints.audio === true) {
            return { deviceId: audioInputId ? { exact: audioInputId } : undefined }
        } else if (mediaStreamConstraints.audio === false) {
            return false
        } else {
            return { ...mediaStreamConstraints.audio, deviceId: audioInputId ? { exact: audioInputId } : undefined }
        }
    }

    private static getVideoConstraints(mediaStreamConstraints?: MediaStreamConstraints, videoInputId?: string) {
        if (!mediaStreamConstraints || mediaStreamConstraints.video === true) {
            return { deviceId: videoInputId ? { exact: videoInputId } : undefined }
        } else if (mediaStreamConstraints.video === false) {
            return false
        } else {
            return { ...mediaStreamConstraints.video, deviceId: videoInputId ? { exact: videoInputId } : undefined }
        }
    }
}
