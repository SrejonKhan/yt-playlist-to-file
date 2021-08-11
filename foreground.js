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

    let xPath = msg.isRadio ? "xPathRadio" : "xPath"; //determine which xPath to load

    chrome.storage.local.get(xPath, (data) => {
      let playlistData;
      playlistData = getPlaylistData(msg.isRadio ? data.xPathRadio : data.xPath, msg.isRadio);

      sendResponse({
        message: "success",
        payload: playlistData,
      });
    });

    return true;
  }
});

function getPlaylistData(xPath, isRadio) {
  let tsvDataArray = new Array();

  let conts = getElementByXpath(xPath);
  // loop through all contents
  for (let i = 0; i < conts.childElementCount; i++) {
    //radio playlist
    if (isRadio) {
      let link = "https://youtube.com" + conts.childNodes[i].childNodes[2].childNodes[1].childNodes[3].childNodes[1].childNodes[1].getAttribute("href").split("&")[0];
      let title = conts.childNodes[i].childNodes[2].childNodes[1].childNodes[5].childNodes[3].childNodes[3].innerText;
      let data = `${i + 1}\t${title}\t${link}\n`;
      tsvDataArray.push(data);
    }
    //generic playlist
    else {
      let cont = conts.childNodes[i].childNodes[3].childNodes[1].childNodes[3].childNodes[1].childNodes[3];
      let link = "https://youtube.com" + cont.getAttribute("href").split("&")[0];
      let title = cont.getAttribute("title");
      let data = `${i + 1}\t${title}\t${link}\n`;
      tsvDataArray.push(data);
    }
  }
  return tsvDataArray;
}

// get element by xPath
function getElementByXpath(path) {
  return document.evaluate(path, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
}
