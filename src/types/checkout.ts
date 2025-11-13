export interface CheckoutItem {
  id: string // UI uses id as string (uuid)
  user_name: string
  destination_name: string
  total_price: number
  status: 'paid' | 'unpaid'
  created_at: string
}
