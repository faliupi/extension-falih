export type User= {
  "https://customclaim.com/id": string
  "https://customclaim.com/role": string[]
  given_name: string
  family_name: string
  nickname: string
  name: string
  picture: string
  locale: string
  updated_at: string
  email: string
  email_verified: boolean
  sub: string
  fullName: string
  authId: string
  isPersonalityFormFilled?: string
}

export interface ARCSType {
  email: string
  attentionPositiveScore: number
  attentionNegativeScore: number
  relevancePositiveScore: number
  relevanceNegativeScore: number
  confidencePositiveScore: number
  confidenceNegativeScore: number
  satisfactionPositiveScore: number
  satisfactionNegativeScore: number
  totalPositiveScore: number
  totalNegativeScore: number
  result: string
}