/* eslint-disable @typescript-eslint/no-unused-vars */
import { create } from "zustand";
import { ARCSType, User } from "@/types";

export interface BaseResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ProfileData {
  id: string;
  email: string;
  fullname: string;
  avatar: string;
  isVerified: boolean;
  verificationToken: string;
  createdAt: string;
  updatedAt: string;
}

export enum SelectedModel {
  FaceAPI = "0",
  EmoValAro7 = "1",
}

type State = {
  selectedModel: string;
  user: User;
  // profile: ProfileData;
  accessToken: string;
  arcsData: ARCSType;
  reinforcementType: string;
  isStart: boolean;
  isStartTextIntervention: boolean;
  isStartFacialIntervention: boolean;
  isStartOpenAiIntervention: boolean;
  isStartLlamaAiIntervention: boolean;
  isStartDrowsinessDetection: boolean;
  isMeetingCode: boolean;
  isAuthenticated: boolean;
  meetingCode: string;
  meetingNameStore: string;
  meetingSubject: string;
  getSelectedModel: () => Promise<string | undefined>;
  getMeetingCode: () => Promise<string | undefined>;
  getIsStart: () => Promise<boolean | undefined>;
  getIsStartTextIntervention: () => Promise<boolean | undefined>;
  getIsStartFacialIntervention: () => Promise<boolean | undefined>;
  getIsStartOpenAiIntervention: () => Promise<boolean | undefined>;
  getIsStartLlamaAiIntervention: () => Promise<boolean | undefined>;
  getIsStartDrowsinessDetection: () => Promise<boolean | undefined>;
  isSocketConnected: boolean;
};

/**
 * Action merupakan interface yang berisi fungsi-fungsi yang akan digunakan
 */
