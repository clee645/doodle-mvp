/*global chrome*/

// Retrieve the screenshot URL from the background script
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'displayScreenshot') {
    console.log('received display screenshot');
    var screenshotUrl = message.screenshotUrl;
    document.getElementById('screenshotContainer').innerHTML = `<img src="${screenshotUrl}" alt="Screenshot" />`;
  }
});