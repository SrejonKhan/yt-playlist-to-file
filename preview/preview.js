chrome.runtime.sendMessage(
  {
    cmd: "get_preview_data",
  },
  (response) => {
    if (response.message === "success") {
      document.getElementById("result").innerText = response.payload.previewData;
    } else {
      // handle error here
    }
  }
);
