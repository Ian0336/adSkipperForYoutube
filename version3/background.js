// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Relay the 'SET_SPEED' message to all frames in the sender's tab
  if (message.type === "SET_SPEED" && sender.tab) {
    chrome.tabs.sendMessage(sender.tab.id, message);
  } else if (message.type === "IFRAME_READY" && sender.tab) {
      // Relay "IFRAME_READY" to all frames (specifically so the top frame hears it)
      chrome.tabs.sendMessage(sender.tab.id, message);
  }
});
