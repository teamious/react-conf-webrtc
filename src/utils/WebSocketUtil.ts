import { Promise } from 'es6-promise';

export function createWebSocketConnection(url: string): Promise<any> {
    return new Promise((resolve) => {
        resolve(new WebSocket(url))
    })
}
