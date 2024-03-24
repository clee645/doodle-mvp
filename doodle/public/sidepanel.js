/*global chrome*/

require('dotenv').config(); // Load environment variables from .env file
const fetch = require('node-fetch');

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
    console.log(canvas.width);
    console.log(canvas.height);
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    // Set the fill color to #7801FD with opacity
    ctx.fillStyle = 'rgba(120, 1, 253, 0.3)';

    // Calculate the center of the circle
    var centerX = rect.x + rect.width / 2;
    var centerY = rect.y + rect.height / 2;
    
    // Increase the size of the radius. You can adjust this value as needed
    var radius = Math.max(rect.width, rect.height)/4; // Example of making the radius larger
    console.log(radius)

    ctx.beginPath(); // Start a new path
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI); // Create a circle
    ctx.fill(); // Fill the circle with the set style

    callback(canvas.toDataURL('image/png'));
  };
  img.src = dataUrl;
}



function displayImage(imageUrl) {
  // Replace this with your actual ImgBB API key
  const imgbbAPIKey = process.env.IMGBB_API_KEY;


  // Convert the image URL to a Blob and then to FormData
  fetch(imageUrl).then(res => res.blob()).then(blob => {
    let formData = new FormData();
    formData.append('image', blob);
    formData.append('key', imgbbAPIKey);

    // Upload the image to ImgBB
    fetch(`https://api.imgbb.com/1/upload`, {
      method: 'POST',
      body: formData,
    })
    .then(response => response.json())
    .then(data => {
      if (data.status === 200) {
        console.log('Image successfully uploaded to ImgBB');
        const imgbbImageUrl = data.data.url; // Get the URL of the uploaded image

        // Now call your Flask API with the ImgBB image URL
        fetch('http://127.0.0.1:5000/generate-description', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ imageUrl: imgbbImageUrl }),
        })
        .then(response => response.json())
        .then(data => {
          const description = data.description;
          console.log(description);
          // Display the image and description in the container
          var container = document.getElementById('screenshotContainer');
          const imgElement = `<img src="${imageUrl}" alt="Screenshot with Highlight" style="max-width: 100%; height: auto; display: block; margin-top: 10px;" />`;
          if (container) {
            container.innerHTML += description;
            container.innerHTML += imgElement;
          } else {
            console.log("Error: screenshotContainer element not found.");
          }

        })
        .catch(err => console.error('Error calling API:', err));
      } else {
        console.error('Failed to upload image to ImgBB');
      }
    })
    .catch(err => console.error('Error uploading image:', err));
  });
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

