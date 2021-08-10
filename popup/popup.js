const mainBody = document.getElementById("main-body");
const logTxt = document.getElementById("log-txt");

const resultParent = document.getElementById("result-parent");
const resultTxt = document.getElementById("result-txt");

const convertBtn = document.getElementById("convert-btn");
const previewBtn = document.getElementById("preview-btn");
const saveBtn = document.getElementById("save-btn");

let payloadData;

// convert playlist
convertBtn.addEventListener("click", () => {
  logTxt.innerText = "";
  getCurrentTab().then((tab) => {
    // generic playlist
    if (/(https:\/\/www.youtube.com\/playlist)/.test(tab.url)) {
      getPlaylistData();
    }
    // playlist but playing as radio
    else if (/(https:\/\/www.youtube.com\/)/.test(tab.url) && /(\&|\?)(list)\=(.*?)/.test(tab.url)) {
      getPlaylistData(true);
    }
    // other site
    else {
      logTxt.innerText = "You're not in any Youtube Playlist. Please open a playlist";
    }
  });
});

function getPlaylistData(isRadio = false) {
  chrome.runtime.sendMessage(
    {
      cmd: "get_playlist",
      isRadio: isRadio,
    },
    (response) => {
      if (response.message === "success") {
        // save to storage for preview
        chrome.storage.local.set({
          previewData: response.payload,
        });
        mainBody.style.display = "none";
        resultParent.style.display = "block";
        payloadData = response.payload;
        // TODO show data to front-end
        resultTxt.innerText = response.payload.length + " Playlist Converted.";
      } else {
        // handle error here
      }
    }
  );
}

async function getCurrentTab() {
  let queryOptions = { active: true, currentWindow: true };
  let [tab] = await chrome.tabs.query(queryOptions);
  return tab;
}

// open preview
previewBtn.addEventListener("click", openPreview);
function openPreview() {
  chrome.tabs.create({
    url: "./preview/preview.html",
  });
}

// save as .tsv
saveBtn.addEventListener("click", () => {
  let tsvData = "No.\t Title\t Link\n";
  payloadData.forEach((data) => (tsvData += data));
  download(tsvData, "playlist.tsv", "text/tab-separated-values;charset=utf-8");
});

// download file to local
function download(data, filename, type) {
  var file = new Blob([data], { type: type });
  if (window.navigator.msSaveOrOpenBlob)
    // IE10+
    window.navigator.msSaveOrOpenBlob(file, filename);
  else {
    // Others
    var a = document.createElement("a"),
      url = URL.createObjectURL(file);
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    setTimeout(function () {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 0);
  }
}
