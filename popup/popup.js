chrome.runtime.sendMessage(
  {
    cmd: "get_playlist",
  },
  (response) => {
    if (response.message === "success") {
      document.getElementById("msg").innerText = "Okay got a message - " + response.payload;
    } else {
      // handle error here
    }
  }
);

//openPreview();

function openPreview() {
  chrome.tabs.create({
    url: "./preview.html",
  });
}
