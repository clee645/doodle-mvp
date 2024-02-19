/*global chrome*/

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'openSidePanel') {
        console.log('opening sidepanel')
        chrome.sidePanel.open({
            tabId: message.tabId,
            windowId: message.windowId
        });
    } 
    if (message.action === 'displayScreenshot') {
    // Forward the message to the active tab
        console.log('displaying screenshot from js')
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          const activeTabId = tabs[0].id;
          console.log('background.js sending message with screenshot')
          chrome.tabs.sendMessage(activeTabId, { action: 'displayScreenshot', screenshotUrl: message.screenshotUrl });
        });
    }
  }); 