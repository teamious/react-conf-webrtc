import { IDataChannelMessage, DataChannelReadyState } from '../data';

export class PeerConnectionManager {
    public peerConnections: { [id: string]: RTCPeerConnection } = {};
    public candidates: { [id: string]: RTCIceCandidateInit[] } = {};
    private dataChannels: { [id: string]: RTCDataChannel } = {};

    public createPeerConnectionById(id: string, peerConnectionConfig: RTCConfiguration): RTCPeerConnection {
        const peerConnection = new RTCPeerConnection(peerConnectionConfig);
        this.peerConnections[id] = peerConnection;
        return peerConnection;
    }

    public getPeerConnectionById(id: string): RTCPeerConnection {
        return this.peerConnections[id];
    }

    public removePeerConnection(id: string) {
        const peerConnection = this.getPeerConnectionById(id);
        const dataChannel = this.getDataChannelById(id);

        if (peerConnection) {
            peerConnection.close();
        } else {
            console.warn('handleRemovePeerMessage(): Missing connection Id: %s', id);
        }

        if (dataChannel) {
            dataChannel.close();
        } else {
            console.warn('handleRemovePeerMessage(): Missing data channel Id: %s', id);
        }

        delete this.peerConnections[id];
        delete this.dataChannels[id];
    }

    public setDataChannel(dataChannel: RTCDataChannel, id: string) {
        let oldChannel = this.getDataChannelById(id);
        if (oldChannel) {
            // NOTE(yunsi): Ideally only one side of the RTCPeerConnection should create a data channel, but in case they
            // both create a data channel, we will replace the old channel with the new one.
            console.log(`Replace old dataChannel: ${oldChannel} of id: ${id} with new dataChannel: ${dataChannel}`)
        }

        this.dataChannels[id] = dataChannel;
    }

    public getDataChannelById(id: string): RTCDataChannel {
        return this.dataChannels[id]
    }

    public broadcastMessage(message: IDataChannelMessage) {
        Object.keys(this.dataChannels).forEach((id: string) => {
            this.sendMessageToDataChannel(message, id)
        });
    }

    private sendMessageToDataChannel(message: IDataChannelMessage, id: string) {
        const dataChannel = this.getDataChannelById(id);

        if (!dataChannel) {
            console.log(`Data channel for id ${id} does not exist`);
            return
        }
        if (dataChannel.readyState !== DataChannelReadyState.OPEN) {
            console.log(`Data channel for id ${id} is not ready yet`);
            return
        }

        dataChannel.send(JSON.stringify(message));
    }

    public addCandidate(candidate: RTCIceCandidateInit, id: string) {
        if (this.candidates[id]) {
            this.candidates[id].push(candidate);
        } else {
            this.candidates[id] = [candidate];
        }
    }

    public close() {
        Object.keys(this.peerConnections).forEach((id: string) => {
            // NOTE(yunsi): This will also close all datachannels created on the peerconnection
            this.peerConnections[id].close();
        })
    }
}
