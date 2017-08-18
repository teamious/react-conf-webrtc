declare var detectrtc: any;
declare module 'detectrtc' {
    export = detectrtc;
}

declare var hark: any;
declare module 'hark' {
    export = hark;
}

interface RTCDataChannelInit {
    ordered: boolean;
    maxPacketLifeTime: number;
    maxRetransmits: number;
    protocol: string;
    negotiated: boolean;
    id: number;
}

interface RTCDataChannel {
    close(): void;
    send(data: any): void;
    onmessage: (event: MessageEvent) => void;
    onopen: (event: RTCDataChannelEvent) => void;
    onclose: (event: RTCDataChannelEvent) => void;
    readyState: 'connecting' | 'open' | 'closing' | 'closed';
}

interface RTCPeerConnection extends EventTarget {
    createDataChannel(label: string, options?: RTCDataChannelInit): RTCDataChannel;
    ondatachannel: (event: RTCDataChannelEvent) => void;
}

interface RTCDataChannelEvent {
    readonly channel: RTCDataChannel;
}
