import { toast } from 'sonner';
import { DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'


enum Agent {
  FEMALE = 'female',
  MALE = 'male'
}

interface FacialMenuModalContentProps {
  setFacialModalOpen: (value: boolean) => void;

}


const FacialMenuModalContent = ({ setFacialModalOpen}:FacialMenuModalContentProps) => {
  
  const handleChooseAgent = async(selectedAgent: string) => {
    console.log('Agent Selected:', selectedAgent)

    // set to chrome storage state 
    await chrome.storage.sync.set({ agent: selectedAgent });

    // close modal
    setFacialModalOpen(false);
    toast.success(`You have selected ${selectedAgent} agent!`);

  }

  return (
    <DialogContent className="rounded-lg mx-auto">
      <DialogHeader>
        <DialogTitle>Select your Agent
        </DialogTitle>
      </DialogHeader>
      <div className="flex items-center mx-auto justify-center   gap-5 ">
      <button onClick={() => handleChooseAgent(Agent.MALE)} className="cursor-pointer flex flex-col items-center p-10 gap-2 border-4 border-transparent hover:border-4 hover:border-blue-500 hover:shadow-lg w md:w-full">
          <p className="text-7xl">👨</p>
          <span className="font-bold text-2xl">Male</span>
        </button>
        <span className='text-xl'>Or</span>
        <button onClick={() => handleChooseAgent(Agent.FEMALE)} className="cursor-pointer flex flex-col items-center p-10 gap-2 border-4 border-transparent hover:border-4 hover:border-blue-500 hover:shadow-lg md:w-full">
          <p className="text-7xl">👩</p>
          <span className="font-bold text-2xl">Female</span>
        </button>
      </div>

    </DialogContent>

  )
}

export default FacialMenuModalContent