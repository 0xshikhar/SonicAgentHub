import { useState } from 'react';

interface BookingFormProps {
  agentId: string;
  agentName: string;
  pricePerHour: number;
}

export default function BookingForm({ agentId, agentName, pricePerHour }: BookingFormProps) {
  
  const [formData, setFormData] = useState({
    date: '',
    startTime: '',
    duration: 1,
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authenticated) {
      // Handle unauthenticated state
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentId,
          userId: user?.id,
          ...formData,
          totalPrice: pricePerHour * formData.duration,
        }),
      });

      if (!response.ok) {
        throw new Error('Booking failed');
      }

      // Handle successful booking
      alert('Booking submitted successfully!');
      setFormData({
        date: '',
        startTime: '',
        duration: 1,
        message: '',
      });
    } catch (error) {
      console.error('Booking error:', error);
      alert('Failed to submit booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-semibold mb-4">Book {agentName}</h3>
      
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700">
          Date
        </label>
        <input
          type="date"
          id="date"
          name="date"
          required
          value={formData.date}
          onChange={handleChange}
          min={new Date().toISOString().split('T')[0]}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
          Start Time
        </label>
        <input
          type="time"
          id="startTime"
          name="startTime"
          required
          value={formData.startTime}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        />
      </div>

      <div>
        <label htmlFor="duration" className="block text-sm font-medium text-gray-700">
          Duration (hours)
        </label>
        <select
          id="duration"
          name="duration"
          value={formData.duration}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          {[1, 2, 3, 4].map((hours) => (
            <option key={hours} value={hours}>
              {hours} hour{hours > 1 ? 's' : ''}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="block text-sm font-medium text-gray-700">
          Message (Optional)
        </label>
        <textarea
          id="message"
          name="message"
          rows={3}
          value={formData.message}
          onChange={handleChange}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Any specific requirements or questions?"
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <div className="flex justify-between items-center">
          <span className="text-gray-700">Total Price:</span>
          <span className="text-lg font-semibold">
            ${(pricePerHour * formData.duration).toFixed(2)}
          </span>
        </div>
      </div>

      <button
        type="submit"
        disabled={isSubmitting || !authenticated}
        className={`w-full py-3 px-4 rounded-md text-white font-medium ${
          isSubmitting || !authenticated
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isSubmitting ? 'Submitting...' : authenticated ? 'Book Now' : 'Please Login to Book'}
      </button>
    </form>
  );
} 