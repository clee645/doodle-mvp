/*global chrome*/

let isListeningForTabUpdates = true;
let debounceTimer;
let lastElementPosition = {};
let currentElementInfo = "initialize"; 

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

    if (message.action === 'startCapture') {
        console.log("Starting capture...");
        takeScreenshotAndSetDescription();
    }

    if (message.action === 'openSidePanel') {
        console.log('Opening side panel');
        chrome.sidePanel.open({
            tabId: message.tabId,
            windowId: message.windowId
        });
        currentElementInfo = "initialize"; // Reset to "initialize" when starting a new capture session
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
        console.log("Received content script output");
        lastElementPosition[tabId] = message.elementPosition;
        currentElementInfo = message.elementInfo; // Update current element info with what's received
        processTabUpdateWithElementInfo(tabId, currentElementInfo);
    }

}); 

function takeScreenshotAndSetDescription() {
    // Assuming you have a way to get the current active tab ID
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var activeTab = tabs[0];
        chrome.tabs.captureVisibleTab(activeTab.windowId, {format: 'png'}, function(screenshotUrl) {
            console.log("Screenshot taken.");
            // Send the screenshot URL back to the side panel or handle as needed
            // For example, sending a message to sidepanel.js or directly setting the description
            // Assuming you have a function to send messages to your sidepanel or other parts of your extension:
            sendScreenshotToSidePanel(screenshotUrl, "Welcome to Doodle"); // Implement this function as needed
        });
    });
}

function sendScreenshotToSidePanel(screenshotUrl, description) {
    // Example: Sending message to a content script or side panel
    chrome.runtime.sendMessage({
        action: 'displayScreenshot',
        screenshotUrl: screenshotUrl,
        description: description // This can be "Welcome to Doodle" or ""
    });
}

function listenForTabUpdates() {
    chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
        if (isListeningForTabUpdates && changeInfo.status === 'complete') {
            // Now uses currentElementInfo which will only be "initialize" at the start
            processTabUpdateWithElementInfo(tab, currentElementInfo);
        }
    });
}

function processTabUpdateWithElementInfo(tab, elementInfo) {
    if (debounceTimer) {
        clearTimeout(debounceTimer);
    }
    debounceTimer = setTimeout(() => {
        chrome.tabs.captureVisibleTab(tab.windowId, { format: "png" }, function(screenshotUrl) {
            console.log("Sending screenshot to side panel JS");
            chrome.runtime.sendMessage({ action: 'displayScreenshot', screenshotUrl, elementPosition: lastElementPosition[tab.id], elementInfo });
            delete lastElementPosition[tab.id];
        });
    }, 1500);
}
