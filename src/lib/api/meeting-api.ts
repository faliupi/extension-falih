// src/lib/api/meeting-api.ts
import axios from "../axios-instance";
import { BE_ENDPOINT_V2 } from "@/constants";
import { useUserStore } from "@/store/user-store";

/**
 * Fungsi umum untuk update status user di dashboard.
 * Mengubah status menjadi "online" (🟢) atau "offline" (🔴).
 *
 * @param userId ID mahasiswa
 * @param status "online" | "offline"
 */
export async function updateUserStatus(userId: string, status: "online" | "offline") {
  try {
    const { accessToken } = useUserStore.getState();
    if (!accessToken) {
      console.warn("⚠️ No access token found, skipping status update");
      return;
    }

    const response = await axios.post(
      `${BE_ENDPOINT_V2}/status/update`,
      {
        userId,
        status,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    console.log(`✅ User ${userId} status updated to ${status}`);
    return response.data;
  } catch (error: any) {
    console.error("❌ Error updating user status:", error?.response || error);
    throw error;
  }
}

/**
 * Contoh fungsi lain (jika Anda punya fitur meeting)
 * Bisa tetap digunakan tanpa gangguan
 */
export async function updateMeetingParticipant(meetingCode: string, payload: any) {
  try {
    const { accessToken } = useUserStore.getState();
    if (!accessToken) {
      console.warn("⚠️ No access token found, cannot update meeting participant");
      return;
    }

    const response = await axios.patch(
      `${BE_ENDPOINT_V2}/meetings/update/${meetingCode}/participant`,
      payload,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error: any) {
    console.error("❌ Failed to update meeting participant:", error?.response || error);
    throw error;
  }
}
