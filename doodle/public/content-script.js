/*global chrome*/

document.addEventListener('click', function(event) {
    console.log("content script is working");
    const target = event.target; // The clicked element
    pollForDimensionChanges(target);
    //event.preventDefault(); // Consider removing or modifying this based on your needs
}, true);

function pollForDimensionChanges(element) {
    let prevDimensions = JSON.stringify(element.getBoundingClientRect());
    const start = Date.now();
    const handle = setInterval(() => {
        let currentDimensions = JSON.stringify(element.getBoundingClientRect());
        if (currentDimensions === prevDimensions) {
            clearInterval(handle);
            console.log(
                `Dimensions stabilized in ${Date.now() - start}ms. Final dimensions:`,
                JSON.parse(currentDimensions)
            );
            sendElementPositionToBackground(JSON.parse(currentDimensions));
        } else {
            prevDimensions = currentDimensions;
        }
    }, 100); // Polling interval in milliseconds
}

function sendElementPositionToBackground(dimensions) {
    chrome.runtime.sendMessage({
        action: 'captureElement',
        elementPosition: {
            x: dimensions.left + window.scrollX, // Adjusted for scroll
            y: dimensions.top + window.scrollY, // Adjusted for scroll
            width: dimensions.width,
            height: dimensions.height
        }
    }, function(response) {
        if (chrome.runtime.lastError) {
            console.log("Error sending message:", chrome.runtime.lastError);
            // Handle the error or retry sending the message as appropriate
        }
    });
    console.log("content script sent message");
}
