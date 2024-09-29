document.getElementById("pasteButton").addEventListener("click", async () => {


    console.log("Button clicked!");

    chrome.tabs.query({ currentWindow: true }, async function (tabs) {
        if (tabs.length > 1) {
            const secondTabId = tabs[1].id;
            console.log("Second tab title: ", tabs[1].title);
            console.log("Second tab ID: ", secondTabId);

            const thirdTabUrl = tabs[2].url;
            console.log("Third tab URL: ", thirdTabUrl);

            const videoId = getYouTubeVideoID(thirdTabUrl);
            const transcript = await reteriveTranscript(videoId); // Await the transcript retrieval
            console.log(transcript);

            const textToPaste = document.getElementById("textToPaste").value + " ... use the following transcript as context to answer the question within 10 seconds please... " + transcript;
            console.log(textToPaste);

            const inputField = document.getElementById('prompt-textarea');
            if (inputField) {
                console.log("gay as hell");
            }
            console.log("Text to paste: ", textToPaste);
            chrome.scripting.executeScript({
                target: { tabId: secondTabId },
                func: (textToPaste) => {
                    console.log("Script running");
                    var inputField = document.getElementById('prompt-textarea');
                    inputField.focus();
                    inputField.textContent = textToPaste;

                    var sendButton = document.querySelector('button[aria-label="Send prompt"]');
                    sendButton.click();
                    var tes = document.getElementsByClassName("text-base");
                    
                    setTimeout(() => {
                        var result = tes[tes.length - 3].textContent;
                        console.log(result);
                        chrome.runtime.sendMessage({data: result});
                      }, 5000); // 5000 milliseconds = 5 seconds




                },
                args: [textToPaste]
            }, () => {
                chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
                    console.log(request.data);
                    let modifiedData = request.data.substring(7, request.data.length - 2);
                    document.getElementById('latestResultDisplay').innerHTML = "ChatGPT: " + modifiedData;
                });
                if (chrome.runtime.lastError) {
                    console.error("Error executing script:", chrome.runtime.lastError.message);
                } else {
                    console.log("Script executed successfully!");
                }
            });
            
        } else {
            console.error("No second tab found!");
        }
    });
});

async function reteriveTranscript(videoId) {
    const YT_INITIAL_PLAYER_RESPONSE_RE =
        /ytInitialPlayerResponse\s*=\s*({.+?})\s*;\s*(?:var\s+(?:meta|head)|<\/script|\n)/;

    let player = window.ytInitialPlayerResponse;
    if (!player || videoID !== player.videoDetails.videoId) {
        try {
            const response = await fetch('https://www.youtube.com/watch?v=' + videoId);
            const body = await response.text();
            const playerResponse = body.match(YT_INITIAL_PLAYER_RESPONSE_RE);
            if (!playerResponse) {
                console.warn('Unable to parse playerResponse');
                return;
            }
            player = JSON.parse(playerResponse[1]);
            const metadata = {
                title: player.videoDetails.title,
                duration: player.videoDetails.lengthSeconds,
                author: player.videoDetails.author,
                views: player.videoDetails.viewCount,
            };

            const tracks = player.captions.playerCaptionsTracklistRenderer.captionTracks;
            tracks.sort(compareTracks);

            const transcriptResponse = await fetch(tracks[0].baseUrl + '&fmt=json3');
            const transcript = await transcriptResponse.json();

            const parsedTranscript = transcript.events
                .filter(function (x) {
                    return x.segs;
                })
                .map(function (x) {
                    return x.segs
                        .map(function (y) {
                            return y.utf8;
                        })
                        .join(' ');
                })
                .join(' ')
                .replace(/[\u200B-\u200D\uFEFF]/g, '')
                .replace(/\s+/g, ' ');

            console.log(parsedTranscript);
            return parsedTranscript;
        } catch (error) {
            console.error("Error fetching transcript:", error);
            return null;
        }
    }
}

function getYouTubeVideoID(url) {
    const regex = /v=([^&]+)/;
    const match = url.match(regex);
    return match ? match[1] : null;
}

function compareTracks(track1, track2) {
    const langCode1 = track1.languageCode;
    const langCode2 = track2.languageCode;

    if (langCode1 === 'en' && langCode2 !== 'en') {
        return -1; // English comes first
    } else if (langCode1 !== 'en' && langCode2 === 'en') {
        return 1; // English comes first
    } else if (track1.kind !== 'asr' && track2.kind === 'asr') {
        return -1; // Non-ASR comes first
    } else if (track1.kind === 'asr' && track2.kind !== 'asr') {
        return 1; // Non-ASR comes first
    }

    return 0; // Preserve order if both have same priority
}
