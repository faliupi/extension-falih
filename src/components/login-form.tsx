// import Link from "next/link"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Form, FormControl,  FormField, FormItem, FormLabel, FormMessage } from "./ui/form"
// import { useRecognitionStore } from "@/store/recognition-store"
// import {  useState } from "react"
import { useUserStore } from "@/store/user-store"
// import { useState } from "react"

const FormSchema = z.object({
  email: z.string().min(2, {
    message: "Email must be at least 2 characters.",
  }).email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(2)
})
export function LoginForm() {
  const { login, isLoading } = useUserStore();

  // const [isLoading, setIsLoading] = useState(false)
  // const [storedAccessToken, setStoredAccessToken] = useState<string | null>(null)
  // const {
  //   // setProfile,
  //   accessToken,
  //   // setAccessToken
  // } = useRecognitionStore()
  // const fetchData = useCallback(async () => {
  //   try {
  //     const response = await axios.get<BaseResponse<ProfileData>>('http://localhost:8080/api/v2/auth/profile',{
  //       headers: {
  //         Authorization: `Bearer ${accessToken}`
  //       }
  //     });
  //     console.log(response.data.data)

  //     setProfile(response.data.data)
     
  //   } catch (err) {
  //     const axiosError = err as ErrorResponse;
  //     // setError(axiosError.message || 'An error occurred');
  //     console.log(axiosError.message)
  //   }
  // }, [accessToken])
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(data: z.infer<typeof FormSchema>) {
    console.log(data)
    // setIsLoading(true)

    // await login(data.email, data.password).then((res) => {
    //   console.log('res', res)
    //   setIsLoading(false)
    // }).catch((err) => {
    //   console.log('err', err)
    //   setIsLoading(false)
    // })

     await login(data.email, data.password)

    // console.log(res)
  }

  // console.log(accessToken)
  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">Login</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className=" space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="hce@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="*****"  {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full">
              {isLoading ? "Loading..." : "Login"}
            </Button>
          </form>
        </Form>
        {/* <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="m@example.com"
              required
            />
          </div>
          <div className="grid gap-2">
            <div className="flex items-center">
              <Label htmlFor="password">Password</Label>
              <Link href="#" className="ml-auto inline-block text-sm underline">
                Forgot your password?
              </Link>
            </div>
            <Input id="password" type="password" required />
          </div>
          <Button type="submit" className="w-full">
            Login
          </Button>
          <Button variant="outline" className="w-full">
            Login with Google
          </Button>
        </div>
        <div className="mt-4 text-center text-sm">
          Don&apos;t have an account?{" "}
          <Link href="#" className="underline">
            Sign up
          </Link>
        </div> */}
      </CardContent>
    </Card>
  )
}
