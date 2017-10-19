webpackJsonp([0],{

/***/ 191:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
__webpack_require__(192);
var React = __webpack_require__(14);
var classnames = __webpack_require__(203);
var config_1 = __webpack_require__(204);
var react_conf_webrtc_1 = __webpack_require__(80);
var MediaStreamControl_1 = __webpack_require__(238);
var config = {
    'iceServers': [
        { 'urls': 'stun:stun.services.mozilla.com' },
        { 'urls': 'stun:stun.l.google.com:19302' }
        //{ 'urls': 'stun:coturn.jingoal.ltd:3478' }
    ]
};
var App = (function (_super) {
    __extends(App, _super);
    function App() {
        var _this = _super.call(this) || this;
        _this.renderConference = _this.renderConference.bind(_this);
        _this.onError = _this.onError.bind(_this);
        return _this;
    }
    App.prototype.render = function () {
        return (React.createElement(react_conf_webrtc_1.Conference, { render: this.renderConference, connect: connect, room: 'conference/main', peerConnectionConfig: config, onError: this.onError }));
    };
    App.prototype.onMuteStream = function (stream, toggleAudio) {
        toggleAudio(stream);
    };
    App.prototype.onDisableStream = function (stream, toggleVideo) {
        toggleVideo(stream);
    };
    App.prototype.renderRemoteStream = function (toggleAudioEnabled, toggleVideoEnabled, stream) {
        // NOTE(yunsi): Use the first 10 characters as the remote name
        // TODO(yunsi): Find a better way to define remote name
        var name = stream.id.substring(0, 10);
        return (React.createElement("div", { className: 'docs-conf-remote-stream', key: stream.id },
            React.createElement("button", { type: 'button', onClick: this.onMuteStream.bind(this, stream, toggleAudioEnabled) }, "Mute"),
            React.createElement("button", { type: 'button', onClick: this.onDisableStream.bind(this, stream, toggleVideoEnabled) }, "Video"),
            React.createElement(react_conf_webrtc_1.Stream, { className: 'docs-conf-remote-stream__stream', stream: stream.stream }),
            React.createElement("div", { className: classnames('docs-conf-remote-stream__name', { 'docs-conf-remote-stream__name--is-speaking': stream.isSpeaking }) }, name)));
    };
    App.prototype.renderConference = function (streamProps, controlProps) {
        var localStream = streamProps.localStream, remoteStreams = streamProps.remoteStreams, audioMonitor = streamProps.audioMonitor;
        var toggleAudioEnabled = controlProps.toggleAudioEnabled, toggleVideoEnabled = controlProps.toggleVideoEnabled, toggleLocalScreenShare = controlProps.toggleLocalScreenShare, toggleRecording = controlProps.toggleRecording;
        return (React.createElement("div", { className: 'docs-conf' },
            localStream ? (React.createElement("div", { className: 'docs-conf-local-stream' },
                React.createElement(react_conf_webrtc_1.Stream, { mirror: !localStream.isScreenSharing, stream: localStream.stream, muted: true, isRecording: localStream.isRecording }))) : null,
            React.createElement("div", { className: 'docs-conf-remote-streams' }, streamProps.remoteStreams.map(this.renderRemoteStream.bind(this, toggleAudioEnabled, toggleVideoEnabled))),
            localStream ? (React.createElement("div", { className: 'docs-conf-stream-controls' },
                audioMonitor ? React.createElement(react_conf_webrtc_1.AudioMeter, { audioMonitor: audioMonitor }) : null,
                React.createElement(MediaStreamControl_1.MediaStreamControl, { audioEnabled: localStream.audioEnabled, videoEnabled: localStream.videoEnabled, recording: localStream.isRecording, toggleAudioEnabled: toggleAudioEnabled, toggleVideoEnabled: toggleVideoEnabled, toggleScreenShare: toggleLocalScreenShare, toggleRecording: toggleRecording }))) : null));
    };
    App.prototype.onError = function (error) {
        switch (error) {
            case 'support':
                return console.warn('WebRTC is not supported, use Chrome or Firefox');
            case 'noWebCamPermission':
                return console.warn('No webcam permission');
            case 'noMicPermission':
                return console.warn('No mic permission');
            default:
                return console.trace(error);
        }
    };
    return App;
}(React.Component));
exports.App = App;
// TODO(andrew): Figure out how to make this work with env
function connect() {
    var webRTCUrl = config_1.env.SPREED_URL ? config_1.env.SPREED_URL : location.hostname + ":8443";
    var conn = react_conf_webrtc_1.SpreedConnect('wss://' + webRTCUrl + '/ws');
    conn.onconnmessage = function (msg, done) {
        console.log('Intercepted SpreedResponse message with type: %s', msg.Data.Type);
        done();
    };
    return conn;
}


/***/ }),

/***/ 204:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.env = Object({"FAVICON_URL":"/favicon.ico","SPREED_URL":"conf.jingoal.ltd","NODE_ENV":"production"});


/***/ }),

/***/ 205:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(206));
__export(__webpack_require__(234));


/***/ }),

