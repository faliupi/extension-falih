

import { useState } from 'react';
import { toast } from 'sonner';
import { DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useAuth0 } from '@auth0/auth0-react';
import { BE_ENDPOINT } from '@/constants';

interface FacialMenuMiniSurveyContentProps {
  setMiniSurveyOpen: (value: boolean) => void;
  meetingCode: string;
}

// interface Payload {

// }
type CheckboxState = {
  "Suasana tidak kondusif": boolean;
  "Pencahayaan tidak mendukung": boolean;
  "Koneksi internet bermasalah": boolean;
};
const FacialMenuMiniSurveyContent = ({ setMiniSurveyOpen, meetingCode }: FacialMenuMiniSurveyContentProps) => {
  const { user, getAccessTokenSilently } = useAuth0();

  const [currentStep, setCurrentStep] = useState(0);
  const [checkboxState, setCheckboxState] = useState<CheckboxState>({
    "Suasana tidak kondusif": false,
    "Pencahayaan tidak mendukung": false,
    "Koneksi internet bermasalah": false
  });
  const [inputValue, setInputValue] = useState('');
  const [emotions, setEmotions] = useState("");
  const [environtmentSupport, setenvirontmentSupport] = useState("");



  const { name, email, picture, sub } = user || {};

  const nextStep = () => {
    setCurrentStep((prevStep) => prevStep + 1);
  };

  const prevStep = () => {
    setCurrentStep((prevStep) => prevStep - 1);
  };

  const handleSelectEmotion = (emotion: string) => {
    setEmotions(emotion);
    toast.success(`You have selected ${emotion} emotion!`);
    nextStep();
  }

  const handleSelectenvirontment = (environtment: string) => {
    if (environtment === "Tidak") {
      // setenvirontments([...environtments, environtment]);
      // setenvirontments([environtment]);
      setenvirontmentSupport(environtment);
      toast.error(`You have selected ${environtment} environtment!`);
      return nextStep();
    }

    // setenvirontments([...environtments, environtment]);
    setenvirontmentSupport(environtment);
    toast.success(`You have selected ${environtment} environtment!`);
    handleSubmit();
    // nextStep();
  }
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    setCheckboxState((prevState) => ({
      ...prevState,
      [name]: checked,
    }));
  };
  const questions = [
    // FIRST STEP
    <div>
      <p>
        Sebelum menggunakan fitur ini, kami harap kamu dapat mengisi survey singkat ini.
      </p>
      <p>
        Apakah kamu bersedia mengisi survey ini?
      </p>

      <div className="flex gap-5 items-center justify-center">
        <button
          onClick={nextStep}
          className="cursor-pointer flex flex-col items-center p-5 gap-2 border-4 border-transparent hover:border-4 hover:border-blue-500 hover:shadow-lg w md:w-full">
          <p className="text-2xl">
            {/* smile */}
            😀
          </p>
          <span className="font-bold text-2xl">Ya</span>
        </button>
        <button
          onClick={() => setMiniSurveyOpen(false)}
          className="cursor-pointer flex flex-col items-center p-5 gap-2 border-4 border-transparent hover:border-4 hover:border-blue-500 hover:shadow-lg w md:w-full">
          <p className="text-2xl">
            {/* sad */}
            😢
          </p>
          <span className="font-bold text-2xl">Tidak</span>
        </button>
      </div>
    </div>,

    //WELCOME MESSAGE
    <div>
      <p className="text-lg text-gray-800">Hi {name},</p>
      <p className="mt-2 text-base text-gray-600">Terima kasih telah berpartisipasi dalam survey ini.</p>
      <p className="mt-2 text-base text-gray-600">Survey ini akan membantu kami untuk memahami kondisi emosi dan lingkungan belajar kamu saat ini.</p>
      <p className="mt-2 text-base text-gray-600">Silahkan jawab pertanyaan berikut ini.</p>
      <p className="mt-4 font-semibold text-lg text-gray-800">Let's start!</p>
      <Button onClick={nextStep} className="w-full bg-blue-500 hover:bg-blue-700 text-white p-2 rounded mx-auto mt-4">Start</Button>
    </div>,
    // QUESTION NO 1
    <div>
      <p>Manakah yang mewakili emosimu saat ini berdasarkan ekspresi di bawah ini?</p>
      <div className="flex gap-5 items-center justify-center">
        <div className="flex  gap-5 items-center justify-center">
          <button
            onClick={() => handleSelectEmotion("Senang")}
            className="cursor-pointer flex flex-col items-center p-5 gap-2 border-4 border-transparent hover:border-4 hover:border-blue-500 hover:shadow-lg w md:w-full">
            {/* <p className="text-2xl">😀</p> */}
            <img src="/Happy.gif" alt="" />
            <span className="font-bold text-lg">Senang</span>
          </button>
          <button
            onClick={() => handleSelectEmotion("Sedih")}
            className="cursor-pointer flex flex-col items-center p-5 gap-2 border-4 border-transparent hover:border-4 hover:border-blue-500 hover:shadow-lg w md:w-full">
            {/* <p className="text-2xl">😢</p> */}
            <img src="/Sad.gif" alt="" />
            <span className="font-bold text-lg">Sedih</span>
          </button>
          <button
            onClick={() => handleSelectEmotion("Netral")}
            className="cursor-pointer flex flex-col items-center p-5 gap-2 border-4 border-transparent hover:border-4 hover:border-blue-500 hover:shadow-lg w md:w-full">
            {/* <p className="text-2xl">😐</p> */}
            <img src="/Neutral.gif" alt="" />
            <span className="font-bold text-lg">Netral</span>
          </button>
        </div>
      </div>
    </div>,
    // QUESTION NO 2
    <div>
      <p>Apakah kondisi lingkunganmu mendukung untuk melakukan pembelajaran sinkronis secara daring?</p>
      <div className="flex gap-5 items-center justify-center">
        <button
          onClick={() => handleSelectenvirontment("Ya")}
          className="cursor-pointer flex flex-col items-center p-5 gap-2 border-4 border-transparent hover:border-4 hover:border-blue-500 hover:shadow-lg w md:w-full">
          <p className="text-2xl">👍</p>
          <span className="font-bold text-2xl">Ya</span>
        </button>
        <button
          onClick={() => handleSelectenvirontment("Tidak")}
          className="cursor-pointer flex flex-col items-center p-5 gap-2 border-4 border-transparent hover:border-4 hover:border-blue-500 hover:shadow-lg w md:w-full">
          <p className="text-2xl">👎</p>
          <span className="font-bold text-2xl">Tidak</span>
        </button>
      </div>
    </div>,

    // QUESTION NO 3
    <div>
      <h1
        className="text-base font-medium text-gray-800 mb-4"
      >
        Apa alasan kamu memilih kondisi lingkunganmu tidak mendukung untuk melakukan Pembelajaran sinkronis secara daring?
      </h1>
      <div className="bg-gray-100 p-6 rounded-lg shadow">

        <div className="mb-4">
          <label className="flex items-center space-x-3">
            <input type="checkbox" name="Suasana tidak kondusif" checked={checkboxState["Suasana tidak kondusif"]} onChange={handleCheckboxChange} className="form-checkbox h-5 w-5 text-blue-600" />
            <span className="text-gray-700">Suasana tidak kondusif</span>
          </label>
        </div>
        <div className="mb-4">
          <label className="flex items-center space-x-3">
            <input type="checkbox" name="Pencahayaan tidak mendukung" checked={checkboxState["Pencahayaan tidak mendukung"]} onChange={handleCheckboxChange} className="form-checkbox h-5 w-5 text-blue-600" />
            <span className="text-gray-700">Pencahayaan tidak mendukung</span>
          </label>
        </div>
        <div className="mb-4">
          <label className="flex items-center space-x-3">
            <input type="checkbox" name="Koneksi internet bermasalah" checked={checkboxState['Koneksi internet bermasalah']} onChange={handleCheckboxChange} className="form-checkbox h-5 w-5 text-blue-600" />
            <span className="text-gray-700">Koneksi internet bermasalah</span>
          </label>
        </div>
        <div className='mt-3'>  
          {/* <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Your input here" className="form-input mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50" /> */}
          <label
            className="block text-sm font-medium text-gray-700"
            htmlFor="">
            Alasan lainnya:
          </label>
          <Input value={inputValue} onChange={(e) => setInputValue(e.target.value)} placeholder="Alasan lainnya" />
        </div>
      </div>
    </div>
  ];

  const handleSubmit = async () => {
    const token = await getAccessTokenSilently();
    const payload = {
      emotions,
      environtmentSupport,
      reasons: Object.keys(checkboxState).filter((key: string) => checkboxState[key as keyof CheckboxState]),
      otherReason: inputValue,
      meetingCode,
      // meetingId: `,
      user: {
        name,
        email,
        picture,
        sub
      },
      timestamp: new Date().toISOString()
    }

    const response = await fetch(`${BE_ENDPOINT}/mini-survey`, {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      setCurrentStep(0);
      setEmotions("");
      setenvirontmentSupport("");
      setCheckboxState({
        "Suasana tidak kondusif": false,
        "Pencahayaan tidak mendukung": false,
        "Koneksi internet bermasalah": false
      });
      setInputValue("");

      toast.error('Gagal mengirim data survey!');
      return;
    }

    console.log(payload)
    // clean up state after submit
    setCurrentStep(0);
    setEmotions("");
    setenvirontmentSupport("");
    setCheckboxState({
      "Suasana tidak kondusif": false,
      "Pencahayaan tidak mendukung": false,
      "Koneksi internet bermasalah": false
    });
    setInputValue("");
    // go back to first step
    toast.success('Survey berhasil diisi!');
    setMiniSurveyOpen(false);
  }

  return (
    <DialogContent className="rounded-lg mx-auto">
      <DialogHeader>
        <DialogTitle>Mini Survey</DialogTitle>
      </DialogHeader>

      <div>
        {questions[currentStep]}
      </div>

      <div className="flex flex-col gap-2 items-center justify-between mt-4">

        {currentStep === 4 && (
          <Button onClick={handleSubmit} className=" w-full text-white p-2 rounded mx-auto">Submit</Button>
        )}
        {currentStep > 0 && (
          <Button onClick={prevStep} variant={'outline'} className=" w-full  p-2 rounded mx-auto">Previous</Button>
        )}
      </div>
    </DialogContent>
  );
};

export default FacialMenuMiniSurveyContent;