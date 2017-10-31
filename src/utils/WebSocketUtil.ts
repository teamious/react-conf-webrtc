import { Promise } from 'es6-promise';

export function createWebSocketConnection(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        console.log(url)
        const socket = new WebSocket(url)
        socket.onopen = () => {
            console.log(socket)
            resolve(socket)
        }
        socket.onerror = (err) => {
            console.log(err)
            reject(err)
        }
    })
}