/***/ 206:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var React = __webpack_require__(14);
var DetectRTC = __webpack_require__(207);
__webpack_require__(208);
var es6_promise_1 = __webpack_require__(82);
var services_1 = __webpack_require__(220);
var createAudioMonitor_1 = __webpack_require__(83);
var MediaStreamUtil = __webpack_require__(84);
var StreamRecorder_1 = __webpack_require__(226);
var ChromeExtensionUtil_1 = __webpack_require__(86);
var PeerConnectionManager_1 = __webpack_require__(230);
var AudioMeter_1 = __webpack_require__(89);
var Stream_1 = __webpack_require__(90);
var WebCamConstraints = {
    audio: true,
    video: true,
};
var SDPConstraints = {
    offerToReceiveAudio: 1,
    offerToReceiveVideo: 1
};
var Conference = (function (_super) {
    __extends(Conference, _super);
    function Conference(props) {
        var _this = _super.call(this, props) || this;
        _this.pcManager = new PeerConnectionManager_1.PeerConnectionManager();
        _this.renegotiation = {};
        _this.handleIncomingMessage = _this.handleIncomingMessage.bind(_this);
        _this.handleMediaException = _this.handleMediaException.bind(_this);
        _this.renderStream = _this.renderStream.bind(_this);
        _this.onAudioEnabledChange = _this.onAudioEnabledChange.bind(_this);
        _this.onVideoEnabledChange = _this.onVideoEnabledChange.bind(_this);
        _this.toggleAudioEnabled = _this.toggleAudioEnabled.bind(_this);
        _this.toggleVideoEnabled = _this.toggleVideoEnabled.bind(_this);
        _this.renderMediaStreamControlDefault = _this.renderMediaStreamControlDefault.bind(_this);
        _this.renderStreamsDefault = _this.renderStreamsDefault.bind(_this);
        _this.onToggleAudio = _this.onToggleAudio.bind(_this);
        _this.onToggleVideo = _this.onToggleVideo.bind(_this);
        _this.onToggleRecoding = _this.onToggleRecoding.bind(_this);
        _this.onScreenSharing = _this.onScreenSharing.bind(_this);
        _this.onScreenMediaEnded = _this.onScreenMediaEnded.bind(_this);
        _this.state = {
            localStream: { audioEnabled: true, videoEnabled: true },
            remoteStreams: {},
        };
        return _this;
    }
    Conference.prototype.componentWillMount = function () {
        var _this = this;
        if (!this.checkBrowserSupport()) {
            return;
        }
        ;
        this.connection = this.props.connect();
        this.joinRoom(this.props.room);
        this.getUserMedia().then(function () {
            _this.connection.subscribe(_this.handleIncomingMessage);
        });
    };
    Conference.prototype.render = function () {
        var remoteStreams = this.getRemoteConferenceStreams();
        var localStream = this.getLocalConferenceStream();
        var render = this.props.render;
        var audioMonitor = this.state.audioMonitor;
        if (localStream) {
            this.changeAudioTrackEnabled(localStream.audioEnabled);
            this.changeVideoTrackEnabled(localStream.videoEnabled);
        }
        if (render) {
            return render({
                localStream: localStream,
                remoteStreams: remoteStreams,
                audioMonitor: audioMonitor,
            }, {
                toggleAudioEnabled: this.toggleAudioEnabled,
                toggleVideoEnabled: this.toggleVideoEnabled,
                toggleLocalScreenShare: this.onScreenSharing,
                toggleRecording: this.onToggleRecoding,
            });
        }
        if (!localStream) {
            return null;
        }
        return (React.createElement("div", { className: 'rcw-conference' },
            this.renderStream(localStream),
            remoteStreams.map(this.renderStream),
            this.renderMediaStreamControlDefault(),
            audioMonitor ? React.createElement(AudioMeter_1.AudioMeter, { audioMonitor: audioMonitor }) : null));
    };
    Conference.prototype.componentWillUnmount = function () {
        this.leaveRoom();
    };
    // NOTE(andrews): toggleAudioEnabled allows you to control the audio tracks
    // of any stream. If no stream is provided, then it defaults to using the
    // local stream object.
    Conference.prototype.toggleAudioEnabled = function (stream) {
        if (!stream) {
            stream = this.state.localStream;
        }
        var trackStatus = stream.audioEnabled;
        this.onAudioEnabledChange(stream, !trackStatus);
    };
    // NOTE(andrews): toggleVideoEnabled allows you to control the videos tracks
    // of any stream. If no stream is provided, then it defaults to using the
    // local stream object.
    Conference.prototype.toggleVideoEnabled = function (stream) {
        if (!stream) {
            stream = this.state.localStream;
        }
        var trackStatus = stream.videoEnabled;
        this.onVideoEnabledChange(stream, !trackStatus);
    };
    Conference.prototype.onToggleAudio = function () {
        this.toggleAudioEnabled();
    };
    Conference.prototype.onToggleVideo = function () {
        this.toggleVideoEnabled();
    };
    Conference.prototype.onScreenSharing = function () {
        this.getScreenMedia();
    };
    Conference.prototype.onToggleRecoding = function () {
        if (this.streamRecorder) {
            this.stopRecording();
            this.setLocalStream(this.state.localStream.stream, {
                isRecording: false
            });
        }
        else {
            if (this.state.localStream && this.state.localStream.stream) {
                this.streamRecorder = new StreamRecorder_1.StreamRecorder(this.state.localStream.stream);
                if (this.streamRecorder.canRecord) {
                    this.streamRecorder.start();
                    this.setLocalStream(this.state.localStream.stream, {
                        isRecording: true
                    });
                }
                else {
                    console.error('cannot record');
                    this.streamRecorder = undefined;
                }
            }
            else {
                console.error('No local stream for recording');
            }
        }
    };
    Conference.prototype.renderMediaStreamControlDefault = function () {
        return (React.createElement("div", { className: 'rcw-conference__media-stream-controls-default' },
            React.createElement("div", { className: 'rcw-stream-controls' },
                React.createElement("button", { className: 'rcw-stream-control-mute', onClick: this.onToggleAudio }, "Mute Audio"),
                React.createElement("button", { className: 'rcw-stream-control-disable', onClick: this.onToggleVideo }, "Disable Video"))));
    };
    Conference.prototype.renderStreamsDefault = function () {
        var localStream = this.getLocalConferenceStream();
        var remoteStreams = this.getRemoteConferenceStreams();
        var audioMonitor = this.state.audioMonitor;
        if (!localStream) {
            return null;
        }
        return (React.createElement("div", { className: 'rcw-conference__streams-default' },
            this.renderStream(localStream),
            remoteStreams.map(this.renderStream),
            this.renderMediaStreamControlDefault(),
            audioMonitor ? React.createElement(AudioMeter_1.AudioMeter, { audioMonitor: audioMonitor }) : null));
    };
    Conference.prototype.checkBrowserSupport = function () {
        if (DetectRTC.isWebRTCSupported === false) {
            this.onError(services_1.createConferenceErrorWebRTCNotSupported());
            return false;
        }
        return true;
    };
    Conference.prototype.onError = function (error) {
        if (!this.props.onError) {
            return console.warn(error);
        }
        this.props.onError(error);
    };
    Conference.prototype.getLocalConferenceStream = function () {
        if (!this.state.localStream.id) {
            return;
        }
        return this.state.localStream;
    };
    Conference.prototype.getRemoteConferenceStreams = function () {
        var _this = this;
        return Object.keys(this.state.remoteStreams).map(function (id) {
            return _this.state.remoteStreams[id];
        });
    };
    Conference.prototype.changeAudioTrackEnabled = function (enabled) {
        var stream = this.state.localStream.stream;
        if (!stream) {
            console.warn('changeAudioTrackEnabled(): No local stream.');
            return;
        }
        var track = stream.getAudioTracks()[0];
        if (!track) {
            console.warn('changeAudioTrackEnabled(): No audio track');
            return;
        }
        track.enabled = enabled;
    };
    Conference.prototype.changeVideoTrackEnabled = function (enabled) {
        var stream = this.state.localStream.stream;
        if (!stream) {
            console.warn('changeVideoTrackEnabled(): No local stream.');
            return;
        }
        var track = stream.getVideoTracks()[0];
        if (!track) {
            console.warn('changeVideoTrackEnabled(): No video track');
            return;
        }
        track.enabled = enabled;
    };
    Conference.prototype.onAudioEnabledChange = function (stream, enabled) {
        if (stream.id === this.state.localStream.id) {
            this.setState({
                localStream: __assign({}, this.state.localStream, { audioEnabled: enabled })
            });
        }
        else {
            this.setState({
                remoteStreams: __assign({}, this.state.remoteStreams, (_a = {}, _a[stream.id] = __assign({}, this.state.remoteStreams[stream.id], { audioEnabled: enabled }), _a))
            });
        }
        var message = services_1.createDataChannelMessageAudio(stream.id, enabled);
        this.pcManager.broadcastMessage(message);
        var _a;
    };
    Conference.prototype.onVideoEnabledChange = function (stream, enabled) {
        if (stream.id === this.state.localStream.id) {
            this.setState({
                localStream: __assign({}, this.state.localStream, { videoEnabled: enabled })
            });
        }
        else {
            this.setState({
                remoteStreams: __assign({}, this.state.remoteStreams, (_a = {}, _a[stream.id] = __assign({}, this.state.remoteStreams[stream.id], { videoEnabled: enabled }), _a))
            });
        }
        var message = services_1.createDataChannelMessageVideo(stream.id, enabled);
        this.pcManager.broadcastMessage(message);
        var _a;
    };
    Conference.prototype.renderStream = function (stream) {
        var className = 'rcw-remote-stream';
        var muted;
        if (stream.local) {
            className = 'rcw-local-stream';
            muted = true;
        }
        return (React.createElement(Stream_1.Stream, { key: stream.id, className: className, stream: stream.stream, muted: muted }));
    };
    Conference.prototype.sendMessage = function (message) {
        this.connection.publish(message);
    };
    Conference.prototype.joinRoom = function (room) {
        var message = services_1.createOutgoingMessageJoin(room);
        this.sendMessage(message);
    };
    Conference.prototype.leaveRoom = function () {
        var _a = this.state, audioMonitor = _a.audioMonitor, localStream = _a.localStream;
        if (localStream.stream) {
            MediaStreamUtil.stopMediaStream(localStream.stream);
        }
        if (audioMonitor) {
            audioMonitor.stop();
        }
        if (!this.connection) {
            return;
        }
        // NOTE(yunsi): Send Bye message to spreed server.
        var message = services_1.createOutgoingMessageBye();
        this.sendMessage(message);
        // NOTE(yunsi): Close the WebSocket connection to spreed server.
        this.connection.close();
        this.pcManager.close();
    };
    Conference.prototype.getUserMedia = function () {
        var _this = this;
        return new es6_promise_1.Promise(function (resolve) {
            navigator.mediaDevices.getUserMedia(WebCamConstraints)
                .then(function (stream) {
                _this.localCamStream = stream;
                _this.stopRecording();
                _this.setLocalStream(stream, {
                    isScreenSharing: false,
                    isRecording: false,
                });
                resolve();
            })
                .catch(function (err) {
                // NOTE(yunsi): Didn't get stream
                _this.handleMediaException(err);
                resolve();
            });
        });
    };
    Conference.prototype.getScreenMedia = function () {
        var _this = this;
        var screenCaptureConstraints = {
            video: {
                mandatory: {
                    chromeMediaSource: 'desktop',
                    chromeMediaSourceId: '',
                    maxWidth: screen.width > 1920 ? screen.width : 1920,
                    maxHeight: screen.height > 1080 ? screen.height : 1080
                }
            },
            audio: false,
        };
        ChromeExtensionUtil_1.ChromeExtension.Instance.getShareScreenId()
            .then(function (sourceId) {
            screenCaptureConstraints.video.mandatory.chromeMediaSourceId = sourceId;
            return navigator.mediaDevices.getUserMedia(screenCaptureConstraints);
        }).then(function (stream) {
            if (_this.localCamStream && _this.localCamStream.getAudioTracks().length > 0) {
                // NOTE(gaolw): Merge the audio track into the screen capture stream.
                stream.addTrack(_this.localCamStream.getAudioTracks()[0]);
            }
            stream.getVideoTracks()[0].onended = _this.onScreenMediaEnded;
            _this.stopRecording();
            _this.setLocalStream(stream, {
                isScreenSharing: true,
                isRecording: false
            });
        })
            .catch(this.handleMediaException);
        ;
    };
    Conference.prototype.onScreenMediaEnded = function (e) {
        // NOTE(gaolw): switch back to web cam media.
        this.getUserMedia();
    };
    Conference.prototype.handleMediaException = function (error) {
        // Exception type list: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
        this.onError(services_1.createConferenceErrorGetUserMedia(error));
    };
    Conference.prototype.setLocalStream = function (stream, conferenceStream) {
        var _this = this;
        var oldStream = this.state.localStream ? this.state.localStream.stream : null;
        this.setState({
            localStream: __assign({}, this.state.localStream, conferenceStream, { stream: stream, local: true })
        }, function () {
            _this.createAudioMonitor();
        });
        if (oldStream !== stream) {
            for (var peerId in this.pcManager.peerConnections) {
                var peerConnection = this.pcManager.getPeerConnectionById(peerId);
                if (oldStream) {
                    peerConnection.removeStream(oldStream);
                    this.renegotiation[peerId] = true;
                }
                peerConnection.addStream(stream);
            }
        }
    };
    Conference.prototype.getRecordName = function () {
        // TODO(gaolw): define recording name.
        return 'recoding.webm';
    };
    Conference.prototype.stopRecording = function () {
        if (this.streamRecorder) {
            this.streamRecorder.stop();
            this.streamRecorder.download(this.getRecordName());
            this.streamRecorder = undefined;
            return true;
        }
        return false;
    };
    Conference.prototype.createAudioMonitor = function () {
        var _this = this;
        if (!this.state.localStream || !this.state.localStream.stream) {
            return;
        }
        if (this.state.localStream.stream.getAudioTracks().length === 0) {
            return;
        }
        // NOTE(yunsi): Add an audio monitor to listen to the speaking change of local stream.
        var audioMonitor = createAudioMonitor_1.createAudioMonitor(this.state.localStream.stream);
        audioMonitor.on('speaking', function () {
            var message = services_1.createDataChannelMessageSpeech(true);
            _this.pcManager.broadcastMessage(message);
        });
        audioMonitor.on('stopped_speaking', function () {
            var message = services_1.createDataChannelMessageSpeech(false);
            _this.pcManager.broadcastMessage(message);
        });
        this.setState({ audioMonitor: audioMonitor });
    };
    Conference.prototype.handleIncomingMessage = function (message) {
        switch (message.type) {
            case 'Self':
                return this.handleSelfMessage(message);
            case 'AddPeer':
                return this.handleAddPeerMessage(message);
            case 'RemovePeer':
                return this.handleRemovePeerMessage(message);
            case 'Candidate':
                return this.handleCandidateMessage(message);
            case 'Offer':
                return this.handleOfferMessage(message);
            case 'Answer':
                return this.handleAnswerMessage(message);
            default:
                return console.log('Unkonw message type');
        }
    };
    Conference.prototype.handleSelfMessage = function (message) {
        this.setState({ localStream: __assign({}, this.state.localStream, { id: message.Id }) });
    };
    // NOTE(yunsi): When received an AddPeer event, conference will create a new PeerConnection and add it to the connection list.
    Conference.prototype.handleAddPeerMessage = function (message) {
        var _this = this;
        var id = message.Id;
        if (!this.state.localStream.id) {
            console.warn('handleAddPeerMessage(): localId is not set.');
            return;
        }
        if (id === this.state.localStream.id) {
            this.updatePeerProfile(message.profile, id);
            return;
        }
        // NOTE(yunsi): Check if a PeerConnection is already established for the given ID.
        if (this.pcManager.getPeerConnectionById(id)) {
            console.log('PeerConnection is already established for the given ID: ' + id);
            return;
        }
        var peerConnection = this.createPeerConnectionById(id);
        this.createRemoteStreamById(id);
        this.updatePeerProfile(message.profile, id);
        // NOTE(yunsi): When two clients both recieved an AddPeer event with the other client's id,
        // they will do a compare to see who should create and send the offer and dataChannel.
        if (this.state.localStream.id.localeCompare(id) === 1) {
            var dataChannel = peerConnection.createDataChannel('dataChannel');
            this.setDataChannelMessageHandler(dataChannel, id);
            return peerConnection.createOffer(function (sessionDescription) {
                _this.setLocalAndSendMessage(sessionDescription, 'Offer', id);
            }, function (err) {
                _this.onError(services_1.createConferenceErrorCreateOffer(err, id));
            }, SDPConstraints);
        }
    };
    Conference.prototype.setDataChannelMessageHandler = function (dataChannel, id) {
        var _this = this;
        this.pcManager.setDataChannel(dataChannel, id);
        dataChannel.onmessage = function (messageEvent) { _this.handleDataChannelMessage(messageEvent, id); };
    };
    Conference.prototype.createPeerConnectionById = function (id) {
        var _this = this;
        var peerConnection = this.pcManager.createPeerConnectionById(id, this.props.peerConnectionConfig);
        // TODO(yunsi): Add data channel config
        peerConnection.onicecandidate = function (event) {
            _this.handleIceCandidate(event, id);
        };
        peerConnection.onaddstream = function (event) {
            console.log('peerConnection.onaddstream', event);
            _this.handleRemoteStreamAdded(event, id);
        };
        peerConnection.onremovestream = function (event) {
            console.log('peerConnection.onremovestream:', event);
        };
        peerConnection.ondatachannel = function (event) {
            _this.handleDataChannelReceived(event, id);
        };
        peerConnection.onnegotiationneeded = function (event) {
            // NOTE(gaolw): when negotiation needed, create offer.
            console.log('peerConnection.onnegotiationneeded:', id, _this.renegotiation);
            if (_this.renegotiation[id]) {
                console.log('peerConnection.onnegotiationneeded:createOffer', peerConnection);
                // NOTE(gaolw): Somehow the onnegotiationneeded will fire twice, so that offer will be created twice which will cause some errors when answering.
                _this.renegotiation[id] = false;
                peerConnection.createOffer()
                    .then(function (sessionDescription) { return _this.setLocalAndSendMessage(sessionDescription, 'Offer', id); })
                    .catch(function (err) {
                    _this.onError(services_1.createConferenceErrorCreateOffer(err, id));
                });
            }
        };
        if (this.state.localStream.stream) {
            peerConnection.addStream(this.state.localStream.stream);
        }
        return peerConnection;
    };
    Conference.prototype.handleIceCandidate = function (event, id) {
        if (event.candidate) {
            var message = services_1.createOutgoingMessageCandidate(event.candidate.toJSON(), id);
            this.sendMessage(message);
        }
    };
    Conference.prototype.setLocalAndSendMessage = function (sessionDescription, type, id) {
        var _this = this;
        var peerConnection = this.pcManager.getPeerConnectionById(id);
        if (!peerConnection) {
            console.warn('setLocalAndSendMessage(): Missing connection Id: %s');
            return;
        }
        var message;
        if (type === 'Offer') {
            message = services_1.createOutgoingMessageOffer(sessionDescription, id);
        }
        else if (type === 'Answer') {
            message = services_1.createOutgoingMessageAnswer(sessionDescription, id);
        }
        if (message) {
            peerConnection.setLocalDescription(sessionDescription)
                .catch(function (err) {
                _this.onError(services_1.createConferenceErrorSetLocalDescription(err, id));
            });
            this.sendMessage(message);
        }
    };
    Conference.prototype.handleRemoteStreamAdded = function (event, id) {
        if (event.stream) {
            this.setState({
                remoteStreams: __assign({}, this.state.remoteStreams, (_a = {}, _a[id] = __assign({}, this.state.remoteStreams[id], { stream: event.stream, audioEnabled: true, videoEnabled: true }), _a))
            });
        }
        var _a;
    };
    Conference.prototype.handleDataChannelReceived = function (event, id) {
        if (event.channel) {
            this.setDataChannelMessageHandler(event.channel, id);
        }
    };
    Conference.prototype.handleDataChannelMessage = function (event, id) {
        if (event.data) {
            var message = JSON.parse(event.data);
            switch (message.type) {
                case 'Speech':
                    return this.handleSpeechMessage(id, message);
                case 'Audio':
                    return this.handleAudioMessage(id, message);
                case 'Video':
                    return this.handleVideoMessage(id, message);
                default:
                    return console.log('Unkonw data channel message');
            }
        }
    };
    Conference.prototype.handleSpeechMessage = function (id, message) {
        this.setState({
            remoteStreams: __assign({}, this.state.remoteStreams, (_a = {}, _a[id] = __assign({}, this.state.remoteStreams[id], { isSpeaking: message.isSpeaking }), _a))
        });
        var _a;
    };
    Conference.prototype.handleAudioMessage = function (id, message) {
        if (message.id === this.state.localStream.id) {
            this.setState({
                localStream: __assign({}, this.state.localStream, { audioEnabled: message.enabled })
            });
        }
        else {
            this.setState({
                remoteStreams: __assign({}, this.state.remoteStreams, (_a = {}, _a[id] = __assign({}, this.state.remoteStreams[id], { audioEnabled: message.enabled }), _a))
            });
        }
        var _a;
    };
    Conference.prototype.handleVideoMessage = function (id, message) {
        if (message.id === this.state.localStream.id) {
            this.setState({
                localStream: __assign({}, this.state.localStream, { videoEnabled: message.enabled })
            });
        }
        else {
            this.setState({
                remoteStreams: __assign({}, this.state.remoteStreams, (_a = {}, _a[id] = __assign({}, this.state.remoteStreams[id], { videoEnabled: message.enabled }), _a))
            });
        }
        var _a;
    };
    Conference.prototype.createRemoteStreamById = function (id) {
        this.setState({
            remoteStreams: __assign({}, this.state.remoteStreams, (_a = {}, _a[id] = __assign({}, this.state.remoteStreams[id], { id: id, local: false }), _a))
        });
        var _a;
    };
    // NOTE(yunsi): When received a RemovePeer event, conference will close that PeerConnection and remove it from the connection list.
    Conference.prototype.handleRemovePeerMessage = function (message) {
        var id = message.Id;
        this.pcManager.removePeerConnection(id);
        var remoteStreams = __assign({}, this.state.remoteStreams);
        delete remoteStreams[id];
        this.setState({
            remoteStreams: remoteStreams
        });
    };
    Conference.prototype.handleCandidateMessage = function (message) {
        var id = message.from;
        var peerConnection = this.pcManager.getPeerConnectionById(id);
        if (!peerConnection) {
            console.warn('handleCandidateMessage(): Missing connection Id: %s');
            return;
        }
        // NOTE(yunsi): Check if remoteDescription exist before call addIceCandidate, if remoteDescription doesn't exist put candidate information in a queue.
        if (peerConnection.remoteDescription) {
            var rtcIceCandidate = this.createRTCIceCandidate(message.candidate);
            peerConnection.addIceCandidate(rtcIceCandidate);
        }
        else {
            this.pcManager.addCandidate(message.candidate, id);
        }
    };
    // NOTE(yunsi): Convert the RTCIceCandidate JSON object to an actual RTCIceCandidate object.
    // TODO(yunsi): Find a better solution besides type cast.
    Conference.prototype.createRTCIceCandidate = function (candidate) {
        return new RTCIceCandidate(candidate);
    };
    // NOTE(yunsi): When received an Offer event, conference will set it as RemoteDescription and create an answer to the offer.
    Conference.prototype.handleOfferMessage = function (message) {
        var _this = this;
        var id = message.from;
        var peerConnection = this.pcManager.getPeerConnectionById(id);
        if (!peerConnection) {
            console.warn('handleOfferMessage(): Missing connection Id: %s', id);
            return;
        }
        console.log('handleOfferMessage', peerConnection.getRemoteStreams());
        var rtcSessionDescription = message.sessionDescription;
        peerConnection
            .setRemoteDescription(rtcSessionDescription)
            .then(function () {
            _this.processCandidates(id);
            var promise = peerConnection.createAnswer();
            promise.catch(function (err) {
                _this.onError(services_1.createConferenceErrorCreateAnswer(err, id));
            });
            return promise;
        })
            .then(function (sessionDescription) { return _this.setLocalAndSendMessage(sessionDescription, 'Answer', id); })
            .catch(function (err) {
            console.warn('setRemoteDescription,', err);
            _this.onError(services_1.createConferenceErrorSetRemoteDescription(err, id));
        });
        // TODO(yunsi): Add error handling.
    };
    Conference.prototype.handleAnswerMessage = function (message) {
        var _this = this;
        var id = message.from;
        var peerConnection = this.pcManager.getPeerConnectionById(id);
        if (!peerConnection) {
            console.warn('handleAnswerMessage(): Missing connection Id: %s', id);
            return;
        }
        var rtcSessionDescription = message.sessionDescription;
        peerConnection
            .setRemoteDescription(rtcSessionDescription)
            .then(function () { return _this.processCandidates(id); })
            .catch(function (err) {
            console.warn('setRemoteDescription,', err);
            _this.onError(services_1.createConferenceErrorSetRemoteDescription(err, id));
        });
    };
    Conference.prototype.processCandidates = function (id) {
        var peerConnection = this.pcManager.getPeerConnectionById(id);
        if (!peerConnection) {
            console.warn('processCandidates(): Missing connection Id: %s', id);
            return;
        }
        if (this.pcManager.candidates[id]) {
            while (this.pcManager.candidates[id].length > 0) {
                var candidate = this.pcManager.candidates[id].shift();
                if (candidate) {
                    var rtcIceCandidate = this.createRTCIceCandidate(candidate);
                    peerConnection.addIceCandidate(rtcIceCandidate);
                }
            }
        }
    };
    Conference.prototype.updatePeerProfile = function (profile, id) {
        if (!profile) {
            return;
        }
        if (id === this.state.localStream.id) {
            this.setState({
                localStream: __assign({}, this.state.localStream, { profile: profile })
            });
        }
        else {
            this.setState({
                remoteStreams: __assign({}, this.state.remoteStreams, (_a = {}, _a[id] = __assign({}, this.state.remoteStreams[id], { profile: profile }), _a))
            });
        }
        var _a;
    };
    return Conference;
}(React.Component));
exports.Conference = Conference;


