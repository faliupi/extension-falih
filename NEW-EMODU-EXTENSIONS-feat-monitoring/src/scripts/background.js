import { BE_ENDPOINT_V2 } from "../constants";

function shouldTriggerPopup(url, meetingCode) {
  return (
    !!meetingCode &&
    meetingCode !== "" &&
    url &&
    !url.includes("meet.google.com") &&
    !url.startsWith("chrome://") &&
    !url.startsWith("chrome-extension://")
  );
}

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, async (tab) => {
    const state = await chrome.storage.sync.get("meetingCode");
    if (shouldTriggerPopup(tab.url, state.meetingCode)) {
      chrome.scripting.executeScript({
        target: { tabId: activeInfo.tabId },
        files: ["inject.js"],
      });
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && shouldTriggerPopup(tab.url)) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["inject.js"],
    });
  }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "UPDATE_STATUS") {
    updateParticipantStatus();
  }
});

async function updateParticipantStatus() {
  try {
    const updateStatusPayload = {
      status: 1,
      isAddLeaveCount: true,
    };

    const persistedUserState = await chrome.storage.local.get("user-storage");
    const userStorage = JSON.parse(persistedUserState["user-storage"]);
    const profile = userStorage.state.profile;

    const state = await chrome.storage.sync.get("meetingCode");
    const meetingCode = state.meetingCode;

    if (!meetingCode || !userStorage?.state?.accessToken || !profile.id) {
      console.error(
        "Failed to update participant status: missing meetingCode or accessToken",
      );
      return;
    }

    updateStatusPayload.idUser = profile.id;

    fetch(`${BE_ENDPOINT_V2}/meetings/update/${meetingCode}/participant`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userStorage.state.accessToken}`,
      },
      body: JSON.stringify(updateStatusPayload),
    });
  } catch (e) {
    console.error("Failed to update participant status", e);
  }
}
