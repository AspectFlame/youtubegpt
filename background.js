chrome.runtime.onInstalled.addListener(() => {

    chrome.tabs.query({currentWindow: true}, (tabs) => {
        if (tabs.length > 1) {
            const secondTabId = tabs[1].id;  // Get the second tab's ID
            console.log(tabs[1].title);
            chrome.scripting.executeScript({
                target: {tabId: secondTabId},
            
                func: () => {
                    chrome.runtime.sendMessage({ action: "pasteText", text: "Hello, World!" });
                }
            });
        } else {
            console.log("There is only one tab open.");
        }
    });

});