/***/ }),

/***/ 219:
/***/ (function(module, exports) {

/* (ignored) */

/***/ }),

/***/ 220:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(221));
__export(__webpack_require__(222));
__export(__webpack_require__(223));


/***/ }),

/***/ 221:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function createOutgoingMessageJoin(room) {
    return {
        type: 'Join',
        room: room,
    };
}
exports.createOutgoingMessageJoin = createOutgoingMessageJoin;
function createOutgoingMessageCandidate(candidate, id) {
    return {
        type: 'Candidate',
        candidate: candidate,
        to: id,
    };
}
exports.createOutgoingMessageCandidate = createOutgoingMessageCandidate;
function createOutgoingMessageOffer(sessionDescription, id) {
    return {
        type: 'Offer',
        sessionDescription: sessionDescription,
        to: id,
    };
}
exports.createOutgoingMessageOffer = createOutgoingMessageOffer;
function createOutgoingMessageAnswer(sessionDescription, id) {
    return {
        type: 'Answer',
        sessionDescription: sessionDescription,
        to: id,
    };
}
exports.createOutgoingMessageAnswer = createOutgoingMessageAnswer;
function createOutgoingMessageBye() {
    return {
        type: 'Bye',
    };
}
exports.createOutgoingMessageBye = createOutgoingMessageBye;


