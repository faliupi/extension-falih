/* eslint-disable react-hooks/exhaustive-deps */
// import viteLogo from "/vite.svg";
import "./App.css"
import { Button } from "./components/ui/button";
import { Switch } from "./components/ui/switch";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./components/ui/avatar";
import { Separator } from "./components/ui/separator";
import Spinner from "./components/spinner";
import { useRecognitionStore } from "./store/recognition-store";
import { capitalize } from "./lib/utils";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";


import { AlertCircle, ExternalLink, Info, LayoutGrid } from "lucide-react";
import { Dialog, DialogTrigger } from "./components/ui/dialog";
import FeedbackModalContent from "./components/modals/FeedbackModalContent";
import FacialMenuModalContent from "./components/modals/FacialMenuModalContent";
import { toast } from "sonner";
import FacialMenuMiniSurveyContent from "./components/modals/FacialMenuMiniSurveyContent";
import MeetingCodeForm from "./components/forms/MeetingCodeForm";
import { BE_ENDPOINT_V2, EMODU_WEB_URL } from "./constants";
import ActionTooltip from "./components/action-tooltip";
import { LoginForm } from "./components/login-form";
import { useUserStore } from "./store/user-store";
import { MeetingData } from "./hooks/meetingServiceHooks";
import RecognitionStatus from "./components/status";
import InterventionTextMiniSurveyContent from "./components/modals/InterventionTextMiniSurveyContent";

export const MeetingCodeSchema = z.object({
  meetingCode: z.string().min(6, {
    message: "Meeting code must be at least 6 characters. Ask your teacher for the code!",
  }),
});

