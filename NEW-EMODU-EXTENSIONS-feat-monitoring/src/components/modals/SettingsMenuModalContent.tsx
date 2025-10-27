import { DialogContent, DialogHeader, DialogTitle } from '../ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select'
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';






const SettingsMenuModalContent = () => {
  // default model effect
  // useEffect(() => {

  // }, []) 

  return (
    <DialogContent className="rounded-lg ">
      <DialogHeader>
        <DialogTitle>Settings
        </DialogTitle>
      </DialogHeader>
      <div className="flex flex-col space-y-2 ">
        <div className='flex items-center justify-between gap-0'>

          <label htmlFor="model">Select Model: </label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">Face-api.js</SelectItem>
              <SelectItem value="1">EmoValAro7</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className='flex items-center justify-between gap-5'>

          <label htmlFor="model">Theme: </label>
          <Select>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Theme" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

    </DialogContent>

  )
}

export default SettingsMenuModalContent