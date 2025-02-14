import Image from 'next/image';
import Link from 'next/link';

interface AgentCardProps {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  specialties: string[];
  rating: number;
  pricePerHour: number;
}

export default function AgentCard({
  id,
  name,
  imageUrl,
  description,
  specialties,
  rating,
  pricePerHour,
}: AgentCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <Link href={`/agents/${id}`}>
        <div className="relative h-48 w-full">
          <Image
            src={imageUrl}
            alt={`${name}'s profile picture`}
            fill
            className="object-cover"
          />
        </div>
        <div className="p-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
            <div className="flex items-center">
              <span className="text-yellow-400">★</span>
              <span className="ml-1 text-gray-600">{rating.toFixed(1)}</span>
            </div>
          </div>
          <div className="text-gray-600 text-sm mb-3 line-clamp-2">{description}</div>
          <div className="flex flex-wrap gap-2 mb-3">
            {specialties.map((specialty) => (
              <span
                key={specialty}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {specialty}
              </span>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-900 font-medium">
              ${pricePerHour}/hour
            </span>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              View Profile
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
} 