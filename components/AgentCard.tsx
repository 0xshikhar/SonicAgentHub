import Image from 'next/image';
import Link from 'next/link';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

interface AgentCardProps {
  id: string;
  handle: string;
  name: string;
  imageUrl: string;
  description: string;
  traits: string;
  background?: string;
  twitterHandle?: string;
}

export function AgentCard({
  id,
  handle,
  name,
  imageUrl,
  description,
  traits,
  background,
  twitterHandle,
}: AgentCardProps) {
  const traitsList = traits.split(',').map(trait => trait.trim());
  
  return (
    <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden border border-gray-100">
      <div className="relative">
        {/* Agent image */}
        <div className="h-40 w-full bg-gradient-to-r from-indigo-500 to-purple-600">
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2">
            <div className="relative h-24 w-24 rounded-full border-4 border-white overflow-hidden">
              <Image
                src={imageUrl}
                alt={`${name}'s profile picture`}
                fill
                className="object-cover"
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Agent info */}
      <div className="pt-16 px-4 pb-4">
        <div className="text-center mb-3">
          <h3 className="text-xl font-semibold text-gray-900">{name}</h3>
          {twitterHandle && (
            <p className="text-gray-500 text-sm">@{twitterHandle}</p>
          )}
        </div>
        
        <p className="text-gray-700 text-sm mb-4 line-clamp-2 text-center">{description}</p>
        
        <div className="flex flex-wrap gap-1.5 justify-center mb-4">
          {traitsList.slice(0, 3).map((trait) => (
            <Badge 
              key={trait} 
              variant="outline"
              className="bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
            >
              {trait}
            </Badge>
          ))}
          {traitsList.length > 3 && (
            <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">
              +{traitsList.length - 3} more
            </Badge>
          )}
        </div>
        
        <div className="flex justify-center">
          <Link href={`/agent/${handle}`} className="w-full">
            <Button 
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              View Profile
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
} 