/***/ }),

/***/ 222:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function createDataChannelMessageSpeech(isSpeaking) {
    return {
        type: 'Speech',
        isSpeaking: isSpeaking,
    };
}
exports.createDataChannelMessageSpeech = createDataChannelMessageSpeech;
function createDataChannelMessageAudio(id, enabled) {
    return {
        type: 'Audio',
        enabled: enabled,
        id: id,
    };
}
exports.createDataChannelMessageAudio = createDataChannelMessageAudio;
function createDataChannelMessageVideo(id, enabled) {
    return {
        type: 'Video',
        enabled: enabled,
        id: id,
    };
}
exports.createDataChannelMessageVideo = createDataChannelMessageVideo;


/***/ }),

/***/ 223:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function createConferenceErrorWebcamPermissions() {
    return {
        type: 'ConferenceErrorWebcamPermissions',
    };
}
exports.createConferenceErrorWebcamPermissions = createConferenceErrorWebcamPermissions;
function createConferenceErrorMicPermissions() {
    return {
        type: 'ConferenceErrorMicPermissions',
    };
}
exports.createConferenceErrorMicPermissions = createConferenceErrorMicPermissions;
function createConferenceErrorSetLocalDescription(error, id) {
    return {
        type: 'ConferenceErrorSetLocalDescription',
        error: error,
        id: id,
    };
}
exports.createConferenceErrorSetLocalDescription = createConferenceErrorSetLocalDescription;
function createConferenceErrorSetRemoteDescription(error, id) {
    return {
        type: 'ConferenceErrorSetRemoteDescription',
        error: error,
        id: id,
    };
}
exports.createConferenceErrorSetRemoteDescription = createConferenceErrorSetRemoteDescription;
function createConferenceErrorCreateOffer(error, id) {
    return {
        type: 'ConferenceErrorCreateOffer',
        error: error,
        id: id,
    };
}
exports.createConferenceErrorCreateOffer = createConferenceErrorCreateOffer;
function createConferenceErrorCreateAnswer(error, id) {
    return {
        type: 'ConferenceErrorCreateAnswer',
        error: error,
        id: id,
    };
}
exports.createConferenceErrorCreateAnswer = createConferenceErrorCreateAnswer;
function createConferenceErrorWebRTCNotSupported() {
    return {
        type: 'ConferenceErrorWebRTCNotSupported',
    };
}
exports.createConferenceErrorWebRTCNotSupported = createConferenceErrorWebRTCNotSupported;
function createConferenceErrorGetUserMedia(error) {
    return {
        type: 'ConferenceErrorGetUserMedia',
        error: error,
    };
}
exports.createConferenceErrorGetUserMedia = createConferenceErrorGetUserMedia;


