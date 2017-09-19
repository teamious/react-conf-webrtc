import * as Message from './message';

const extLoadedMsg: Message.IMessage = { type: Message.types.extLoaded };
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

    if (!Message.isWellKnownMessage(event.data)) {
        // Unknown message
        return;
    }

    if (event.data.msg === Message.types.extLoaded) {
        window.postMessage(extLoadedMsg, '*');
    }
    else {
        // Notify background script to handle the message.
        background.postMessage(event.data);
    }
})

// Inform browser that extension is loaded.
window.postMessage(extLoadedMsg, '*');
