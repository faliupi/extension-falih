import { useRecognitionStore } from '@/store/recognition-store'
import { useEffect } from 'react'


export default function SelectRecognitionModel() {
  const { selectedModel, setSelectedModel, getSelectedModel } = useRecognitionStore()


  useEffect(() => {
    getSelectedModel()
  }, [])

  return (
    <div className="flex items-center my-2 gap-2">
      <h5 className="font-medium text-base">Recognition Model</h5>
      {/* <p className="text-slate-600">Face-api.js</p> */}
      <select name="" id="" className="border p-2 rounded-md"
        // value={selectedModel}
        // defa
        value={selectedModel}
        defaultValue={selectedModel}
        onChange={(e) => setSelectedModel(e.target.value)}
      >
        <option value="0"
          className="text-slate-600"
        >Face-api.js
          by Vincent Mühler
        </option>
        <option value="1" disabled>EmoValAro7 by Rangga Kalam

          (on development)
        </option>
      </select>
    </div>)
}