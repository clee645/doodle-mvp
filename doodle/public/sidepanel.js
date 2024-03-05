/*global chrome*/

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === "displayScreenshot") {
    const screenshotUrl = message.screenshotUrl;
    const imgElement = `<img src="${screenshotUrl}" alt="Screenshot" style="max-width: 100%; height: auto; display: block; margin-top: 10px;" />`;
    console.log("adding another screenshot");
    document.getElementById('screenshotContainer').innerHTML += imgElement;
  }
});

/*global chrome*/

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === 'displayWebsiteInfo') {
    const websiteLogo = message.websiteLogo;
    const websiteUrl = message.websiteUrl;

    // Extract domain name without "www." prefix
    const domain = extractDomain(websiteUrl);

    // Display the website logo
    document.getElementById('logoContainer').innerHTML = `<img src="${websiteLogo}" alt="Website Logo" style="max-width: 100%; height: auto; display: block; margin-top: 10px;" />`;

    // Display the domain name
    document.getElementById('urlContainer').textContent = domain;
  }
});

// Function to extract the domain name from the URL
const extractDomain = (url) => {
  try {
    const domain = new URL(url).hostname;
    return domain.replace("www.", "");
  } catch (error) {
    console.error('Error extracting domain:', error);
    return "";
  }
};

