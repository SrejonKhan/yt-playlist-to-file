// set default xpath
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({
    xPath:
      "/html/body/ytd-app/div/ytd-page-manager/ytd-browse/ytd-two-column-browse-results-renderer/div[1]/ytd-section-list-renderer/div[2]/ytd-item-section-renderer/div[3]/ytd-playlist-video-list-renderer/div[3]",
  });
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.cmd === "get_playlist") {
    // if error, ignore
    if (chrome.runtime.lastError) {
      sendResponse({
        message: "fail",
      });
      return;
    }

    getCurrentTab()
      .then((tab) => getPlaylistData(tab.id, tab.url))
      .then((data) => {
        sendResponse({
          message: "success",
          payload: data.payload,
        });
      });

    return true;
  }
});

async function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

async function getPlaylistData(tabId, url) {
  if (!/^http/.test(url)) return;

  let getData = new Promise((resolve, reject) => {
    sendForegroundMsg(tabId, "injected").then((res) => {
      console.log(res);
      // if already inject, direct send message without injecting
      if (res.message === "success") {
        sendForegroundMsg(tabId, "process_playlist").then((response) => resolve(response));
      }
      // else, inject script first, then send message
      else if (res.message === "fail") {
        chrome.scripting
          .executeScript({
            target: { tabId: tabId },
            files: ["./foreground.js"],
          })
          .then(() => sendForegroundMsg(tabId, "process_playlist"))
          .then((response) => resolve(response));
      }
    });
  });

  return await getData;
}

async function sendForegroundMsg(tabId, cmd) {
  let sendMsg = new Promise((resolve, reject) => {
    chrome.tabs.sendMessage(
      tabId,
      {
        cmd: cmd,
      },
      (res) => {
        if (chrome.runtime.lastError) return resolve({ message: "fail" });
        else return resolve(res);
      }
    );
  });
  return await sendMsg;
}

async function checkInjectedScript() {}
