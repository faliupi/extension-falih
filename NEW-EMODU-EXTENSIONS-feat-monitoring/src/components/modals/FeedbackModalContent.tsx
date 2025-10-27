/* eslint-disable @typescript-eslint/no-explicit-any */
import { DialogContent, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog'
import { Textarea } from '../ui/textarea'
import { Button } from '../ui/button'


interface FeedbackModalContentProps {
  feedbackBody: string;
  setFeedbackBody: (value: string) => void;
  handleSendFeedback: () => void;
  loading: boolean;

}

const FeedbackModalContent = ({
  feedbackBody,
  setFeedbackBody,
  handleSendFeedback,
  loading
}: FeedbackModalContentProps) => {
  return (
    <DialogContent className="rounded-lg">
      <DialogHeader>
        <DialogTitle>What do you think about Emodu Extension
        </DialogTitle>
      </DialogHeader>
      <Textarea
        placeholder="Tell us everything you think about Emodu..."
        className="bg-zinc-300/50 border-0 focus-visible:ring-0 text-black focus-visible:ring-offset-0 h-32 dark:text-white dark:placeholder:text-gray-300 "
        value={feedbackBody}
        onChange={(e:any) => setFeedbackBody(e.target.value)}
      // {...field}
      />
      <DialogFooter className="  py-4  ">
        <Button
          variant="default"
          disabled={loading || feedbackBody.length === 0}
          onClick={handleSendFeedback}
          className="bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 dark:text-white"

        >
          {loading ? "Sending..." : "Send"}
          {/* Send */}
        </Button>
      </DialogFooter>
    </DialogContent>)
}

export default FeedbackModalContent