/***/ }),

/***/ 226:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var DownloadUtil_1 = __webpack_require__(85);
var CollectFrequency = 10; // 10MS;
var DelayRevokeDownloadUrl = 100; // 100MS
var StreamRecorder = (function () {
    function StreamRecorder(mediaStream) {
        this.recordBlobs = [];
        this.onStopped = this.onStopped.bind(this);
        this.onDataAvailable = this.onDataAvailable.bind(this);
        this.createRecorder(mediaStream.clone());
    }
    StreamRecorder.prototype.canRecord = function () {
        return !!this.mediaRecoder;
    };
    StreamRecorder.prototype.start = function () {
        if (this.mediaRecoder) {
            this.mediaRecoder.start(CollectFrequency);
        }
    };
    // NOTE(gaolw): Switch doesn't work. Need more investigation.
    // public switch(mediaStream: MediaStream) {
    //     console.log('swtich');
    //     const recordingStream: MediaStream = this.mediaRecoder.stream;
    //     recordingStream.getVideoTracks().forEach(track => recordingStream.removeTrack(track));
    //     mediaStream.getVideoTracks().forEach(track => recordingStream.addTrack(track));
    // }
    StreamRecorder.prototype.stop = function () {
        if (this.mediaRecoder) {
            this.mediaRecoder.stop();
        }
    };
    StreamRecorder.prototype.download = function (filename) {
        var blob = new Blob(this.recordBlobs, { type: 'video/webm' });
        var url = window.URL.createObjectURL(blob);
        DownloadUtil_1.DownloadUtil.download(url, filename);
        setTimeout(function () {
            window.URL.revokeObjectURL(url);
        }, DelayRevokeDownloadUrl);
    };
    StreamRecorder.prototype.createRecorder = function (mediaStream) {
        try {
            this.mediaRecoder = new MediaRecorder(mediaStream, this.getRecorderOptions());
            this.mediaRecoder.onstop = this.onStopped;
            this.mediaRecoder.ondataavailable = this.onDataAvailable;
        }
        catch (err) {
            console.error(err);
        }
    };
    StreamRecorder.prototype.onStopped = function () {
        console.log('media recorder stopped');
    };
    StreamRecorder.prototype.onDataAvailable = function (event) {
        if (event.data && event.data.size > 0) {
            this.recordBlobs.push(event.data);
        }
    };
    StreamRecorder.prototype.getRecorderOptions = function () {
        var options = { mimeType: 'video/webm;codecs=vp9' };
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
    };
    return StreamRecorder;
}());
exports.StreamRecorder = StreamRecorder;


/***/ }),

/***/ 229:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.types = {
    extLoaded: 'teamious-screen-capture-ext-loaded',
    getScreenSourceId: 'teamious-screen-capture-get-source-id'
};
exports.actions = {
    call: 'teamious-screen-capture-call',
    answer: 'teamious-screen-capture-answer'
};
exports.errors = {
    screenPermissionDeied: 'screenPermissionDeied'
};
function isWellKnownMessage(message) {
    if (!message) {
        return false;
    }
    for (var type in exports.types) {
        if (exports.types[type] === message.type) {
            return true;
        }
    }
    return false;
}
exports.isWellKnownMessage = isWellKnownMessage;


/***/ }),

/***/ 230:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var data_1 = __webpack_require__(87);
var PeerConnectionManager = (function () {
    function PeerConnectionManager() {
        this.peerConnections = {};
        this.candidates = {};
        this.dataChannels = {};
    }
    PeerConnectionManager.prototype.createPeerConnectionById = function (id, peerConnectionConfig) {
        var peerConnection = new RTCPeerConnection(peerConnectionConfig);
        this.peerConnections[id] = peerConnection;
        return peerConnection;
    };
    PeerConnectionManager.prototype.getPeerConnectionById = function (id) {
        return this.peerConnections[id];
    };
    PeerConnectionManager.prototype.removePeerConnection = function (id) {
        var peerConnection = this.getPeerConnectionById(id);
        var dataChannel = this.getDataChannelById(id);
        if (peerConnection) {
            peerConnection.close();
        }
        else {
            console.warn('handleRemovePeerMessage(): Missing connection Id: %s', id);
        }
        if (dataChannel) {
            dataChannel.close();
        }
        else {
            console.warn('handleRemovePeerMessage(): Missing data channel Id: %s', id);
        }
        delete this.peerConnections[id];
        delete this.dataChannels[id];
    };
    PeerConnectionManager.prototype.setDataChannel = function (dataChannel, id) {
        var oldChannel = this.getDataChannelById(id);
        if (oldChannel) {
            // NOTE(yunsi): Ideally only one side of the RTCPeerConnection should create a data channel, but in case they
            // both create a data channel, we will replace the old channel with the new one.
            console.log("Replace old dataChannel: " + oldChannel + " of id: " + id + " with new dataChannel: " + dataChannel);
        }
        this.dataChannels[id] = dataChannel;
    };
    PeerConnectionManager.prototype.getDataChannelById = function (id) {
        return this.dataChannels[id];
    };
    PeerConnectionManager.prototype.broadcastMessage = function (message) {
        var _this = this;
        Object.keys(this.dataChannels).forEach(function (id) {
            _this.sendMessageToDataChannel(message, id);
        });
    };
    PeerConnectionManager.prototype.sendMessageToDataChannel = function (message, id) {
        var dataChannel = this.getDataChannelById(id);
        if (!dataChannel) {
            console.log("Data channel for id " + id + " does not exist");
            return;
        }
        if (dataChannel.readyState !== data_1.DataChannelReadyState.OPEN) {
            console.log("Data channel for id " + id + " is not ready yet");
            return;
        }
        dataChannel.send(JSON.stringify(message));
    };
    PeerConnectionManager.prototype.addCandidate = function (candidate, id) {
        if (this.candidates[id]) {
            this.candidates[id].push(candidate);
        }
        else {
            this.candidates[id] = [candidate];
        }
    };
    PeerConnectionManager.prototype.close = function () {
        var _this = this;
        Object.keys(this.peerConnections).forEach(function (id) {
            // NOTE(yunsi): This will also close all datachannels created on the peerconnection
            _this.peerConnections[id].close();
        });
    };
    return PeerConnectionManager;
}());
exports.PeerConnectionManager = PeerConnectionManager;


/***/ }),

/***/ 231:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.DataChannelReadyState = {
    CONNECTING: 'connecting',
    OPEN: 'open',
    CLOSING: 'closing',
    CLOSED: 'closed',
};


/***/ }),

/***/ 232:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
exports.ConferenceError = {
    WebcamPermissions: 'ConferenceErrorWebcamPermissions',
    MicPermissions: 'ConferenceErrorMicPermissions',
    SetLocalDescription: 'ConferenceErrorSetLocalDescription',
    SetRemoteDescription: 'ConferenceErrorSetRemoteDescription',
    CreateOffer: 'ConferenceErrorCreateOffer',
    CreateAnswer: 'ConferenceErrorCreateAnswer',
    WebRTCNotSupported: 'ConferenceErrorWebRTCNotSupported',
    GetUserMedia: 'ConferenceErrorGetUserMedia',
};


