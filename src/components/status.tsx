import { BE_ENDPOINT_V2 } from "@/constants";
import { useUserStore } from "@/store/user-store";
import { Info } from "lucide-react";
import React, { useEffect, useState } from "react";
import ActionTooltip from "./action-tooltip";

interface RecognitionProps {
  meetingCode: string;
}

const RecognitionStatus: React.FC<RecognitionProps> = ({ meetingCode }) => {
  const [selectedModel, setSelectedModel] = useState<string | null>(null);
  // const [isLoading, setIsLoading] = useState<boolean>(false);
  const { accessToken } = useUserStore();

  const getSelectedModel = async () => {
    // setIsLoading(true);
    try {
      const response = await fetch(`${BE_ENDPOINT_V2}/meetings/meet-code/${meetingCode}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const data = await response.json();
      setSelectedModel(data?.data.selectedRecognitionModel);

      // set to chrome storage
      await chrome.storage.sync.set({ selectedRecognitionModel: data?.data.selectedRecognitionModel });

      // setIsLoading(false);
    } catch (error) {
      console.error(error);
      // setIsLoading(false);
    }
  };


  useEffect(() => {
    getSelectedModel();
  }, []);

  console.log('selectedModel', selectedModel);
  const renderSelectedModel = () => {
    switch (selectedModel) {
      case "FACE_API":
        return "Face API js by Vincent Mühler";
      case "EMOVALARO":
        return "EmoValAro7 by Rangga Kalam";
      default:
        return "Class owner not selected a model";
    }
  }
  return (
    <>
    <div className="flex items-center space-x-2">
      <span className="font-semibold">Selected Recognition Model:</span>
      <span className="text-gray-700">{renderSelectedModel()}</span>
      <ActionTooltip label="
        Model used to recognize the emotion of the participants in the meeting and selected by your teacher.
      ">

      <Info size={16} />
      </ActionTooltip>
    </div>
    </>
  );
};

export default RecognitionStatus;