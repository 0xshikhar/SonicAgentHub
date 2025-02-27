import { withWalletAuth } from '@/lib/withWalletAuth'

function DashboardPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
      <p className="text-lg mb-4">
        Welcome to your dashboard! This page is protected and only accessible when your wallet is connected.
      </p>
      <div className="bg-[#131B31] p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Your Account</h2>
        <p className="mb-2">
          You're successfully authenticated with your wallet.
        </p>
      </div>
    </div>
  )
}

// Wrap the component with the withWalletAuth HOC to protect it
export default withWalletAuth(DashboardPage) 