/***/ }),

/***/ 234:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(90));
__export(__webpack_require__(89));


/***/ }),

/***/ 235:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(236));
__export(__webpack_require__(92));
__export(__webpack_require__(95));
__export(__webpack_require__(91));
__export(__webpack_require__(94));
__export(__webpack_require__(93));


/***/ }),

/***/ 236:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var ConferenceConnection_1 = __webpack_require__(88);
var SpreedConnection_1 = __webpack_require__(91);
var SpreedAdapter_1 = __webpack_require__(92);
function SpreedConnect(url) {
    return new SpreedConferenceConnection(url);
}
exports.SpreedConnect = SpreedConnect;
// NOTE(andrews): Connection class is responsible for controlling the communication
// between the SpreedConnection and SpreedAdapter instances. It exposes an API
// for subscribers to hook into the SpreedConnection event stream. This means
// that anytime the SpreedServer sends a message to the SpreedConnection, you
// can be notified.
var SpreedConferenceConnection = (function (_super) {
    __extends(SpreedConferenceConnection, _super);
    function SpreedConferenceConnection(url) {
        return _super.call(this, url, new SpreedConnection_1.SpreedConnection(), new SpreedAdapter_1.SpreedAdapter()) || this;
    }
    return SpreedConferenceConnection;
}(ConferenceConnection_1.ConferenceConnection));
exports.SpreedConferenceConnection = SpreedConferenceConnection;


/***/ }),

/***/ 237:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(83));
__export(__webpack_require__(84));
__export(__webpack_require__(86));
__export(__webpack_require__(85));


/***/ }),

/***/ 238:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = __webpack_require__(14);
var react_conf_webrtc_1 = __webpack_require__(80);
var MediaStreamControl = (function (_super) {
    __extends(MediaStreamControl, _super);
    function MediaStreamControl() {
        var _this = _super.call(this) || this;
        _this.onToggleAudioEnabled = _this.onToggleAudioEnabled.bind(_this);
        _this.onToggleVideoEnabled = _this.onToggleVideoEnabled.bind(_this);
        _this.onToggleScreenShare = _this.onToggleScreenShare.bind(_this);
        _this.onToggleRecording = _this.onToggleRecording.bind(_this);
        return _this;
    }
    MediaStreamControl.prototype.onToggleAudioEnabled = function () {
        this.props.toggleAudioEnabled();
    };
    MediaStreamControl.prototype.onToggleVideoEnabled = function () {
        this.props.toggleVideoEnabled();
    };
    MediaStreamControl.prototype.onToggleScreenShare = function () {
        var _this = this;
        react_conf_webrtc_1.ChromeExtension.Instance.isExtensionAvailable()
            .then(function (available) {
            if (available) {
                if (_this.props.toggleScreenShare) {
                    _this.props.toggleScreenShare();
                }
            }
            else {
                react_conf_webrtc_1.DownloadUtil.download('https://github.com/teamious/react-conf-webrtc/raw/master/docs/ext/teamious.screen.chrome.crx');
            }
        });
    };
    MediaStreamControl.prototype.onToggleRecording = function () {
        if (this.props.toggleRecording) {
            this.props.toggleRecording();
        }
    };
    MediaStreamControl.prototype.render = function () {
        var muteText = this.props.audioEnabled ? 'Mute Audio' : 'Unmute Audio';
        var disableText = this.props.videoEnabled ? 'Disable Video' : 'Enable Video';
        var shareText = 'Share Screen';
        var recodingText = !this.props.recording ? 'Record' : 'Stop recordig';
        return (React.createElement("div", { className: 'rcw-stream-controls' },
            React.createElement("button", { className: 'rcw-stream-control-mute', onClick: this.onToggleAudioEnabled }, muteText),
            React.createElement("button", { className: 'rcw-stream-control-disable', onClick: this.onToggleVideoEnabled }, disableText),
            this.props.toggleScreenShare && react_conf_webrtc_1.ChromeExtension.Instance.isChrome() &&
                React.createElement("button", { className: 'rcw-stream-control-share', onClick: this.onToggleScreenShare }, shareText),
            this.props.toggleRecording &&
                React.createElement("button", { className: 'rcw-stream-control-recoding', onClick: this.onToggleRecording }, recodingText)));
    };
    return MediaStreamControl;
}(React.Component));
exports.MediaStreamControl = MediaStreamControl;


/***/ }),

/***/ 80:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(205));
__export(__webpack_require__(87));
__export(__webpack_require__(235));
__export(__webpack_require__(237));


/***/ }),

/***/ 83:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var Hark = __webpack_require__(224);
function createAudioMonitor(stream) {
    return new AudioMonitor(stream);
}
exports.createAudioMonitor = createAudioMonitor;
var AudioMonitor = (function () {
    function AudioMonitor(stream) {
        this.monitor = Hark(stream);
    }
    AudioMonitor.prototype.on = function (event, handler) {
        this.monitor.on(event, function (msg) { return handler(msg); });
    };
    AudioMonitor.prototype.stop = function () {
        this.monitor.stop();
    };
    return AudioMonitor;
}());
exports.AudioMonitor = AudioMonitor;


/***/ }),

/***/ 84:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function stopMediaStream(stream) {
    stream.getAudioTracks().forEach(function (track) {
        track.stop();
    });
    stream.getVideoTracks().forEach(function (track) {
        track.stop();
    });
}
exports.stopMediaStream = stopMediaStream;


/***/ }),

/***/ 85:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var DownloadUtil = (function () {
    function DownloadUtil() {
    }
    DownloadUtil.download = function (url, filename) {
        // Construct the a element
        var link = document.createElement("a");
        link.target = "_blank";
        // Construct the uri
        link.href = url;
        if (filename) {
            link.download = filename;
        }
        document.body.appendChild(link);
        link.click();
        // Cleanup the DOM
        document.body.removeChild(link);
    };
    return DownloadUtil;
}());
exports.DownloadUtil = DownloadUtil;


/***/ }),

/***/ 86:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var es6_promise_1 = __webpack_require__(82);
var broswer = __webpack_require__(227);
var Message = __webpack_require__(229);
var IsExtensionAvailableTimeout = 1000; // 1000 MS
var ChromeExtension = (function () {
    function ChromeExtension() {
        this.callbackRegistry = {};
        this.count = 0;
        this.onMessage = this.onMessage.bind(this);
        window.addEventListener('message', this.onMessage);
    }
    ChromeExtension.prototype.isChrome = function () {
        return broswer.chrome;
    };
    ChromeExtension.prototype.isExtensionAvailable = function () {
        var _this = this;
        var _a = this.call(Message.types.extLoaded), msg = _a.msg, promise = _a.promise;
        window.setTimeout(function () {
            var handler = _this.callbackRegistry[msg.id];
            if (handler) {
                delete _this.callbackRegistry[msg.id];
                handler.resolve(false);
            }
        }, IsExtensionAvailableTimeout);
        return promise;
    };
    ChromeExtension.prototype.getShareScreenId = function () {
        var _a = this.call(Message.types.getScreenSourceId), msg = _a.msg, promise = _a.promise;
        return promise;
    };
    ChromeExtension.prototype.dispose = function () {
        window.removeEventListener('message', this.onMessage);
    };
    ChromeExtension.prototype.call = function (type, data) {
        var _this = this;
        var msg = {
            type: type,
            data: data,
            action: Message.actions.call,
            id: this.count++
        };
        var promise = new es6_promise_1.Promise(function (resolve, reject) {
            _this.callbackRegistry[msg.id] = { resolve: resolve, reject: reject };
            window.postMessage(msg, '*');
        });
        return {
            msg: msg,
            promise: promise
        };
    };
    ChromeExtension.prototype.onMessage = function (event) {
        if (event.origin != window.location.origin) {
            return;
        }
        var msg = event.data;
        if (!Message.isWellKnownMessage(msg)) {
            // Unknown message
            return;
        }
        if (msg.action === Message.actions.call) {
            // Ignore call message.
            return;
        }
        else if (msg.action === Message.actions.answer) {
            this.handleMsg(msg);
        }
        else {
            console.log('unknown message', msg);
        }
    };
    ChromeExtension.prototype.handleMsg = function (msg) {
        var handler = this.callbackRegistry[msg.id];
        if (!handler) {
            return;
        }
        delete this.callbackRegistry[msg.id];
        switch (msg.type) {
            case Message.types.extLoaded:
                handler.resolve(true);
                break;
            case Message.types.getScreenSourceId:
                if (msg.error) {
                    handler.reject(msg.error);
                }
                else {
                    handler.resolve(msg.data);
                }
                break;
            default:
                console.warn('unknown message', msg);
                break;
        }
    };
    ChromeExtension.Instance = new ChromeExtension();
    return ChromeExtension;
}());
exports.ChromeExtension = ChromeExtension;


