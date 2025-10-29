// src/scripts/background.js
import { BE_ENDPOINT_V2 } from "../constants";

/**
 * Mengecek apakah script injeksi perlu dijalankan
 */
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

/**
 * Jalankan inject.js ketika tab aktif berubah
 */
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

/**
 * Jalankan inject.js ketika halaman selesai dimuat
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && shouldTriggerPopup(tab.url)) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ["inject.js"],
    });
  }
});

/**
 * Listener pesan dari content script / extension lain
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "UPDATE_STATUS") {
    updateParticipantStatus();
  }
});

/**
 * Fungsi untuk memperbarui status peserta meeting (fungsi asli)
 */
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
        "Failed to update participant status: missing meetingCode or accessToken"
      );
      return;
    }

    updateStatusPayload.idUser = profile.id;

    await fetch(`${BE_ENDPOINT_V2}/meetings/update/${meetingCode}/participant`, {
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

/**
 * 🔴 Tambahan Baru:
 * Deteksi ketika tab ditutup, extension di-unload, atau user menutup browser
 * Lalu kirim status "offline" ke backend dashboard
 */
chrome.tabs.onRemoved.addListener(async (tabId, removeInfo) => {
  try {
    const persistedUserState = await chrome.storage.local.get("user-storage");
    if (!persistedUserState["user-storage"]) return;

    const userStorage = JSON.parse(persistedUserState["user-storage"]);
    const profile = userStorage.state.profile;
    const token = userStorage.state.accessToken;

    if (!profile?.id || !token) {
      console.warn("⚠️ No valid profile/token found when closing tab");
      return;
    }

    // Kirim status offline 🔴 ke backend
    await fetch(`${BE_ENDPOINT_V2}/status/update`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        userId: profile.id,
        status: "offline",
      }),
    });

    console.log("🔴 User set to offline (tab closed or browser exit)");
  } catch (err) {
    console.error("❌ Error handling tab close:", err);
  }
});

/**
 * Tambahan opsional:
 * Deteksi saat extension di-nonaktifkan atau ditutup (runtime unload)
 */
chrome.runtime.onSuspend.addListener(async () => {
  try {
    const persistedUserState = await chrome.storage.local.get("user-storage");
    if (!persistedUserState["user-storage"]) return;

    const userStorage = JSON.parse(persistedUserState["user-storage"]);
    const profile = userStorage.state.profile;
    const token = userStorage.state.accessToken;

    if (profile?.id && token) {
      await fetch(`${BE_ENDPOINT_V2}/status/update`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          userId: profile.id,
          status: "offline",
        }),
      });
      console.log("🔴 User status updated to offline on extension unload");
    }
  } catch (error) {
    console.error("❌ Failed to handle extension unload:", error);
  }
});
