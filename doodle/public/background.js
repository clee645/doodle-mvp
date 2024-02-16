/*global chrome*/

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
    if (message.action === 'openSidePanel') {
      chrome.sidePanel.open({
        tabId: message.tabId,
        windowId: message.windowId
      });
    }
  });