/* eslint-disable @typescript-eslint/no-explicit-any */
// user-store.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import axios from "axios";
import { chromeStorage } from "@/lib/chrome-storage";
import { BE_ENDPOINT_V2 } from "@/constants";
import { ProfileData } from "./recognition-store";
import { BaseResponse } from "@/lib/types";
import { toast } from "sonner";

// -----------------------------
// TIPE DATA
// -----------------------------
interface UserState {
  profile: ProfileData;
  accessToken: string;
  isLoading: boolean;
  error: string | null;
}

interface UserActions {
  setProfile: (profile: ProfileData) => void;
  setAccessToken: (token: string) => void;
  fetchProfile: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  reset: () => void;
}

const initialState: UserState = {
  profile: {} as ProfileData,
  accessToken: "",
  isLoading: false,
  error: null,
};

// -----------------------------
// FUNGSI BANTU UNTUK UPDATE STATUS BACKEND
// -----------------------------
async function updateUserStatus(userId: string, status: "online" | "offline", accessToken?: string) {
  try {
    await axios.post(
      `${BE_ENDPOINT_V2}/status/update`,
      { userId, status },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );
    console.log(`✅ Status user ${userId} updated to ${status}`);
  } catch (error) {
    console.error("❌ Failed to update user status:", error);
  }
}

// -----------------------------
// STORE UTAMA
// -----------------------------
export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setProfile: (profile) => set({ profile }),

      setAccessToken: (token) => set({ accessToken: token }),

      // Ambil profil user
      fetchProfile: async () => {
        const { accessToken } = get();
        if (!accessToken) return;

        set({ isLoading: true, error: null });

        try {
          const response = await axios.get<BaseResponse<ProfileData>>(
            `${BE_ENDPOINT_V2}/auth/profile`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            }
          );
          set({ profile: response.data.data, isLoading: false });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch profile";
          set({ error: errorMessage, isLoading: false });
          get().reset();
        }
      },

      // -----------------------------
      // LOGIN
      // -----------------------------
      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });

        try {
          const response = await axios.post(`${BE_ENDPOINT_V2}/auth/login`, {
            email,
            password,
          });

          toast.success("Login successful");

          const accessToken = response.data.access_token;
          set({ accessToken, isLoading: false });

          await get().fetchProfile();

          const { profile } = get();
          if (profile?.id) {
            // Kirim status online 🔵 ke backend
            await updateUserStatus(profile.id, "online", accessToken);
          }
        } catch (error: any) {
          console.log("error login", error.response?.data);
          toast.error(error.response?.data?.message || "Login failed");
          const errorMessage =
            error instanceof Error ? error.message : "Login failed";
          set({ error: errorMessage, isLoading: false });
        }
      },

      // -----------------------------
      // LOGOUT
      // -----------------------------
      logout: async () => {
        const { profile, accessToken } = get();

        // Kirim status offline 🔴 ke backend
        if (profile?.id) {
          await updateUserStatus(profile.id, "offline", accessToken);
        }

        // Hapus data lokal & state
        set(initialState);

        await chrome.storage.local.remove("user-storage");

        await chrome.storage.local.remove([
          "user-storage",
          "recognition-storage",
        ]);

        localStorage.removeItem("user-storage");
        sessionStorage.clear();

        // Hapus data dari Chrome sync
        await chrome.storage.sync.remove("meetingCode");
        await chrome.storage.sync.remove("isStart");
        await chrome.storage.sync.remove("isStartFacialIntervention");
        await chrome.storage.sync.remove("isStartTextIntervention");

        toast.success("Logout successful");
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: "user-storage",
      storage: createJSONStorage(() => chromeStorage),
    }
  )
);
