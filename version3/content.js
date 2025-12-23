// 1. Logic for TOP FRAME (The UI overlay)
if (window === window.top) {
  async function sendPlaybackRateToProxy(rate) {
    try {
      // Instead of postMessage to iframe, we broadcast to background
      // which will relay to all frames (including the inner video frame)
      chrome.runtime.sendMessage({ type: "SET_SPEED", value: Number(rate) });
    } catch (_) {
      // no-op
    }
  }
  var video = document.createElement("iframe");
  var posBtn = document.createElement("img");
  var resizeBtn = document.createElement("img");
  var reloadBtn = document.createElement("img");
  var accInput = document.createElement("input");
  var accelerator = 2;
  var past_url = "";
  var isResize = false;
  var isMove = false;
  var pre_mouse = { x: 0, y: 0 };
  var display = true;
  var baseUrl = "https://ian0336.github.io/adSkipperForYoutube";
  // var baseUrl = "http://localhost:5500";

  // Load settings from localStorage
  function loadSettings() {
    // Load playback speed
    if (localStorage.getItem('adSkipper_accelerator')) {
      accelerator = parseFloat(localStorage.getItem('adSkipper_accelerator'));
      accInput.value = accelerator;
    }
    
    // Load display state
    if (localStorage.getItem('adSkipper_display') !== null) {
      display = localStorage.getItem('adSkipper_display') === 'true';
    }
    
    // Load iframe dimensions
    if (localStorage.getItem('adSkipper_width')) {
      video.width = parseInt(localStorage.getItem('adSkipper_width'));
    }
    
    if (localStorage.getItem('adSkipper_height')) {
      video.height = parseInt(localStorage.getItem('adSkipper_height'));
    }
    
    // Load iframe position
    if (localStorage.getItem('adSkipper_marginTop')) {
      video.style["margin-top"] = localStorage.getItem('adSkipper_marginTop');
    }
    
    if (localStorage.getItem('adSkipper_marginLeft')) {
      video.style["margin-left"] = localStorage.getItem('adSkipper_marginLeft');
    }
    
    // Apply display state
    if (!display) {
      removeElements();
    }
  }

  // Function to remove all elements from the page
  function removeElements() {
    if (document.querySelector('iframe[id="NoAddMyvideo"]')) {
      document.querySelector('iframe[id="NoAddMyvideo"]').remove();
    }
    if (document.querySelector('img[alt="resize"]')) {
      document.querySelector('img[alt="resize"]').remove();
    }
    if (document.querySelector('img[alt="move"]')) {
      document.querySelector('img[alt="move"]').remove();
    }
    if (document.querySelector('input[alt="resize"]')) {
      document.querySelector('input[alt="resize"]').remove();
    }
    if (document.querySelector('img[alt="reload"]')) {
      document.querySelector('img[alt="reload"]').remove();
    }
  }

  function checkElements() {
    if (!document.querySelector('iframe[id="NoAddMyvideo"]')) {
      return false;
    }
    if (!document.querySelector('img[alt="resize"]')) {
      return false;
    }
    if (!document.querySelector('img[alt="move"]')) {
      return false;
    }
    if (!document.querySelector('input[alt="resize"]')) {
      return false;
    }
    if (!document.querySelector('img[alt="reload"]')) {
      return false;
    }
    return true;

  }

  // Function to create and add all elements to the page
  function addElements() {
    console.log("addElements");
    video = document.createElement("iframe");
    posBtn = document.createElement("img");
    resizeBtn = document.createElement("img");
    reloadBtn = document.createElement("img");
    accInput = document.createElement("input");
    
    build_iframe();
    build_settings();
    
    // Apply saved settings to the new elements
    if (localStorage.getItem('adSkipper_accelerator')) {
      accelerator = parseFloat(localStorage.getItem('adSkipper_accelerator'));
      accInput.value = accelerator;
    }
    
    if (localStorage.getItem('adSkipper_width')) {
      video.width = parseInt(localStorage.getItem('adSkipper_width'));
    }
    
    if (localStorage.getItem('adSkipper_height')) {
      video.height = parseInt(localStorage.getItem('adSkipper_height'));
    }
    
    if (localStorage.getItem('adSkipper_marginTop')) {
      video.style["margin-top"] = localStorage.getItem('adSkipper_marginTop');
    }
    
    if (localStorage.getItem('adSkipper_marginLeft')) {
      video.style["margin-left"] = localStorage.getItem('adSkipper_marginLeft');
    }
    
    fit_settings();
    if_change_url_or_not();
    
    // Add event listeners to new elements
    addEventListeners();
    
    setTimeout(() => {
      add_drag_listener();
    }, 1000);
  }

  // Function to add all event listeners to elements
  function addEventListeners() {
    // Position button events
    posBtn.addEventListener("mouseenter", () => {
      posBtn.style["opacity"] = 1;
    });
    
    posBtn.addEventListener("mouseleave", () => {
      posBtn.style["opacity"] = 0.5;
    });
    
    posBtn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      isMove = true;
      pre_mouse.x = e.clientX;
      pre_mouse.y = e.clientY;
      document.documentElement.addEventListener("mousemove", onMouseMove);
      document.documentElement.addEventListener("mouseup", onMouseUp);
    });
    
    // Resize button events
    resizeBtn.addEventListener("mouseenter", () => {
      resizeBtn.style["opacity"] = 1;
    });
    
    resizeBtn.addEventListener("mouseleave", () => {
      resizeBtn.style["opacity"] = 0.5;
    });
    
    resizeBtn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      isResize = true;
      pre_mouse.x = e.clientX;
      pre_mouse.y = e.clientY;
      document.documentElement.addEventListener("mousemove", onMouseMove);
      document.documentElement.addEventListener("mouseup", onMouseUp);
    });
    
    // Reload button events
    
    reloadBtn.addEventListener("mouseenter", () => {
      reloadBtn.style["opacity"] = 1;
    });
    
    reloadBtn.addEventListener("mouseleave", () => {
      reloadBtn.style["opacity"] = 0.5;
    });

    reloadBtn.addEventListener("mousedown", (e) => {
      e.preventDefault();
      console.log("reload");
      // Reload iframe without touching cross-origin window properties
      var currentSrc = video.getAttribute("src") || "";
      try {
        var url = new URL(currentSrc, location.href);
        url.searchParams.set("_reload", Date.now().toString());
        video.setAttribute("src", url.toString());
        sendPlaybackRateToProxy(accelerator);
      } catch (_) {
        // Fallback if URL parsing fails
        video.setAttribute("src", currentSrc);
      }
    });
    
    // Input events
    accInput.addEventListener("mouseenter", () => {
      accInput.style["opacity"] = 1;
    });
    
    accInput.addEventListener("mouseleave", () => {
      accInput.style["opacity"] = 0.5;
    });
    
    accInput.addEventListener("change", (e) => {
      if (!checkElements()) return;
      
      accelerator = e.target.value;
      sendPlaybackRateToProxy(accelerator);
        
      saveSettings();
    });
  }

  // Save settings to localStorage
  function saveSettings() {
    localStorage.setItem('adSkipper_accelerator', accelerator);
    localStorage.setItem('adSkipper_display', display);
    localStorage.setItem('adSkipper_width', video.width);
    localStorage.setItem('adSkipper_height', video.height);
    localStorage.setItem('adSkipper_marginTop', video.style["margin-top"]);
    localStorage.setItem('adSkipper_marginLeft', video.style["margin-left"]);
  }

  function fit_settings() {
    resizeBtn.style["margin-top"] = `${
      parseInt(video.style["margin-top"].slice(0, -2)) - 20
    }px`;
    resizeBtn.style["margin-left"] = `${
      parseInt(video.style["margin-left"].slice(0, -2)) + parseInt(video.width)
    }px`;
    reloadBtn.style["margin-top"] = `${
      parseInt(video.style["margin-top"].slice(0, -2)) - 20
    }px`;
    reloadBtn.style["margin-left"] = `${
      parseInt(video.style["margin-left"].slice(0, -2)) + parseInt(video.width)/4
    }px`;
    posBtn.style["margin-top"] = `${
      parseInt(video.style["margin-top"].slice(0, -2)) - 20
    }px`;
    posBtn.style["margin-left"] = `${
      parseInt(video.style["margin-left"].slice(0, -2)) +
      parseInt(video.width) / 2
    }px`;
    accInput.style["margin-top"] = `${
      parseInt(video.style["margin-top"].slice(0, -2)) - 20
    }px`;
    accInput.style["margin-left"] = `${parseInt(
      video.style["margin-left"].slice(0, -2)
    )}px`;
    accInput.style["width"] = `${parseInt(parseInt(video.width) / 10)}px`;
  }
  function build_settings() {
    let tmpSrc = chrome.runtime.getURL("resize.png");
    resizeBtn.src = tmpSrc;
    resizeBtn.setAttribute("width", "20");
    resizeBtn.setAttribute("height", "20");

    resizeBtn.setAttribute(
      "style",
      "z-index : 5000; position: fixed; opacity:0.5"
    );

    resizeBtn.setAttribute("alt", "resize");
    document.querySelector("body").appendChild(resizeBtn);

    tmpSrc = chrome.runtime.getURL("move.png");
    posBtn.src = tmpSrc;
    posBtn.setAttribute("width", "20");
    posBtn.setAttribute("height", "20");

    posBtn.setAttribute("style", "z-index : 5000; position: fixed; opacity:0.5");

    posBtn.setAttribute("alt", "move");

    document.querySelector("body").appendChild(posBtn);

    tmpSrc = chrome.runtime.getURL("reload.png");
    reloadBtn.src = tmpSrc;
    reloadBtn.setAttribute("width", "20");
    reloadBtn.setAttribute("height", "20");
    reloadBtn.setAttribute("style", "z-index : 5000; position: fixed; opacity:0.5");
    reloadBtn.setAttribute("alt", "reload");
    document.querySelector("body").appendChild(reloadBtn);

    accInput.setAttribute("type", "number");
    accInput.setAttribute("step", "0.25");
    accInput.setAttribute("min", "0");
    accInput.setAttribute("max", "10");
    accInput.setAttribute("value", accelerator.toString());
    accInput.setAttribute(
      "style",
      "z-index : 5000; position: fixed; opacity:0.5"
    );

    accInput.setAttribute("alt", "resize");
    fit_settings();
    document.querySelector("body").appendChild(accInput);
  }

  function delete_other_player() {
    var players = document.querySelectorAll(
      'video[class="video-stream html5-main-video"]'
    );
    for (elt of players) {
      elt.remove();
    }
  }
  function if_change_url_or_not() {
    console.log("if_change_url_or_not", location.href);
    var url = location.href;
    if(url.includes("watch") == false && url.includes("shorts") == false) return;
    if (url != past_url) {
      var str = url.split("?");
      console.log(str);
      if (str.length > 1) {
        var newUrl = baseUrl + "?" + str[1]
        video.setAttribute("src", newUrl);
      }
      else if(url.includes("shorts")) {
        var str = url.split("shorts/");
        var newUrl = baseUrl + "?v=" + str[1];
        console.log(newUrl);
        video.setAttribute("src", newUrl);
      }
    }
    past_url = url;
  }
  function build_iframe() {
    video.setAttribute("src", baseUrl);
    video.setAttribute("id", "NoAddMyvideo");
    video.setAttribute("width", "560");
    video.setAttribute("height", "315");
    video.setAttribute("title", "YouTube video player");
    video.setAttribute("frameborder", "0");
    video.setAttribute(
      "style",
      " z-index : 5000; position: fixed; margin-top: 200px; margin-left: 100px; "
    );
    video.setAttribute("alt", "Please drag the video");

    video.setAttribute(
      "allow",
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
    );
    video.setAttribute("allowfullscreen", "");
    video.scrollIntoView();

    document.querySelector("body").appendChild(video);
  }
  function change_url(e) {
    e.preventDefault(); 

    var str = this.href.split("?");
    if (str.length > 1) {
      var newUrl = baseUrl + "?" + str[1]
    }
    else if(url.includes("shorts")) {
      var str = url.split("shorts/");
      var newUrl = baseUrl + "?v=" + str[1];
    }
    else {
      var newUrl = baseUrl;
    }
    console.log(newUrl);
    video.setAttribute("src", newUrl);
    setTimeout(() => {
      sendPlaybackRateToProxy(accelerator);
    }, 1000); 
  }
  function add_drag_listener() {
    if (!checkElements()) {
      return;
    }
    sendPlaybackRateToProxy(accelerator);
    targetTags = ["ytd-video-renderer", "yt-lockup-view-model", "ytd-rich-item-renderer", "ytd-thumbnail"]

    let listsSet = new Set();
    for (elt of targetTags) {
      for (elt2 of document.querySelectorAll(elt)) {
        listsSet.add(elt2);
      }
    }
    lists = Array.from(listsSet);

    var all_a = [];
    for (elt of lists) {
      var aa = elt.querySelectorAll("a");
      for (s of aa) {
        all_a.push(s);
      }
    }


    for (elt of all_a) {
      elt.style["z-index"] = 4999;
      elt.removeEventListener("dragstart", change_url);
      elt.addEventListener("dragstart", change_url);
    }
  }
  const onMessage = (message) => {
    if (message.func == "disable") {
      if (display) {
        // Currently displayed, remove elements
        removeElements();
        display = false;
      } else {
        // Currently hidden, add elements back
        addElements();
        display = true;
      }
      saveSettings(); // Save display state when toggled
    } else if (message.func == "reset") {
      // If elements are not displayed, add them first
      if (!display) {
        addElements();
        display = true;
      }
      
      // Then reset position and size
      video.width = 560;
      video.height = 315;
      video.style["margin-top"] = "200px";
      video.style["margin-left"] = "100px";
      fit_settings();
      saveSettings(); // Save settings after reset
    }
  };

  function onMouseMove(e) {
    video.style.pointerEvents = "none";
    if (isResize) {
      let move = e.clientX - pre_mouse.x;
      video.width = parseInt(video.width) + move;
      video.height = (parseInt(video.width) / 560) * 315;
      fit_settings();
      pre_mouse.x = e.clientX;
    } else if (isMove) {
      let moveX = e.clientX - pre_mouse.x;
      let moveY = e.clientY - pre_mouse.y;
      video.style["margin-top"] = `${
        parseInt(video.style["margin-top"].slice(0, -2)) + moveY
      }px`;
      video.style["margin-left"] = `${
        parseInt(video.style["margin-left"].slice(0, -2)) + moveX
      }px`;

      fit_settings();
      pre_mouse.x = e.clientX;
      pre_mouse.y = e.clientY;
    }
  }
  function onMouseUp() {
    video.style.pointerEvents = "auto";
    isResize = false;
    isMove = false;
    saveSettings(); // Save position and size after drag or resize
    document.documentElement.removeEventListener("mousemove", onMouseMove);
    document.documentElement.removeEventListener("mouseup", onMouseUp);
  }

  function replace_video() {
    if (display && document.querySelector('iframe[id="NoAddMyvideo"]')) {
      delete_other_player();
      try {
        sendPlaybackRateToProxy(accelerator);
          
        if_change_url_or_not();
        setTimeout(() => { sendPlaybackRateToProxy(accelerator); }, 1000);
      } catch (e) {
        console.error("Error setting playback rate:", e);
      }
    }
  }

    // Initial setup for Top Frame
    loadSettings(); 


  // Only create elements if display is true
  if (display) {
    build_iframe();
    build_settings();
    fit_settings(); // Apply the loaded settings to the UI
    addEventListeners(); // Add event listeners to the elements
  }

  window.addEventListener("load", (event) => {
    console.log("page is fully loaded");
    if (display) {
      add_drag_listener();
      replace_video();
    }
  });

  addEventListener("wheel", (event) => {
    if (display) {
      add_drag_listener();
    }
  });

  window.navigation.addEventListener("navigatesuccess", (event) => { 
    console.log('location changed!');
    // await 1000ms to wait for the page to load
    setTimeout(() => {
      if (display) {
        add_drag_listener();
        replace_video();
      }
    }, 500);
  });

  chrome.runtime.onMessage.addListener(onMessage);

} // END of window.top check


// 2. Logic for ALL FRAMES (The Playback Control)
// This part runs in the iframe as well (thanks to all_frames: true)
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "SET_SPEED") {
    var rate = Number(message.value);
    if (!Number.isFinite(rate)) return;

    // Try to find the video element and set rate
    var videos = document.getElementsByTagName("video");
    for (var i = 0; i < videos.length; i++) {
        try {
            videos[i].playbackRate = rate;
            console.log("AdSkipper: Set direct speed to", rate);
        } catch(e) { /* ignore */ }
    }
  }
});