function App() {
  const {
    meetingCode,
    setMeetingCode,
    toggleSetMeetingCode,
    isStart,
    isStartTextIntervention,
    isStartFacialIntervention,
    isStartOpenAiIntervention,
    isStartLlamaAiIntervention,
    isStartDrowsinessDetection,
    setUser,
    setMeetingNameStore,
    setMeetingSubject,
    user: userStore,
    toggleIsStart,
    toggleIsStartTextIntervention,
    toggleisStartFacialIntervention,
    toggleIsStartOpenAiIntervention,
    toggleIsStartLlamaAiIntervention,
    toggleIsStartDrowsinessDetection,
    reinforcementType,
    setReinforcementType,
    getMeetingCode,
    getIsStart,
    getIsStartTextIntervention,
    getIsStartFacialIntervention,
    getIsStartLlamaAiIntervention,
    getIsStartOpenAiIntervention,
    getIsStartDrowsinessDetection

  } = useRecognitionStore();

  const { profile: user, logout: logoutProfile, isLoading } = useUserStore()

  const [loading, setLoading] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [facialModalOpen, setFacialModalOpen] = useState(false);
  const [miniSurveyOpen, setMiniSurveyOpen] = useState(false);
  const [feedbackBody, setFeedbackBody] = useState("");
  const [meetingName, setMeetingName] = useState("");
  const [isRecognitionEnabled, setIsRecognitionEnabled] = useState(false);
  const [meetingLink, setMeetingLink] = useState("");
  const [isFetching, setIsFetching] = useState(false);
  const { accessToken } = useUserStore();

  // GET USER FOR AUTHENTICATION
  const isAuthenticated = user?.email;
  const form = useForm<z.infer<typeof MeetingCodeSchema>>({
    resolver: zodResolver(MeetingCodeSchema),
    defaultValues: {
      meetingCode: "",
    },
  });



  const getReinforcementType = async () => {
    const response = await fetch(`${BE_ENDPOINT_V2}/users/reinforcement-type`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    console.log('reinforcement', data);

    setReinforcementType(data.data);
    return data
  }


  const getMeetingByMeetingCode = async (meetCode: string) => {
    const response = await fetch(`${BE_ENDPOINT_V2}/meetings/meet-code/${meetCode}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    const data = await response.json();
    console.log(data);
    return data
  }

  useEffect(() => {
    if (isAuthenticated && user) {
      setLoading(true);

      getReinforcementType().then((res) => {
        console.log('reinforcement', res)
        setReinforcementType(res.data);
        setLoading(false);

      })
    }

  }, [isAuthenticated, reinforcementType]);


  useEffect(() => {
    const storeUserData = async () => {
      if (isAuthenticated) {
        // const token = await getAccessTokenSilently();
        // setUser(user as User, token);
      }
    };

    storeUserData()

    if (!meetingCode) {
      getMeetingCode();
    }

    if (!isStart) {
      getIsStart();
    }

    if (!isStartTextIntervention) {
      getIsStartTextIntervention();
    }

    if (!isStartFacialIntervention) {
      getIsStartFacialIntervention();
    }

    if (!isStartOpenAiIntervention) {
      getIsStartOpenAiIntervention();
    }

    if (!isStartLlamaAiIntervention) {
      getIsStartLlamaAiIntervention();
    }

    if(!isStartDrowsinessDetection) {
      getIsStartDrowsinessDetection();
    }



  }, [
    meetingCode,
    setMeetingCode,
    userStore,
    setUser,
    getMeetingCode,
    isAuthenticated,
    getIsStart,
    isStart,
    getIsStartTextIntervention,
    isStartTextIntervention,
    isStartOpenAiIntervention,
    isStartLlamaAiIntervention,
    isStartDrowsinessDetection,
    getIsStartOpenAiIntervention,
    getIsStartLlamaAiIntervention,
    getIsStartFacialIntervention,
  ]);

  const handleLeaveMeeting = () => {
    setMeetingCode("");
    setMeetingName("");
    toggleSetMeetingCode("");
  }

  const handleToggleIsStartTextIntervention = () => {
    toggleIsStartTextIntervention();
  }

  const handleToggleIsStartFacialIntervention = () => {
    if (!isStartFacialIntervention) {
      setMiniSurveyOpen(true);
    } else {
      setMiniSurveyOpen(false);

    }
    toggleisStartFacialIntervention();
  };

  const handleToggleIsStart = () => {
    toggleIsStart();
  };

  const handleToggleIsStartDrowsinessDetection = () => {
    toggleIsStartDrowsinessDetection();
  }

  const handleToggleIsStartOpenAiIntervention = () => {
    toggleIsStartOpenAiIntervention();
  }

  const handleToggleIsStartLlamaAiIntervention = () => {
    toggleIsStartLlamaAiIntervention();
  }

  const handleSendFeedback = async () => {
    setLoading(true);
    setTimeout(async () => {
      const response = await fetch(`${BE_ENDPOINT_V2}/feedback`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setFeedbackOpen(false);
        setFeedbackBody("");
        toast.success("Thank you for your feedback! 😁");
      }

      setLoading(false);
    }, 2000);
  };


  useEffect(() => {
    // get meeting by emoview code
    if (meetingCode) {
      setIsFetching(true)

      getMeetingByMeetingCode(meetingCode).then((res: MeetingData) => {
        console.log('res', res.data)
        setMeetingName(res.data.name);
        setMeetingLink(res.data.link);
        setIsRecognitionEnabled(res.data.isRecognitionStarted);
        setMeetingNameStore(res.data.name);
        setMeetingSubject(res.data.subject);

        setIsFetching(false);
      }).finally(() => {
        setIsFetching(false);
      })
    }

  }, [meetingCode]);


  useEffect(() => {
    if (isStartFacialIntervention) {
      setMiniSurveyOpen(false);
    }
  }, []);

  console.log('reinf', reinforcementType)


  return (
    <main className="px-5 py-3 ">
      {/* CEK AUTENTIKASI */}
      <div className="flex items-center justify-center  ">
        {!isAuthenticated && (
          <img src="/logo-green.png" className="w-6 mx-3 " alt="" />
        )}
        <h4 className="text-lg font-bold  ">
          Emodu for
          <span className="text-green-400 ml-1">Students</span>
        </h4>
      </div>

      {/* CEK JIKA MASIH FETCHING USER DATA DAN TIDAK TERAUTENTIKASI */}
      {isLoading && !isAuthenticated && (
        <Spinner className="w-10 h-10 mx-auto" />
      )}


      {/* MAIN MENU */}
      <div className="mt-3">
        {!isAuthenticated ? (
          <div>

            <LoginForm />
          </div>
        ) : (
          <div>
            {!meetingCode ? (
              <div className="">
                <MeetingCodeForm form={form} />
              </div>
            ) : (
              <>
                {/* INFO PROFILE */}
                <div className="flex my-2 ">
                  <Avatar>
                    <AvatarImage src={user?.avatar} alt="@shadcn" />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <div className="mx-3">
                    <div className="flex">
                      <h3 className="text-base font-semibold">
                        {/*{capitalize(role)}*/}
                        {capitalize(user?.fullname as string)}
                      </h3>
                    </div>
                    <p className="font-bold  text-gray-400"> {user?.email}</p>
                  </div>

                </div>

                {/* PROFILE BUTTON */}

                <div className="gap-2 w-full flex items-center ">
                  <Button
                    variant="secondary"
                    className="w-full flex items-center gap-2"
                    onClick={() => window.open(`${EMODU_WEB_URL}/dashboard`)}
                  >
                    Dashboard
                    <LayoutGrid className="w-3 h-3" />
                  </Button>


                </div>
                <div className="mt-2 flex items-center justify-between">

                  <RecognitionStatus meetingCode={meetingCode} />

                  {/* SELECTED REINFORCEMENT TYPE */}
                  {reinforcementType && reinforcementType !== 'NOT_SET' && (

                    <div className="">

                      <InterventionTextMiniSurveyContent setReinforcementType={setReinforcementType} title="Change Reinforcement Type" />

                    </div>
                  )}
                </div>


                {/* SELECTED MODEL */}
                {/* <SelectRecognitionModel /> */}

                <Separator className="my-3" />
                <div className="flex flex-col">
                  {/* meeting code and meeting name table */}
                  <div className="flex justify-between">
                    <div>
                      <h5 className="font-bold text-base">Meeting Code</h5>
                      <p className="text-slate-600">{meetingCode}</p>
                    </div>
                    <div>
                      <h5 className=" text-base flex gap-2">
                        <span className="font-bold">
                          Meeting Name
                        </span>

                        {!meetingName && (
                          <ActionTooltip label="
                          It might be you input wrong meeting code or something went wrong in our system
                        ">

                            <AlertCircle className="text-red-500 w-3" />
                          </ActionTooltip>

                        )}
                      </h5>
                      <p className="text-slate-600">
                        {isFetching ? <span>Fetching...</span> : (
                          meetingName ?
                            <a
                              href={meetingLink}
                              target="__blank"
                              className="flex font-medium text-blue-700"
                            >
                              <ExternalLink className="w-3 h-3" />

                              {meetingName}
                            </a>
                            : <span className="text-red-600 font-medium">Not found. Contact your teacher!</span>
                        )}
                      </p>
                    </div>
                    <div>
                      <ActionTooltip
                        className="right-0 "
                        label="
                          Recognition status is activate by your teacher
                        ">
                        <h5 className="font-bold text-base flex items-center gap-2">Recognition Status

                          <Info className="w-3 h-3" />
                        </h5>
                      </ActionTooltip>
                      <p className="text-slate-600">
                        {/* {(isStart || isStartTextIntervention || isStartFacialIntervention) ? <span className="bg-red-500 rounded-lg p-1 text-white animate-pulse">Recording...</span> : "Inactive"} */}
                        {isRecognitionEnabled ? <span className="bg-green-500 rounded-lg p-1 text-white ">Active</span> : "Inactive"}
                      </p>
                    </div>
                  </div>


                </div>

                <Separator className="my-3" />


                {/* {role !== "teacher" && (
                )} */}
                <>
                  {/* STUDENT INTERVENTION FEATURE */}

                  {loading ? <span>Fetching...</span> : (
                    // arcsData?.result !== undefined ? (
                    reinforcementType && reinforcementType !== 'NOT_SET' ? (

                      <div className="z">
                        <ActionTooltip
                          className="z-50"
                          label="Showing motivational messages when your emotions are not good 😔😡"
                        >
                          <h5 className="font-bold text-base cursor-default ">
                            Text Interventions 💬
                          </h5>
                        </ActionTooltip>
                        <div className="flex justify-between items-center">
                          <p className="text-slate-600">
                            Some messages might help you to feel better 🙌
                          </p>

                          <Switch
                            checked={isStartTextIntervention}
                            onCheckedChange={() => handleToggleIsStartTextIntervention()}
                            id="toggle-meeting" />

                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-3 items-center">
                        <ActionTooltip
                          className="z-50 w-full"
                          label="Help us to show best messages for you 😉">
                          <p className="text-slate-600">
                            Fill mini survey to use text interventions feature
                          </p>
                        </ActionTooltip>

                        <InterventionTextMiniSurveyContent setReinforcementType={setReinforcementType} />



                        {/* <ActionTooltip
                          className="z-50 w-full"
                          label="Help us to show best messages for you 😉">
                          <p className="text-slate-600">
                            Fill out your personality form to use text interventions feature
                          </p>
                        </ActionTooltip>

                        <Button
                          variant="outline"
                          className="w-full flex items-center gap-2"
                          // yg nika
                          onClick={() => window.open("https://forms.gle/cWeZztwyHCqeqdTf6")}

                        // // yg syifa
                        // onClick={() => window.open("https://forms.gle/JfQkPVhyfPb9Tjwg7")}
                        >
                          Form
                          <ExternalLink className="w-3 h-3" />
                        </Button> */}
                        {/*<Info className="w-3 h-3"/>*/}
                      </div>
                    )
                  )}

                  <Separator className="my-3" />
                  <div className="">
                    <ActionTooltip label="show your emotions data during meeting 📷📊">
                      <h5 className="font-bold text-base">OpenAI Intervention 🗨️</h5>
                    </ActionTooltip>
                    <ActionTooltip
                      side="top"
                      label="Please reload the page after switching on to apply changes">
                      <div className="flex  justify-between ">
                        <p className="text-slate-600">
                          Generate affective text by OpenAI
                        </p>
                        <Switch
                          checked={isStartOpenAiIntervention}
                          onCheckedChange={() => handleToggleIsStartOpenAiIntervention()}
                          id="toggle-meeting"
                        />
                      </div>
                    </ActionTooltip>
                  </div>
                  <Separator className="my-3" />
                  <div className="">
                    <ActionTooltip label="show your emotions data during meeting 📷📊">
                      <h5 className="font-bold text-base">Llama AI Intervention 🗨️</h5>
                    </ActionTooltip>
                    <ActionTooltip
                      side="top"
                      label="Please reload the page after switching on to apply changes">
                      <div className="flex  justify-between ">
                        <p className="text-slate-600">
                          Generate affective text by OpenAI
                        </p>
                        <Switch
                          checked={isStartLlamaAiIntervention}
                          onCheckedChange={() => handleToggleIsStartLlamaAiIntervention()}
                          id="toggle-meeting"
                        />
                      </div>
                    </ActionTooltip>
                  </div>


                  <Separator className="my-3" />

                  {/*PEDAGOGICAL AGENT*/}
                  <div className="z">
                    <ActionTooltip
                      className="z-50"
                      label="Showing related gif animations when your emotions are not good 😔😡"
                    >
                      <h5 className="font-bold text-base cursor-default ">
                        Facial Interventions 🧑‍🏫
                      </h5>
                    </ActionTooltip>
                    <div className="flex justify-between">
                      <span className="cursor-pointer text-slate-600">
                        <Dialog open={facialModalOpen}
                          onOpenChange={(isOpen) => setFacialModalOpen(isOpen)}
                        >
                          <DialogTrigger
                            onClick={() => setFacialModalOpen(true)}
                            className="cursor-pointer text-blue-500 hover:text-blue-600"
                          >
                            Click to Select Gender of Pedagogical Agent
                          </DialogTrigger>
                          <FacialMenuModalContent setFacialModalOpen={setFacialModalOpen} />

                        </Dialog>
                      </span>
                      {/* {isStartFacialIntervention ? <span className="text-green-500">Active</span> : <span className="text-red-500">Inactive</span>} */}
                      <div>

                        {/* {!isStartFacialIntervention ? (
                          ) : (
                            
                          )} */}
                        <span className="cursor-pointer text-slate-600">
                          <Dialog open={miniSurveyOpen}
                            onOpenChange={(isOpen) => setMiniSurveyOpen(isOpen)}
                          >
                            {/* <DialogTrigger
                                onClick={() => setMiniSurveyOpen(true)}
                                className="cursor-pointer text-blue-500 hover:text-blue-600"
                              >
                                Please take a mini survey before start
                              </DialogTrigger> */}
                            <FacialMenuMiniSurveyContent setMiniSurveyOpen={setMiniSurveyOpen} meetingCode={meetingCode} />


                          </Dialog>
                        </span>

                        <Switch
                          checked={isStartFacialIntervention}
                          onCheckedChange={() => {
                            // setMiniSurveyOpen(true);
                            handleToggleIsStartFacialIntervention()
                          }
                          }
                          id="toggle-meeting" />
                      </div>
                    </div>
                  </div>

                  <Separator className="my-3" />


                  {/* DROWSINESS DETECTOR FEATURE*/}
                  <div className="">
                    <ActionTooltip
                      label="Showing alert if you seem drowsy 💤🥱
                      "
                    >
                      <h5 className="font-bold text-base cursor-default">
                        Drowsiness Detector 💤
                      </h5>
                    </ActionTooltip>

                    <div className="flex  justify-between ">
                      <p className="text-slate-600">Grab some coffee ☕️</p>
                      <Switch
                        checked={isStartDrowsinessDetection}
                        onCheckedChange={() => handleToggleIsStartDrowsinessDetection()}
                        id="toggle-meeting"
                      />
                      {/* <span className="">
                        Coming Soon
                      </span> */}
                    </div>
                  </div>

                  <Separator className="my-3" />

                  {/* FITUR UTAMA / RECOGNITION */}
                  <div className="">
                    <ActionTooltip label="show your emotions data during meeting 📷📊">
                      <h5 className="font-bold text-base">Recognition 📷</h5>
                    </ActionTooltip>
                    <ActionTooltip
                      side="top"
                      label="Please reload the page after switching on to apply changes">
                      <div className="flex  justify-between ">
                        <p className="text-slate-600">
                          We are watching you 👀
                        </p>
                        <Switch
                          checked={isStart}
                          onCheckedChange={() => handleToggleIsStart()}
                          id="toggle-meeting"
                        />
                      </div>
                    </ActionTooltip>
                  </div>


                  <Separator className="my-3" />
                </>
              </>
            )}

            {/* LOGOUT BUTTON */}
            <div className="flex items-center flex-col gap-3 justify-center">
              {meetingCode && (

                <Button
                  onClick={() => handleLeaveMeeting()}
                  className="w-full"
                  variant="default"
                >
                  Leave Meeting
                </Button>
              )}
              <Button
                // onClick={() => handleLogout()}
                onClick={() => {
                  logoutProfile()
                }}
                className="w-full"
                variant="destructive"
              >
                Logout
              </Button>
              <span className="cursor-pointer">
                <Dialog open={feedbackOpen} onOpenChange={
                  (isOpen) => {
                    setFeedbackOpen(isOpen);
                    if (!isOpen) {
                      setFeedbackBody("");
                    }
                  }

                }>
                  <DialogTrigger
                    onClick={() => setFeedbackOpen(true)}
                    className="text-blue-500 hover:text-blue-600 cursor-pointer"
                  >
                    Give Feedback
                  </DialogTrigger>
                  <FeedbackModalContent
                    feedbackBody={feedbackBody}
                    setFeedbackBody={setFeedbackBody}
                    handleSendFeedback={handleSendFeedback}
                    loading={loading}
                  />

                </Dialog>
              </span>
              <span className="text-gray-500">
                Copyright © 2024 Human Centered Engineering RPL UPI
              </span>
            </div>

          </div>
        )}
      </div>
    </main >
  );
}

export default App;
