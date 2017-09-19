import * as Message from './message';

const screenOptions = ['screen', 'window'];

chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(onPortMessage);

    function onPortMessage(message: Message.IMessage) {
        if (message.action !== Message.actions.call) {
            // Only handles call message.
            return;
        }

        if (message.type === Message.types.getScreenSourceId) {
            chrome.desktopCapture.chooseDesktopMedia(screenOptions, port.sender.tab, sourceId => {
                onMediaChoosen(sourceId, message);
            });
        }
        else {
            console.warn('unknown message', message);
        }
    }

    function onMediaChoosen(sourceId: string, message: Message.IMessage) {
        if (!sourceId || !sourceId.length) {
            message.action = Message.actions.answer;
            message.error = Message.errors.screenPermissionDeied;
            return port.postMessage(message);
        }

        message.action = Message.actions.answer;
        message.data = sourceId;
        return port.postMessage(message);
    }
});