/***/ }),

/***/ 87:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(__webpack_require__(88));
__export(__webpack_require__(231));
__export(__webpack_require__(232));


/***/ }),

/***/ 88:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// ConferenceConnection class is responsible for controlling the communication
// between the IConnection and IMessageAdapter instances. It exposes an API
// for subscribers to hook into the IConnection event stream. This means
// that anytime the server sends a message to the IConnection, you
// can be notified.
var ConferenceConnection = (function () {
    function ConferenceConnection(url, conn, adapter) {
        var _this = this;
        this.incomingMessages = [];
        this.conn = conn;
        this.conn.connect(url);
        this.adapter = adapter;
        this.conn.onmessage = function (msg) {
            if (_this.onConnMessageHandler) {
                _this.onConnMessageHandler(msg, function () {
                    _this.handleIncomingMessage(msg);
                });
                return;
            }
            _this.handleIncomingMessage(msg);
        };
    }
    ConferenceConnection.prototype.subscribe = function (handler) {
        this.conferenceMessageHandler = handler;
        this.processIncomingMessages();
    };
    ConferenceConnection.prototype.publish = function (msg) {
        var outgoingMessage = this.adapter.translateOutgoingMessage(msg);
        if (!outgoingMessage) {
            console.log('handleConferenceMessage(): No translation was found for IConfOutgoingMessage type: %s', msg.type);
            return;
        }
        this.conn.send(outgoingMessage);
    };
    Object.defineProperty(ConferenceConnection.prototype, "onconnmessage", {
        // NOTE(andrews): Use this API if you want to subscribe to the incoming event
        // stream from the SpreedConnection class. Note that done() must be called
        // by your handler if you want the message to continue through to the
        // connection.
        set: function (handler) {
            this.onConnMessageHandler = handler;
        },
        enumerable: true,
        configurable: true
    });
    ConferenceConnection.prototype.handleIncomingMessage = function (msg) {
        var _this = this;
        var incomingMessage = this.adapter.translateIncomingMessage(msg);
        if (!incomingMessage) {
            return;
        }
        if (incomingMessage instanceof Array) {
            incomingMessage.forEach(function (m) {
                _this.notifyConferenceMessage(m);
            });
        }
        else {
            this.notifyConferenceMessage(incomingMessage);
        }
    };
    ConferenceConnection.prototype.notifyConferenceMessage = function (msg) {
        if (this.conferenceMessageHandler) {
            this.conferenceMessageHandler(msg);
            return;
        }
        this.incomingMessages.push(msg);
    };
    // NOTE(andrews): processIncomingMessages will process all of the queued conference messages.
    // If no handler is defined this function will return before attempting to process the queue.
    ConferenceConnection.prototype.processIncomingMessages = function () {
        if (!this.conferenceMessageHandler) {
            return;
        }
        while (this.incomingMessages.length > 0) {
            var message = this.incomingMessages.shift();
            if (!message) {
                console.warn('processIncomingMessages(): undefined message in queue');
                continue;
            }
            this.conferenceMessageHandler(message);
        }
    };
    ConferenceConnection.prototype.close = function () {
        this.conn.close();
    };
    return ConferenceConnection;
}());
exports.ConferenceConnection = ConferenceConnection;


/***/ }),

/***/ 89:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = __webpack_require__(14);
;
var AudioMeter = (function (_super) {
    __extends(AudioMeter, _super);
    function AudioMeter(props) {
        var _this = _super.call(this, props) || this;
        _this.refBar = _this.refBar.bind(_this);
        return _this;
    }
    AudioMeter.prototype.componentDidMount = function () {
        var _this = this;
        this.audioMonitor = this.props.audioMonitor;
        this.audioMonitor.on('volume_change', function (volume) {
            if (_this.audioMeterBar) {
                // NOTE(yunsi): volume ranges from -100dB to 0dB, We need to convert it to float value.
                // TODO(yunsi): Find a better way to render audioMeterBar instead of operating on UI element directly.
                var audioLinearValue = Math.pow(10, (volume / 20));
                _this.audioMeterBar.style.width = 100 * audioLinearValue + '%';
            }
        });
    };
    AudioMeter.prototype.refBar = function (element) {
        this.audioMeterBar = element;
    };
    AudioMeter.prototype.render = function () {
        return (React.createElement("div", { className: 'rcw-audio-meter' },
            React.createElement("div", { className: 'rcw-audio-meter__bar', ref: this.refBar })));
    };
    return AudioMeter;
}(React.PureComponent));
exports.AudioMeter = AudioMeter;


/***/ }),

/***/ 90:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var React = __webpack_require__(14);
var classnames = __webpack_require__(233);
;
var mirrorStyle = {
    transform: 'rotateY(180deg)',
};
var Stream = (function (_super) {
    __extends(Stream, _super);
    function Stream(props) {
        var _this = _super.call(this, props) || this;
        _this.refVideo = _this.refVideo.bind(_this);
        return _this;
    }
    Stream.prototype.componentDidMount = function () {
        this.videoElement.srcObject = this.props.stream;
    };
    Stream.prototype.componentDidUpdate = function (nextProps) {
        if (nextProps.stream !== this.props.stream) {
            // NOTE(denggl): Not running here now.
            // But in future, maybe it will switch the stream and reload the video.
            this.videoElement.srcObject = this.props.stream;
        }
    };
    Stream.prototype.refVideo = function (element) {
        this.videoElement = element;
    };
    Stream.prototype.render = function () {
        var _a = this.props, className = _a.className, muted = _a.muted, onClick = _a.onClick, mirror = _a.mirror, isRecording = _a.isRecording;
        return (React.createElement("div", { className: classnames(this.props.className, 'rcw-stream'), onClick: onClick },
            isRecording && React.createElement("span", null, "Recording"),
            React.createElement("video", { style: mirror ? mirrorStyle : undefined, className: 'rcw-stream-video', ref: this.refVideo, autoPlay: true, muted: muted })));
    };
    return Stream;
}(React.PureComponent));
exports.Stream = Stream;


/***/ }),

