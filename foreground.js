chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  // check if already injected
  if (msg.cmd === "injected") {
    if (chrome.runtime.lastError) {
      sendResponse({
        message: "fail",
      });
      return;
    }
    sendResponse({
      message: "success",
    });
    return true;
  }
  // process playlist
  else if (msg.cmd === "process_playlist") {
    if (chrome.runtime.lastError) {
      sendResponse({
        message: "fail",
      });
      return;
    }
    console.log("processing playlist data");

    chrome.storage.local.get("xPath", (data) => {
      let playlistData;
      playlistData = getPlaylistData(data.xPath);

      sendResponse({
        message: "success",
        payload: playlistData,
      });
    });

    return true;
  }
});

function getPlaylistData(xPath) {
  let tsvDataArray = new Array();

  let conts = getElementByXpath(xPath);
  // loop through all contents
  for (let i = 0; i < conts.childElementCount; i++) {
    let cont = conts.childNodes[i].childNodes[3].childNodes[1].childNodes[3].childNodes[1].childNodes[3];
    let link = "https://youtube.com" + cont.getAttribute("href").split("&")[0];
    let title = cont.getAttribute("title");
    let data = `${i}\t${title}\t${link}`;
    tsvDataArray.push(data);
  }
  return tsvDataArray;
}

// get element by xPath
function getElementByXpath(path) {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}
