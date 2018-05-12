export class MediaStreamConstraintsUtil {
    public static mediaStreamEnabled(mediaStreamConstraints?: MediaStreamConstraints) {
        if (!mediaStreamConstraints || mediaStreamConstraints.audio || mediaStreamConstraints.video) {
            return true
        }
        return false
    }

    public static getConstraints(mediaStreamConstraints?: MediaStreamConstraints, audioInputId?: string, videoInputId?: string): MediaStreamConstraints {
        return {
            audio: this.getAudioConstraints(mediaStreamConstraints, audioInputId),
            video: this.getVideoConstraints(mediaStreamConstraints, videoInputId)
        }
    }

    public static getAudioOnlyConstraints(mediaStreamConstraints?: MediaStreamConstraints, audioInputId?: string) {
        return {
            audio: this.getAudioConstraints(mediaStreamConstraints, audioInputId),
            video: false
        }
    }

    public static getVideoOnlyConstraints(mediaStreamConstraints?: MediaStreamConstraints, videoInputId?: string) {
        return {
            audio: false,
            video: this.getVideoConstraints(mediaStreamConstraints, videoInputId)
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
