/* eslint-disable @typescript-eslint/no-unused-vars */
import { BaseResponse } from "@/lib/types"

export interface Data {
  id: string
  email: string
  fullname: string
  avatar: string
  isVerified: boolean
  verificationToken: string
  createdAt: string
  updatedAt: string
}

type GetProfileResponse = BaseResponse<Data>


import { useState, useEffect, useCallback } from 'react';
import { AxiosError } from 'axios';
import apiClient from "@/lib/axios-instance"

// interface GetProfileResponse {
//   success: boolean;
//   message: string;
//   data: {
//     id: string;
//     name: string;
//     email: string;
//     // ... other profile fields
//   };
// }

interface ProfileState {
  data: GetProfileResponse | null;
  isLoading: boolean;
  error: Error | null;
  isRefetching: boolean;
}

export const useGetProfile = (options = { enableAutoFetch: true }) => {
  const [state, setState] = useState<ProfileState>({
    data: null,
    isLoading: true,
    error: null,
    isRefetching: false,
  });

  const fetchProfile = useCallback(async (isRefetching = false) => {
    setState(prev => ({
      ...prev,
      isLoading: !isRefetching,
      isRefetching: isRefetching,
      error: null,
    }));

    try {
      const response = await apiClient.get<GetProfileResponse>('/auth/profile');

      setState(() => ({
        data: response.data,
        isLoading: false,
        isRefetching: false,
        error: null,
      }));

      return response.data;
    } catch (error) {
      const errorMessage = error instanceof AxiosError 
        ? error.response?.data?.message || error.message
        : 'Failed to fetch profile';

      setState(prev => ({
        ...prev,
        isLoading: false,
        isRefetching: false,
        error: new Error(errorMessage),
      }));

      throw error;
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    if (options.enableAutoFetch) {
      fetchProfile();
    }
  }, [fetchProfile, options.enableAutoFetch]);

  // Manual refetch with Promise return
  const refetch = async () => {
    return fetchProfile(true);
  };

  // Manual fetch (if autoFetch is disabled)
  const fetch = async () => {
    return fetchProfile(false);
  };

  return {
    ...state,
    refetch,
    fetch,
  };
};