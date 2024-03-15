/*global chrome*/

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.action === "displayScreenshot") {
    // If the message includes elementPosition, process the image to draw a red box
    console.log("received message to begin displaying screenshot");
    if (message.elementPosition) {
      console.log("modifying screenshot");
      drawOnImage(message.screenshotUrl, message.elementPosition, (modifiedImageUrl) => {
        displayImage(modifiedImageUrl);
      });
      console.log("drew on screenshot");
    } else {
      // If no elementPosition is provided, display the image as is
      console.log("unmodified screenshot");
      displayImage(message.screenshotUrl);
    }
  }
});

function drawOnImage(dataUrl, rect, callback) {
  console.log("drawing on image");
  var img = new Image();
  img.onload = function() {
    var canvas = document.createElement('canvas');
    canvas.width = img.width;
    canvas.height = img.height;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    // Draw the red box
    ctx.strokeStyle = 'red';
    ctx.lineWidth = 5;
    // Adjusting rect positions based on potential scrolling and image scaling
    ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
    callback(canvas.toDataURL('image/png'));
  };
  img.src = dataUrl;
}

function displayImage(imageUrl) {
  const imgElement = `<img src="${imageUrl}" alt="Screenshot with Highlight" style="max-width: 100%; height: auto; display: block; margin-top: 10px;" />`;
  console.log("Displaying processed screenshot");
  // Ensuring the container for the image exists and is cleared before adding new content
  var container = document.getElementById('screenshotContainer');
  if (container) {
    container.innerHTML += imgElement;
  } else {
    console.log("Error: screenshotContainer element not found.");
  }
}

document.getElementById('stopCapture').addEventListener('click', function() {
  document.getElementById('message').textContent = 'Capture stopped';
});

document.getElementById('restartCapture').addEventListener('click', function() {
  console.log("successfully restarted capture");
  document.getElementById('screenshotContainer').innerHTML = '';
});

document.getElementById('pauseCapture').addEventListener('click', function() {
  chrome.runtime.sendMessage({ action: 'pauseCapture' });
});




// /*global chrome*/

// chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
//   if (message.action === 'displayWebsiteInfo') {
//     const websiteLogo = message.websiteLogo;
//     const websiteUrl = message.websiteUrl;

//     // Extract domain name without "www." prefix
//     const domain = extractDomain(websiteUrl);

//     // Display the website logo
//     document.getElementById('logoContainer').innerHTML = `<img src="${websiteLogo}" alt="Website Logo" style="max-width: 100%; height: auto; display: block; margin-top: 10px;" />`;

//     // Display the domain name
//     document.getElementById('urlContainer').textContent = domain;
//   }
// });

// // Function to extract the domain name from the URL
// const extractDomain = (url) => {
//   try {
//     const domain = new URL(url).hostname;
//     return domain.replace("www.", "");
//   } catch (error) {
//     console.error('Error extracting domain:', error);
//     return "";
//   }
// };



