/*global chrome*/

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'displayScreenshot') {
    const screenshotUrl = message.screenshotUrl;
    const imgElement = `<img src="${screenshotUrl}" alt="Screenshot" style="max-width: 100%; height: auto; display: block; margin-top: 10px;" />`;
    console.log("adding another screenshot");
    document.getElementById('screenshotContainer').innerHTML += imgElement;
  }
});