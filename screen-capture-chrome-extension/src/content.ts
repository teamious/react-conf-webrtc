import * as Message from './message';

const background = chrome.runtime.connect();

background.onMessage.addListener(function (message, sender) {
    console.log('background.onMessage', message);
    window.postMessage(message, '*');
})

window.addEventListener('message', function (event) {
    console.log('window.onMessage', event);
    if (event.source != window) {
        // Invalid source
        return;
    }

    const msg: Message.IMessage = event.data;
    if (!Message.isWellKnownMessage(msg)) {
        // Unknown message
        return;
    }

    if (msg.action !== Message.actions.call) {
        // Not call message, no need to handle.
        return;
    }

    if (msg.type === Message.types.extLoaded) {
        msg.action = Message.actions.answer;
        window.postMessage(msg, '*');
    }
    else {
        // Notify background script to handle the message.
        background.postMessage(msg);
    }
})
