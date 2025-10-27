/* eslint-disable @typescript-eslint/no-explicit-any */
import { Form, FormControl, FormField, FormItem, FormMessage } from '../ui/form'
import { UseFormReturn } from 'react-hook-form'
import { MeetingCodeSchema } from '@/App'
import { z } from 'zod'
import { Input } from '../ui/input'
import { Button } from '../ui/button'
import { useRecognitionStore } from '@/store/recognition-store'
import { useEffect, useRef, useState } from 'react'
import {  BE_ENDPOINT_V2 } from '@/constants'
import { AlertCircleIcon, CheckCircleIcon } from 'lucide-react'
import { useUserStore } from '@/store/user-store'
import axios from 'axios'

type Props = {
  form: UseFormReturn<z.infer<typeof MeetingCodeSchema>>
}

// Debounce function
function debounce(func: (...args: any[]) => void, wait: number) {
  let timeout: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export default function MeetingCodeForm({ form }: Props) {
  const { toggleSetMeetingCode } = useRecognitionStore()
  // const { getAccessTokenSilently } = useAuth0()
  const { accessToken, profile } = useUserStore()
  const [showAlertErrorMessage, setShowAlertErrorMessage] = useState(false)
  const [showAlertFoundMessage, setShowAlertFoundMessage] = useState(false)
  const [isPending, setIsPending] = useState(false)
  const handleEnterCodeFunc = async (data: z.infer<typeof MeetingCodeSchema>) => {
    const userId = profile.id
    console.log('payload', userId, data.meetingCode)
    // ADD Participant to Meeting
    await axios.patch(`${BE_ENDPOINT_V2}/meetings/add-participant`, {
      participantId: userId,
      meetingCode: data.meetingCode
    }, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      }
    }).then(res => {
      console.log(res.data)
    })

    // toggle
    toggleSetMeetingCode(data.meetingCode)
  }
  const debouncedSubmit = useRef(debounce(form.handleSubmit(handleEnterCodeFunc), 3000)).current

  // const getMeetingByEmoviewCode = async (emoviewCode: string) => {
  //   setIsPending(true)
  //   try {
  //     const token = await getAccessTokenSilently();
  //     const response = await fetch(`${BE_ENDPOINT}/meeting/class/meeting/${emoviewCode}`, {
  //       method: "GET",
  //       headers: {
  //         Authorization: `Bearer ${token}`,
  //       },
  //     });
  //     const data = await response.json();
  //     return data.data[0];
  //   } catch (error) {
  //     console.error(error);
  //   } finally {
  //     setIsPending(false)
  //   }
  // }


  const getMeetingByMeetingCode = async (meetCode: string) => {
    setIsPending(true)
    try {
      const response = await fetch(`${BE_ENDPOINT_V2}/meetings/meet-code/${meetCode}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();

      if (!data.success) {
        console.log('Meeting Code not found')
        setShowAlertErrorMessage(true)
        setShowAlertFoundMessage(false)
        return
      }
      setShowAlertErrorMessage(false)
      setShowAlertFoundMessage(true)
      // console.log(data.success)
      return data.data[0];
    } catch (error) {
      console.error(error);
    } finally {
      setIsPending(false)
    }
  }


  useEffect(() => {
    const subscription = form.watch(async (value) => {
      if (value.meetingCode) {
        // const getMeetingCode = await getMeetingByEmoviewCode(value.meetingCode)
         await getMeetingByMeetingCode(value.meetingCode)
        // if (!getMeetingCode ) {
        // if (!getMeetingCode2) {
        //   console.log('Meeting Code not found')
        //   setShowAlertErrorMessage(true)
        //   setShowAlertFoundMessage(false)
        //   return
        // }
        // setShowAlertErrorMessage(false)
        // setShowAlertFoundMessage(true)
      }
    })
    return () => subscription.unsubscribe()
  }, [form, debouncedSubmit])


  // const handleCheckMeetingCode = async (meetingCode: string) => {
  //   const getMeetingCode = await getMeetingByMeetingCode(meetingCode)
  //   console.log(getMeetingCode)
  //   if (!getMeetingCode) {
  //     console.log('Meeting Code not found')
  //     // setShowAlertErrorMessage(true)
  //     // setShowAlertFoundMessage(false)
  //     return
  //   }
  //   // setShowAlertErrorMessage(false)
  //   // setShowAlertFoundMessage(true)
  // }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleEnterCodeFunc)}
        className=" "
      >
        <FormField
          control={form.control}
          name="meetingCode"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Input
                  className="w-full"
                  placeholder="Meeting Code"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {showAlertFoundMessage && <p className="text-green-600 flex items-center gap-1 mt-2">
          <CheckCircleIcon size={16} />
          Meeting Code found. Click Join Meeting to continue.
        </p>}
        {showAlertErrorMessage && <p className="text-red-500 flex items-center gap-1 mt-2">
          <AlertCircleIcon size={16} /> Meeting Code not found. Check your code again or contact your meeting host.
        </p>}
        <Button
          disabled={showAlertErrorMessage || isPending}
          className="my-2 w-full 
          disabled:cursor-not-allowed
        " type="submit">
          {isPending ? 'Loading...' : 'Join Meeting'}
        </Button>
      </form>
    </Form>
  )
}