type Action = {
  setSelectedModel: (param: string) => void;
  toggleSetMeetingCode: (param: string) => void;
  toggleIsStart: () => void;
  toggleIsStartTextIntervention: () => void;
  toggleisStartFacialIntervention: () => void;
  toggleIsStartOpenAiIntervention: () => void;
  toggleIsStartLlamaAiIntervention: () => void;
  toggleIsStartDrowsinessDetection: () => void;
  setMeetingCode: (param: string) => void;
  setMeetingNameStore: (param: string) => void;
  setMeetingSubject: (param: string) => void;
  setUser: (user: User, token: string) => void;
  // setProfile: (profile: ProfileData) => void;
  setAccessToken: (token: string) => void;
  setIsAuthenticated: (param: boolean) => void;
  setARCSData: (arcsData: ARCSType) => void;
  setReinforcementType: (param: string) => void;
  logout: () => void;
  setIsStart: (param: boolean) => void;
  setIsSocketConnected: (param: boolean) => void;
};
export const useRecognitionStore = create<State & Action>((set, get) => ({
  /**
   * Initial state
   *
   * inisialisasi state awal yang akan digunakan
   * silahkan tambahkan state yang dibutuhkan jika ada fitur baru
   */
  selectedModel: "",
  user: {} as User,
  // profile: {} as ProfileData,
  accessToken: "",
  isAuthenticated: false,
  arcsData: {} as ARCSType,
  reinforcementType: "",
  isStart: false,
  isStartTextIntervention: false,
  isStartFacialIntervention: false,
  isStartOpenAiIntervention: false,
  isStartLlamaAiIntervention: false,
  isStartDrowsinessDetection: false,
  isMeetingCode: false,
  meetingCode: "",
  meetingNameStore: "",
  meetingSubject: "",
  isSocketConnected: false,

  setSelectedModel: async (selectedModel: string) => {
    set({ selectedModel });
    await chrome.storage.sync.set({ selectedModel });
    const result = await chrome.storage.sync.get("selectedModel");
    console.log(result);
  },

  getSelectedModel: async () => {
    const result = await chrome.storage.sync.get("selectedModel");
    console.log(result);

    set({ selectedModel: result.selectedModel });

    return result.selectedModel;
  },

  /**
   * Fungsi untuk mengambil data meeting code dari storage
   * @returns meetingCode
   */
  getMeetingCode: async () => {
    const result = await chrome.storage.sync.get("meetingCode");
    console.log(result);

    set({ meetingCode: result.meetingCode });

    return result.meetingCode;
  },

  /**
   * Fungsi untuk mengambil data isStart dari storage
   * @returns isStart
   */
  getIsStart: async () => {
    const result = await chrome.storage.sync.get("isStart");
    console.log(result);

    set({ isStart: result.isStart });

    return result.isStart;
  },

  /**
   * Fungsi untuk mengambil data isStartTextIntervention dari storage
   * @returns isStartTextIntervention
   */
  getIsStartTextIntervention: async () => {
    const result = await chrome.storage.sync.get("isStartTextIntervention");
    console.log(result);

    set({ isStartTextIntervention: result.isStartTextIntervention });

    return result.isStartTextIntervention;
  },

  /**
   * Fungsi untuk mengambil data isStartFacialIntervention dari storage
   * @returns isStartFacialIntervention
   */
  getIsStartFacialIntervention: async () => {
    const result = await chrome.storage.sync.get("isStartFacialIntervention");
    console.log(result);

    set({ isStartFacialIntervention: result.isStartFacialIntervention });

    return result.isStartFacialIntervention;
  },

  getIsStartOpenAiIntervention: async () => {
    const result = await chrome.storage.sync.get("isStartOpenAiIntervention");
    console.log(result);

    set({ isStartOpenAiIntervention: result.isStartOpenAiIntervention });

    return result.isStartOpenAiIntervention;
  },

  getIsStartLlamaAiIntervention: async () => {
    const result = await chrome.storage.sync.get("isStartLlamaAiIntervention");
    console.log(result);

    set({ isStartLlamaAiIntervention: result.isStartLlamaAiIntervention });

    return result.isStartLlamaAiIntervention;
  },

  getIsStartDrowsinessDetection: async () => {
    const result = await chrome.storage.sync.get("isStartDrowsinessDetection");
    console.log(result);

    set({ isStartDrowsinessDetection: result.isStartDrowsinessDetection });

    return result.isStartDrowsinessDetection;
  },

  /**
   * Fungsi untuk menyimpan data user ke storage
   * @param user, token
   */
  setUser: async (user: User, token: string) => {
    set({ user });
    await chrome.storage.sync.set({
      user: {
        ...user,
        fullname: user.name,
        authId: user.sub,
        userId: user["https://customclaim.com/id"],
        token: token,
      },
    });
    const result = await chrome.storage.sync.get();
    console.log(result);
  },

  // setProfile: async (profile: ProfileData) => {
  //   set({ profile });
  //   await chrome.storage.sync.set({ profile });
  //   const result = await chrome.storage.sync.get();

  //   console.log(result);
  // },

  setIsAuthenticated: async () => {},
  setAccessToken: async (token: string) => {
    set({ accessToken: token });
    await chrome.storage.sync.set({ accessToken: token });
    const result = await chrome.storage.sync.get();
    console.log(result);
  },

  /**
   * Fungsi untuk menyimpan data arcsData ke storage
   * @param arcsData
   */
  setARCSData: async (arcsData: ARCSType) => {
    set({ arcsData });
    await chrome.storage.sync.set({ arcsData });
    const result = await chrome.storage.sync.get();
    console.log(result);
  },

  setReinforcementType: async (reinforcementType: string) => {
    set({ reinforcementType });
    await chrome.storage.sync.set({ reinforcementType });
    const result = await chrome.storage.sync.get();
    console.log(result);
  },
  // setIsStart: (isStart: boolean) => set({ isStart }),
  setIsMeetingCode: (isMeetingCode: boolean) => set({ isMeetingCode }),
  setMeetingCode: (meetingCode: string) => set({ meetingCode }),
  setMeetingNameStore: async (meetingName: string) => {
    set({ meetingNameStore: meetingName });
    await chrome.storage.sync.set({ meetingName });
    const result = await chrome.storage.sync.get("meetingName");
    console.log(result);
  },
  setMeetingSubject: (meetingSubject: string) => {
    set({ meetingSubject });
    chrome.storage.sync.set({ meetingSubject });
    const result = chrome.storage.sync.get("meetingSubject");
    console.log(result);
  },

  setIsStart: async (isStart: boolean) => set({ isStart }),

  // typed
  toggleSetMeetingCode: async (meetingCode: string) => {
    const isMeetingCode = !get().isMeetingCode;
    set({ isMeetingCode, meetingCode });
    await chrome.storage.sync.set({ meetingCode });
    const result = await chrome.storage.sync.get("meetingCode");
    console.log(result);
  },

  toggleIsStart: async () => {
    const isStart = !get().isStart;
    set({ isStart });
    await chrome.storage.sync.set({ isStart });
    const result = await chrome.storage.sync.get("isStart");
    console.log(`isStart: ${result.isStart}`);
  },

  toggleIsStartTextIntervention: async () => {
    const isStartTextIntervention = !get().isStartTextIntervention;
    set({ isStartTextIntervention });
    await chrome.storage.sync.set({ isStartTextIntervention });
    const result = await chrome.storage.sync.get("isStartTextIntervention");
    console.log(`isStartTextIntervention: ${result.isStartTextIntervention}`);
  },

  toggleisStartFacialIntervention: async () => {
    const isStartFacialIntervention = !get().isStartFacialIntervention;
    set({ isStartFacialIntervention });
    await chrome.storage.sync.set({ isStartFacialIntervention });
    const result = await chrome.storage.sync.get("isStartFacialIntervention");
    console.log(
      `isStartFacialIntervention: ${result.isStartFacialIntervention}`
    );
  },

  toggleIsStartOpenAiIntervention: async () => {
    const isStartOpenAiIntervention = !get().isStartOpenAiIntervention;
    set({ isStartOpenAiIntervention });
    await chrome.storage.sync.set({ isStartOpenAiIntervention });
    const result = await chrome.storage.sync.get("isStartOpenAiIntervention");
    console.log(
      `isStartOpenAiIntervention: ${result.isStartOpenAiIntervention}`
    );
  },

  toggleIsStartLlamaAiIntervention: async () => {
    const isStartLlamaAiIntervention = !get().isStartLlamaAiIntervention;
    set({ isStartLlamaAiIntervention });
    await chrome.storage.sync.set({ isStartLlamaAiIntervention });
    const result = await chrome.storage.sync.get("isStartLlamaAiIntervention");
    console.log(
      `isStartLlamaAiIntervention: ${result.isStartLlamaAiIntervention}`
    );
  },
  toggleIsStartDrowsinessDetection: async () => {
    const isStartDrowsinessDetection = !get().isStartDrowsinessDetection;
    set({ isStartDrowsinessDetection });
    await chrome.storage.sync.set({ isStartDrowsinessDetection });
    const result = await chrome.storage.sync.get("isStartDrowsinessDetection");
    console.log(
      `isStartDrowsinessDetection: ${result.isStartDrowsinessDetection}`
    );
  },

  login: async () => {
    const result = await chrome.storage.sync.get("user");
    console.log(result);
    set({ user: result.user });
  },
  logout: async () => {
    set({ user: {} as User });
    await chrome.storage.sync.set({
      user: {} as User,
      isStart: false,
      meetingCode: "",
      arcsData: {} as ARCSType,
    });
    const result = await chrome.storage.sync.get();
    console.log(result);
  },
  setIsSocketConnected: (isSocketConnected: boolean) =>
    set({ isSocketConnected }),
}));
