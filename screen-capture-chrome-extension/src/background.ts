import * as Message from './message';

const screenOptions = ['screen', 'window'];

chrome.runtime.onConnect.addListener(function (port) {
    port.onMessage.addListener(onPortMessage);

    function onPortMessage(message: Message.IMessage) {
        if (message.type === Message.types.getScreenSourceId) {
            chrome.desktopCapture.chooseDesktopMedia(screenOptions, port.sender.tab, onMediaChoosen);
        }
        else {
            console.warn('unknown message', message);
        }
    }

    function onMediaChoosen(sourceId: string) {
        if (!sourceId || !sourceId.length) {
            const getSourceFailMsg: Message.IMessage = {
                type: Message.types.getScreenSourceId,
                error: Message.errors.screenPermissionDeied,
            };

            return port.postMessage(getSourceFailMsg);
        }

        const getSourceSucceedMsg: Message.IMessage = {
            type: Message.types.getScreenSourceId,
            data: sourceId
        };

        return port.postMessage(getSourceSucceedMsg);
    }
});
