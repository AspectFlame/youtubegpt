chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "pasteText") {
      const inputField = document.querySelector('input, textarea');
      if (inputField) {
        inputField.value = request.text;
      }
    }
  });
  