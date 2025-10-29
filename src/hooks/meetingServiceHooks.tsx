/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useCallback } from 'react';
import { useUserStore } from '@/store/user-store';
import { BE_ENDPOINT_V2 } from '@/constants';

export interface BaseResponse<T> {
  success: boolean
  message: string
  data: T
}

export interface Meeting {
  id: string
  meetingCode: string
  name: string
  subject: string
  description: string
  link: string
  isStarted: boolean
  isRecognitionStarted: boolean
  isRecognitionEnded: boolean
  isEnded: boolean
  startedAt: string
  createdAt: string
  updatedAt: string
  createdBy: string
  classId: string
  participants: any[]
}

export type MeetingData = BaseResponse<Meeting>


interface UseMeetingReturn {
  meeting: Meeting | null;
  isLoading: boolean;
  error: string | null;
  getMeetingByCode: (code: string) => Promise<MeetingData>;
  reset: () => void;
}

export const useMeeting = (): UseMeetingReturn => {
  const { accessToken } = useUserStore();
  
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reset = useCallback(() => {
    setMeeting(null);
    setError(null);
    setIsLoading(false);
  }, []);

  const getMeetingByCode = useCallback(async (meetingCode: string) => {
    if (!accessToken) {
      setError('No access token available');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `${BE_ENDPOINT_V2}/meetings/meet-code/${meetingCode}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(data)
      
      if (!data.data || !data.data[0]) {
        throw new Error('Meeting not found');
      }

      setMeeting(data);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch meeting');
      setMeeting(null);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken]);


  return {
    meeting,
    isLoading,
    error,
    getMeetingByCode,
    reset,
  };
};