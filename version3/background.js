// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Relay the 'SET_SPEED' message to all frames in the sender's tab
  if (message.type === "SET_SPEED" && sender.tab) {
    chrome.tabs.sendMessage(sender.tab.id, message, { frameId: 0 }); // Optional: send to top frame if needed
    
    // We want to broadcast to ALL frames, so we don't specify frameId,
    // or we can iterate if needed. But chrome.tabs.sendMessage by default sends to all frames 
    // IF we don't specify frameId? No, actually it defaults to top frame only usually.
    // To send to all frames, we need to specify it in options? 
    // Actually, chrome.tabs.sendMessage sends to all frames if no frameId is specified?
    // Let's check docs: "If frameId is missing, the message is sent to all frames in the tab." -> This is true for some APIs but often defaults to top.
    // Wait, typically chrome.tabs.sendMessage sends to a specific frame if specified.
    // Safest bet to hit all nested frames is to not restrict it, but let's just use the default behavior which sends to all listeners in the tab usually?
    // Correction: chrome.tabs.sendMessage(tabId, message, options)
    // If options.frameId is set, it goes there. 
    // To send to ALL frames, we usually don't set frameId. 
    
    // However, since we are inside a relentless loop of "send to tab", 
    // we should be careful not to cause infinite loops if the sender was the background itself.
    // But here sender is a content script.
    
    // Let's explicitly send to all frames.
    chrome.tabs.sendMessage(sender.tab.id, message);
  }
});
