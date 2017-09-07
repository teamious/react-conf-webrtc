export function stopMediaStream(stream: MediaStream) {
    stream.getAudioTracks().forEach(function (track) {
        track.stop();
    });

    stream.getVideoTracks().forEach(function (track) {
        track.stop();
    });
}
