/*global chrome*/

let isListeningForTabUpdates = false;
let debounceTimer;

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "openSidePanel") {
    console.log("opening sidepanel");
    chrome.sidePanel.open({
      tabId: message.tabId,
      windowId: message.windowId,
    });
  }
  if (
    message.action === "startListeningForTabUpdates" &&
    !isListeningForTabUpdates
  ) {
    console.log("background.js triggering listener");
    isListeningForTabUpdates = true;
    listenForTabUpdates();
  }
});

function listenForTabUpdates() {
  chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
    if (isListeningForTabUpdates && changeInfo.status === "complete") {
      // Clear the previous timer if it exists
      if (debounceTimer) {
        clearTimeout(debounceTimer);
      }
      // Set a new timer
      debounceTimer = setTimeout(() => {
        chrome.tabs.captureVisibleTab(
          tab.windowId,
          { format: "png" },
          function (screenshotUrl) {
            chrome.runtime.sendMessage({
              action: "displayScreenshot",
              screenshotUrl,
            });
          }
        );
      }, 1500); // Adjust the debounce time as necessary
    }
  });
}

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "displayWebsiteInfo") {
    // Forward the message to the side panel
    chrome.runtime.sendMessage({
      action: "displayWebsiteInfo",
      websiteLogo: message.websiteLogo,
      websiteUrl: message.websiteUrl,
    });
  }
});