/***/ 91:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// NOTE(andrews): SpreedConnection is a wrapper around the WebSocket connection.
// It will queue any responses (messages from the server) and requests (messages from the client)
// if no receiver is ready. Messages from the server are processed once an `onmessage` handler is assigned.
// Likewise, messages from the client are only processed once the WebSocket connection is open.
var SpreedConnection = (function () {
    function SpreedConnection() {
        // queue of server -> client messages
        this.responses = [];
        // queue of client -> server messages
        this.requests = [];
    }
    SpreedConnection.prototype.connect = function (url) {
        this.conn = new WebSocket(url);
        this.conn.onmessage = this.onConnMessage.bind(this);
        this.conn.onclose = this.onConnClose.bind(this);
        this.conn.onerror = this.onConnError.bind(this);
        this.conn.onopen = this.onConnOpen.bind(this);
    };
    SpreedConnection.prototype.onConnOpen = function () {
        this.processRequests();
    };
    SpreedConnection.prototype.processResponses = function () {
        while (this.responses.length > 0) {
            var res = this.responses.shift();
            if (res) {
                this.onMessageHandler(res);
            }
        }
    };
    SpreedConnection.prototype.processRequests = function () {
        while (this.requests.length > 0) {
            var req = this.requests.shift();
            if (req) {
                this.send(req);
            }
        }
    };
    SpreedConnection.prototype.onConnError = function (event) {
        if (this.onErrorHandler) {
            this.onErrorHandler(event);
        }
    };
    SpreedConnection.prototype.onConnClose = function (event) {
        if (this.onCloseHandler) {
            this.onCloseHandler(event);
        }
    };
    // NOTE(andrews): send is used to send messages to the WebSocket connection.
    // It expects that any message being is a SpreedRequest type. If the connection
    // is not open, this function will queue the requests in the this.requests array.
    SpreedConnection.prototype.send = function (message) {
        if (this.hasOpenConnection()) {
            this.conn.send(JSON.stringify(message));
            return;
        }
        this.requests.push(message);
    };
    SpreedConnection.prototype.close = function () {
        this.conn.close();
    };
    SpreedConnection.prototype.hasOpenConnection = function () {
        return this.conn.readyState === this.conn.OPEN;
    };
    // NOTE(andrews): onConnMessage is called whenever the WebSocket connection
    // receives a MessageEvent. It parses the message from the server and
    // sends it to the function assigned via the onmessage setter. If no
    // function has been set, it will queue the message in the this.responses array.
    SpreedConnection.prototype.onConnMessage = function (event) {
        var message = JSON.parse(event.data);
        if (this.onMessageHandler) {
            this.onMessageHandler(message);
            return;
        }
        this.responses.push(message);
    };
    Object.defineProperty(SpreedConnection.prototype, "onmessage", {
        // NOTE(andrews): onmessage is a setter for the class that you can use to subscribe
        // to any messages that the connection received. If there are any queued messages, they
        // will be processed immediately.
        set: function (handler) {
            this.onMessageHandler = handler;
            this.processResponses();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpreedConnection.prototype, "onclose", {
        set: function (handler) {
            this.onCloseHandler = handler;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SpreedConnection.prototype, "onerror", {
        set: function (handler) {
            this.onErrorHandler = handler;
        },
        enumerable: true,
        configurable: true
    });
    return SpreedConnection;
}());
exports.SpreedConnection = SpreedConnection;


/***/ }),

/***/ 92:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var TranslateSpreedMessage_1 = __webpack_require__(93);
var TranslateConferenceMessage_1 = __webpack_require__(94);
// NOTE(andrews): SpreedAdapter is responsible for turning SpreedMessages into Conference messages
// and vice-versa.
var SpreedAdapter = (function () {
    function SpreedAdapter() {
    }
    // NOTE(andrews): handleSpreedMessage should be called whenever you want to translate a message from spreed -> conference.
    // Not all message types will be handled
    SpreedAdapter.prototype.translateIncomingMessage = function (message) {
        var msg = TranslateSpreedMessage_1.TranslateSpreedMessage(message);
        if (!msg) {
            console.log('translateIncomingMessage(): No translation was found for SpreedResponse type: %s', message.Data.Type);
            return;
        }
        return msg;
    };
    // NOTE(andrews): handleConferenceMessage should be called whenever you want to translate a message from conference -> spreed.
    SpreedAdapter.prototype.translateOutgoingMessage = function (message) {
        var msg = TranslateConferenceMessage_1.TranslateConferenceMessage(message);
        if (!msg) {
            console.log('translateOutgoingMessage(): No translation was found for IConfOutgoingMessage type: %s', message.type);
            return;
        }
        return msg;
    };
    return SpreedAdapter;
}());
exports.SpreedAdapter = SpreedAdapter;


/***/ }),

/***/ 93:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
// NOTE(andrews): TranslateSpreedMessage delegates the work of translating the message
// to individual functions based on the message type. Not all message types need to be translated
// into an IConfIncomingMessage. In such cases, this function will return undefined.
// Note that some spreed messages may translate to an array of Conference messages.
function TranslateSpreedMessage(message) {
    switch (message.Data.Type) {
        case 'Offer':
            return translateOfferMessage(message.Data, message);
        case 'Answer':
            return translateAnswerMessage(message.Data, message);
        case 'Candidate':
            return translateCandidateMessage(message.Data, message);
        case 'Joined':
            return translateJoinedMessage(message.Data, message);
        case 'Left':
            return translateLeftMessage(message.Data, message);
        case 'Welcome':
            return translateWelcomeMessage(message.Data, message);
        case 'Self':
            return translateSelfMessage(message.Data, message);
        case 'Conference':
            return translateConferenceMessage(message.Data, message);
        default:
            return undefined;
    }
}
exports.TranslateSpreedMessage = TranslateSpreedMessage;
function translateWelcomeMessage(data, message) {
    return data.Users.map(function (u) {
        return {
            type: 'AddPeer',
            Id: u.Id,
            profile: translateStatus(u.Status),
        };
    });
}
function translateConferenceMessage(data, message) {
    return data.Conference.map(function (Id) {
        return {
            type: 'AddPeer',
            Id: Id,
        };
    });
}
function translateSelfMessage(data, message) {
    return {
        type: 'Self',
        Id: data.Id,
    };
}
function translateLeftMessage(data, message) {
    return {
        type: 'RemovePeer',
        Id: data.Id,
    };
}
function translateJoinedMessage(data, message) {
    return {
        type: 'AddPeer',
        Id: data.Id,
        profile: translateStatus(data.Status),
    };
}
function translateCandidateMessage(data, message) {
    if (!message.From) {
        console.warn('translateCandidateMessage(): Failed to translate "Candidate" message. "From" member not found.');
        return;
    }
    return {
        type: 'Candidate',
        candidate: data.Candidate,
        from: message.From,
    };
}
function translateAnswerMessage(data, message) {
    if (!message.From) {
        console.warn('translateAnswerMessage(): Failed to translate "Answer" message. "From" member not found.');
        return;
    }
    return {
        type: 'Answer',
        sessionDescription: data.Answer,
        from: message.From,
    };
}
function translateOfferMessage(data, message) {
    if (!message.From) {
        console.warn('translateOfferMessage(): Failed to translate "Offer" message. "From" member not found.');
        return;
    }
    return {
        type: 'Offer',
        sessionDescription: data.Offer,
        from: message.From,
    };
}
function translateStatus(Status) {
    if (!Status) {
        return;
    }
    return { avatar: Status.BuddyPicture, name: Status.DisplayName };
}


/***/ }),

/***/ 94:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __assign = (this && this.__assign) || Object.assign || function(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
        s = arguments[i];
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
            t[p] = s[p];
    }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var SpreedAPI_1 = __webpack_require__(95);
// NOTE(andrews): TranslateConferenceMessage delegates the work of translating the message
// to individual functions based on the message type. Not all message types need to be translated
// into an IConfIncomingMessage. In such cases, this function will return undefined.
// TODO(andrews): Figure out if we need to handle "Bye" message / or if it's necessary
function TranslateConferenceMessage(message) {
    switch (message.type) {
        case 'Join':
            return translateJoinMessage(message);
        case 'Answer':
            return translateAnswerMessage(message);
        case 'Offer':
            return translateOfferMessage(message);
        case 'Candidate':
            return translateCandidateMessage(message);
        default:
            console.log('TranslateConferenceMessag(): Messge type not handled: %s.', message.type);
            return;
    }
}
exports.TranslateConferenceMessage = TranslateConferenceMessage;
function translateJoinMessage(message) {
    // TODO(andrews): Determine if we really need Version, UA properties.
    // NOTE(yunsi): Name value in the hello message determins which room the user eventually join.
    return SpreedAPI_1.createHelloRequest({
        Type: 'Conference',
        Name: message.room,
        Version: '',
        Ua: '',
    });
}
function translateAnswerMessage(message) {
    return SpreedAPI_1.createAnswerRequest({
        Type: 'Answer',
        Answer: message.sessionDescription,
        To: message.to,
    });
}
function translateOfferMessage(message) {
    return SpreedAPI_1.createOfferRequest({
        Type: 'Offer',
        Offer: message.sessionDescription,
        To: message.to,
    });
}
function translateCandidateMessage(message) {
    var Candidate = __assign({}, message.candidate, { type: 'candidate' });
    return SpreedAPI_1.createCandidateRequest({
        Type: 'Candidate',
        To: message.to,
        Candidate: Candidate,
    });
}


/***/ }),

/***/ 95:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
function createOfferRequest(Offer) {
    return {
        Type: 'Offer',
        Offer: Offer,
    };
}
exports.createOfferRequest = createOfferRequest;
function createAnswerRequest(Answer) {
    return {
        Type: 'Answer',
        Answer: Answer,
    };
}
exports.createAnswerRequest = createAnswerRequest;
function createCandidateRequest(Candidate) {
    return {
        Type: 'Candidate',
        Candidate: Candidate,
    };
}
exports.createCandidateRequest = createCandidateRequest;
function createHelloRequest(Hello) {
    return {
        Type: 'Hello',
        Hello: Hello,
    };
}
exports.createHelloRequest = createHelloRequest;


/***/ }),

/***/ 96:
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
__webpack_require__(97);
var React = __webpack_require__(14);
var ReactDOM = __webpack_require__(114);
var App_1 = __webpack_require__(191);
ReactDOM.render(React.createElement(App_1.App, null), document.getElementById('react-root'));


/***/ }),

/***/ 97:
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ })

},[96]);
//# sourceMappingURL=main-c47689a54b9f5bb0188a.js.map