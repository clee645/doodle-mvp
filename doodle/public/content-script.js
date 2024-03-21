/*global chrome*/

document.addEventListener('click', function(event) {
    console.log("content script is working");
    const target = event.target; // The clicked element
    pollForDimensionChanges(target);
    //event.preventDefault(); // Consider removing or modifying this based on your needs
}, true);

function pollForDimensionChanges(element) {
    let prevDimensions = JSON.stringify(getBoundingRect(element));
    const start = Date.now();
    const handle = setInterval(() => {
        let currentDimensions = JSON.stringify(getBoundingRect(element));
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

function getBoundingRect(element) {
    var style = window.getComputedStyle(element);
    var margin = {
        left: parseInt(style["margin-left"], 10),
        right: parseInt(style["margin-right"], 10),
        top: parseInt(style["margin-top"], 10),
        bottom: parseInt(style["margin-bottom"], 10)
    };
    var padding = {
        left: parseInt(style["padding-left"], 10),
        right: parseInt(style["padding-right"], 10),
        top: parseInt(style["padding-top"], 10),
        bottom: parseInt(style["padding-bottom"], 10)
    };
    var border = {
        left: parseInt(style["border-left-width"], 10),
        right: parseInt(style["border-right-width"], 10),
        top: parseInt(style["border-top-width"], 10),
        bottom: parseInt(style["border-bottom-width"], 10)
    };
    
    var rect = element.getBoundingClientRect();
    rect = {
        left: rect.left - margin.left,
        right: rect.right + margin.right - padding.left - padding.right - border.left - border.right,
        top: rect.top - margin.top,
        bottom: rect.bottom + margin.bottom - padding.top - padding.bottom - border.top - border.bottom
    };
    rect.width = (rect.right - rect.left) * 2;
    rect.height = (rect.bottom - rect.top) * 2;

    // Adjusting for scroll to get accurate position relative to document
    rect.x = (rect.left + window.scrollX)*2;
    rect.y = (rect.top + window.scrollY)*2;
    
    return rect;
}

function sendElementPositionToBackground(dimensions) {
    chrome.runtime.sendMessage({
        action: 'captureElement',
        elementPosition: dimensions // Directly use the adjusted dimensions which now include x and y
    }, function(response) {
        if (chrome.runtime.lastError) {
            console.log("Error sending message:", chrome.runtime.lastError);
            // Handle the error or retry sending the message as appropriate
        }
    });
    console.log("content script sent message");
}

