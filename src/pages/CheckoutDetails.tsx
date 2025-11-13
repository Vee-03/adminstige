import { ArrowLeft } from 'lucide-react'
import type { CheckoutItem } from '../types/checkout'

interface Props {
  checkout: CheckoutItem
  onBack: () => void
}

export default function CheckoutDetails({ checkout, onBack }: Props) {
  const getStatusBadge = (status: 'paid' | 'unpaid') => {
    let className = ''
    switch (status) {
      case 'paid': className = 'bg-green-100 text-green-800'; break
      case 'unpaid': className = 'bg-red-100 text-red-800'; break
    }
    return <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${className}`}>{status.toUpperCase()}</span>
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={onBack} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-3xl font-bold text-gray-900">Detail Checkout</h2>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-6 space-y-4 border border-gray-100">
        <div><strong>User:</strong> {checkout.user_name}</div>
        <div><strong>Destination:</strong> {checkout.destination_name}</div>
        <div><strong>Total Price:</strong> Rp {checkout.total_price.toLocaleString('id-ID')}</div>
        <div><strong>Status:</strong> {getStatusBadge(checkout.status)}</div>
        <div><strong>Created At:</strong> {new Date(checkout.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
      </div>
    </div>
  )
}
