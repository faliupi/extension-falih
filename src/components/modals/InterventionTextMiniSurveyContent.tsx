"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import axios from "axios"
import { BE_ENDPOINT_V2 } from "@/constants"
import { useUserStore } from "@/store/user-store"
import { toast } from "sonner"

interface InterventionTextMiniSurveyContentProps {
  setReinforcementType: (value: string) => void
  title?: string
}

export default function InterventionTextMiniSurveyContent({setReinforcementType, title="Open survey first"}: InterventionTextMiniSurveyContentProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const { accessToken } = useUserStore()

  const handleSubmit = async () => {
    setIsLoading(true)

    try {
      const res = await axios.patch(`${BE_ENDPOINT_V2}/users/reinforcement-type`, {
        reinforcementType: selectedOption,
      }, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      console.log("Survey submitted:", res.data)
      if (res.data.success) {
        setOpen(false)
        toast.success("Thanks for choosing!")
        setSelectedOption(null)
        setIsLoading(false)
        setReinforcementType(res.data.reinforcementType)
      }

      return res.data


    } catch (error) {
      console.error("Failed to submit survey:", error)
      setIsLoading(false)
      setSelectedOption(null)
    } finally {
      setIsLoading(false)
      setSelectedOption(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">{title}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Text Intervention Mini Survey</DialogTitle>
          <DialogDescription>
            Silahkan pilih jenis kalimat intervensi yang lebih memotivasimu saat belajar.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <h3 className="font-medium">Contoh:</h3>
            <div className="rounded-md bg-green-50 p-4 text-sm text-green-800">
              <strong>Positif:</strong> Aku tahu kamu sedang sedih, tapi setiap usaha yang kamu lakukan sekarang akan membuatmu lebih siap dan bangga saat ujian nanti. Kamu hebat, dan aku percaya kamu bisa melewati ini! 🌈✨
            </div>
            <div className="rounded-md bg-yellow-50 p-4 text-sm text-red-800">
              <strong>Negatif:</strong> Kalau kamu terus terlarut dalam kesedihan dan tidak mulai belajar, nanti waktu ujian datang kamu malah tambah stres karena tidak siap! 📉⏳
            </div>
          </div>
          <RadioGroup onValueChange={setSelectedOption} value={selectedOption || undefined}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="POSITIVE" id="positive" />
              <Label htmlFor="positive">A. Positive</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="NEGATIVE" id="negative" />
              <Label htmlFor="negative">B. Negative</Label>
            </div>
          </RadioGroup>
        </div>
        <Button
          className="disabled:opacity-50 disabled:cursor-not-allowed"
          onClick={handleSubmit} disabled={!selectedOption}>
          {isLoading ? "Loading..." : "Submit"}
        </Button>
      </DialogContent>
    </Dialog>
  )
}

