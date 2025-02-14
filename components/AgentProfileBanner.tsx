import Image from 'next/image';

interface AgentProfileBannerProps {
  name: string;
  imageUrl: string;
  description: string;
  specialties: string[];
  rating: number;
  totalReviews: number;
  yearsOfExperience: number;
  pricePerHour: number;
  availability: string;
}

export default function AgentProfileBanner({
  name,
  imageUrl,
  description,
  specialties,
  rating,
  totalReviews,
  yearsOfExperience,
  pricePerHour,
  availability,
}: AgentProfileBannerProps) {
  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      <div className="relative h-64 bg-gradient-to-r from-blue-500 to-purple-600">
        <div className="absolute inset-0 bg-black opacity-30" />
        <div className="container mx-auto px-6 py-8 relative">
          <div className="flex flex-col md:flex-row items-center">
            <div className="relative w-32 h-32 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white">
              <Image
                src={imageUrl}
                alt={`${name}'s profile picture`}
                fill
                className="object-cover"
              />
            </div>
            
            <div className="md:ml-8 mt-4 md:mt-0 text-center md:text-left">
              <h1 className="text-3xl font-bold text-white mb-2">{name}</h1>
              <div className="flex flex-wrap gap-2 justify-center md:justify-start mb-4">
                {specialties.map((specialty) => (
                  <span
                    key={specialty}
                    className="px-3 py-1 bg-white/20 text-white rounded-full text-sm"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">About Me</h2>
            <div className="text-gray-600 leading-relaxed">{description}</div>
            
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Experience</div>
                <div className="text-lg font-semibold">{yearsOfExperience} years</div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm text-gray-500">Availability</div>
                <div className="text-lg font-semibold">{availability}</div>
              </div>
            </div>
          </div>

          <div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">${pricePerHour}</h3>
                  <div className="text-gray-500">per hour</div>
                </div>
                <div className="text-right">
                  <div className="flex items-center">
                    <span className="text-yellow-400 text-2xl">★</span>
                    <span className="ml-2 text-xl font-semibold">{rating.toFixed(1)}</span>
                  </div>
                  <div className="text-gray-500">{totalReviews} reviews</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 