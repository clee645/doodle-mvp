/*global chrome*/

let isListeningForTabUpdates = true;
let debounceTimer;
let lastElementPosition = {};

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status === 'complete' && tab.url) {
        chrome.scripting.executeScript({
            target: {tabId: tabId},
            files: ['content-script.js']
        }).then(() => {
            console.log("Injected content script into tab " + tabId);
        }).catch(err => console.error("Failed to inject content script: ", err));
    }
});

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    const tabId = sender.tab ? sender.tab.id : null;

    if (message.action === 'openSidePanel') {
        console.log('opening sidepanel')
        chrome.sidePanel.open({
            tabId: message.tabId,
            windowId: message.windowId
        });
    } 
    if (message.action === 'startListeningForTabUpdates') {
        console.log("background.js triggering listener")
        isListeningForTabUpdates = true;
        listenForTabUpdates();
    }

    if (message.action === 'pauseCapture') {
        if(isListeningForTabUpdates){
            console.log("background.js capture has been paused")
            isListeningForTabUpdates = false;
        } else {
            console.log("background.js capture has been resumed")
            isListeningForTabUpdates = true;
        }
    }

    if (message.action === 'captureElement' && tabId !== null) {
        // Store the element position along with the tabId
        console.log("received content script output");
        lastElementPosition[tabId] = message.elementPosition;
    }

}); 

function listenForTabUpdates() {
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        if (isListeningForTabUpdates && changeInfo.status === 'complete') {
            processTabUpdate(tab);
        }
    });
}

function processTabUpdate(tab) {
    // Clear the previous debounce timer if it exists
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }
    // Set a new debounce timer
    debounceTimer = setTimeout(() => {
        chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" }, function(screenshotUrl) {
            console.log("sending screenshot to sidepanel js");
            chrome.runtime.sendMessage({ action: 'displayScreenshot', screenshotUrl, elementPosition: lastElementPosition[tab.id] });
            delete lastElementPosition[tab.id]; 
        });
    }, 1500); // Adjust the debounce time as necessary
}
