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

chrome.runtime.onInstalled.addListener(function (detail) {
    const manifest = chrome.runtime.getManifest();
    // NOTE(gaolw): only alert can work here, not console.
    // alert('Teamious Screen capture installed.');
    const contentJs = manifest.content_scripts[0].js;

    chrome.windows.getAll({ populate: true }, windows => {
        windows.forEach(window => {
            window.tabs.forEach(tab => {
                //if (!tab.url.match(/(chrome):\/\//gi)) {
                    injectContentJsIntoTab(tab, contentJs);
                //}
            })
        })
    });
})

function injectContentJsIntoTab(tab: chrome.tabs.Tab, contentJs: string[]) {
    contentJs.forEach(js => {
        chrome.tabs.executeScript(tab.id, {
            file: js
        }, function () {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError);
            }
        });
    });
}
