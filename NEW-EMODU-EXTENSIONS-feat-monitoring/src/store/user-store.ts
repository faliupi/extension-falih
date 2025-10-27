/* eslint-disable @typescript-eslint/no-explicit-any */
// user-store.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import axios from 'axios';
import { chromeStorage } from '@/lib/chrome-storage';
import { BE_ENDPOINT_V2 } from '@/constants';
import { ProfileData } from './recognition-store';
import { BaseResponse } from '@/lib/types';
import { toast } from 'sonner';

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
  logout: () => void;
  reset: () => void;
}

const initialState: UserState = {
  profile: {} as ProfileData,
  accessToken: "",
  isLoading: false,
  error: null,
};

export const useUserStore = create<UserState & UserActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      setProfile: (profile) => set({ profile }),
      
      setAccessToken: (token) => set({ accessToken: token }),
      
      fetchProfile: async () => {
        const { accessToken } = get();
        if (!accessToken) return;

        set({ isLoading: true, error: null });
        
        try {
          const response = await axios.get<BaseResponse<ProfileData>>(
            `${BE_ENDPOINT_V2}/auth/profile`,
            {
              headers: {
                Authorization: `Bearer ${accessToken}`
              }
            }
          );
          set({ profile: response.data.data, isLoading: false });
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to fetch profile';
          set({ error: errorMessage, isLoading: false });
          get().reset();
        }
      },

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        
        try {
          const response = await axios.post(`${BE_ENDPOINT_V2}/auth/login`, {
            email,
            password
          });

          toast.success('Login successful');          
          set({ accessToken: response.data.access_token, isLoading: false });
          await get().fetchProfile();
        } catch (error:any) {
          console.log('error login', error.response.data);
          toast.error(error.response.data.message)
          const errorMessage = error instanceof Error ? error.message : 'Login failed';
          set({ error: errorMessage, isLoading: false });
        }
      },

      logout: async() => {
        // get().reset();
        // set({ accessToken: "" });
        // set({ profile: {} as ProfileData });  
         // First, clear the state
         set(initialState);
          
         // Clear persisted data from chrome.storage
         await chrome.storage.local.remove('user-storage');
         
         // If you have other related storage keys, clear them too
         // For example, if you have other stores that should be cleared on logout
         await chrome.storage.local.remove([
           'user-storage',
           'recognition-storage',
           // Add any other storage keys that should be cleared
         ]);

         // Optional: Clear any session/local storage if you're using them
         localStorage.removeItem('user-storage');
         sessionStorage.clear();

        //  delete store from chrome storage
        await chrome.storage.sync.remove('meetingCode')
        await chrome.storage.sync.remove('isStart')
        await chrome.storage.sync.remove('isStartFacialIntervention')
        await chrome.storage.sync.remove('isStartTextIntervention')
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => chromeStorage),
    }
  )
);