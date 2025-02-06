import { useState } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/router';
import Image from 'next/image';

interface Booking {
  id: string;
  agentId: string;
  agentName: string;
  agentImageUrl: string;
  date: string;
  startTime: string;
  duration: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { ready, authenticated, user } = usePrivy();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'past'>('upcoming');

  // This would typically be fetched from your API
  const bookings: Booking[] = [
    {
      id: '1',
      agentId: '1',
      agentName: 'John Doe',
      agentImageUrl: '/assets/agents/john-doe.jpg',
      date: '2024-03-01',
      startTime: '10:00',
      duration: 2,
      totalPrice: 300,
      status: 'confirmed',
      createdAt: '2024-02-15T10:30:00Z',
    },
    // Add more bookings here
  ];

  // Redirect to login if not authenticated
  if (ready && !authenticated) {
    router.push('/');
    return null;
  }

  const currentDate = new Date();
  const upcomingBookings = bookings.filter((booking) => {
    const bookingDate = new Date(`${booking.date}T${booking.startTime}`);
    return bookingDate >= currentDate;
  });

  const pastBookings = bookings.filter((booking) => {
    const bookingDate = new Date(`${booking.date}T${booking.startTime}`);
    return bookingDate < currentDate;
  });

  const displayedBookings = activeTab === 'upcoming' ? upcomingBookings : pastBookings;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          {user?.email && (
            <p className="mt-2 text-gray-600">
              Welcome back, {user.email.address}
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-8">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`${
                activeTab === 'upcoming'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
            >
              Upcoming Bookings
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`${
                activeTab === 'past'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium`}
            >
              Past Bookings
            </button>
          </nav>
        </div>

        {/* Bookings List */}
        <div className="space-y-6">
          {displayedBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white shadow rounded-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="relative h-12 w-12 rounded-full overflow-hidden">
                      <Image
                        src={booking.agentImageUrl}
                        alt={booking.agentName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {booking.agentName}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {new Date(`${booking.date}T${booking.startTime}`).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                        {' at '}
                        {booking.startTime}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        booking.status === 'confirmed'
                          ? 'bg-green-100 text-green-800'
                          : booking.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </span>
                    <p className="mt-1 text-sm text-gray-500">
                      {booking.duration} hour{booking.duration > 1 ? 's' : ''}
                    </p>
                    <p className="mt-1 text-lg font-medium text-gray-900">
                      ${booking.totalPrice}
                    </p>
                  </div>
                </div>

                {activeTab === 'upcoming' && booking.status !== 'cancelled' && (
                  <div className="mt-6 flex justify-end space-x-4">
                    <button
                      onClick={() => {
                        // Handle rescheduling
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => {
                        // Handle cancellation
                      }}
                      className="px-4 py-2 border border-red-300 rounded-md text-sm font-medium text-red-700 hover:bg-red-50"
                    >
                      Cancel Booking
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}

          {displayedBookings.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <h3 className="text-lg font-medium text-gray-900">
                No {activeTab} bookings
              </h3>
              <p className="mt-2 text-gray-500">
                {activeTab === 'upcoming'
                  ? "You don't have any upcoming bookings"
                  : "You haven't had any sessions yet"}
              </p>
              {activeTab === 'upcoming' && (
                <button
                  onClick={() => router.push('/agents')}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Find an Agent
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 