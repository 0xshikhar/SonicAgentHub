import { useRouter } from 'next/router';
import { usePrivy } from '@privy-io/react-auth';
import AgentProfileBanner from '../../components/AgentProfileBanner';
import BookingForm from '../../components/BookingForm';

// This would typically come from your API
interface Agent {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  specialties: string[];
  rating: number;
  totalReviews: number;
  yearsOfExperience: number;
  pricePerHour: number;
  availability: string;
  reviews: {
    id: string;
    userName: string;
    rating: number;
    comment: string;
    date: string;
  }[];
}

export default function AgentProfilePage() {
  const router = useRouter();
  const { agentId } = router.query;
  const { authenticated } = usePrivy();

  // This would typically be fetched from your API based on the agentId
  const agent: Agent = {
    id: '1',
    name: 'John Doe',
    imageUrl: '/assets/agents/john-doe.jpg',
    description: 'Experienced AI agent specializing in natural language processing and machine learning. With over 5 years of experience in developing and implementing AI solutions, I help businesses leverage the power of artificial intelligence to solve complex problems.',
    specialties: ['NLP', 'Machine Learning', 'Python'],
    rating: 4.8,
    totalReviews: 124,
    yearsOfExperience: 5,
    pricePerHour: 150,
    availability: 'Mon-Fri, 9AM-5PM',
    reviews: [
      {
        id: '1',
        userName: 'Alice Smith',
        rating: 5,
        comment: 'Excellent work! John helped us implement a complex NLP solution that greatly improved our customer service.',
        date: '2024-02-01',
      },
      // Add more reviews here
    ],
  };

  if (router.isFallback) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AgentProfileBanner
        name={agent.name}
        imageUrl={agent.imageUrl}
        description={agent.description}
        specialties={agent.specialties}
        rating={agent.rating}
        totalReviews={agent.totalReviews}
        yearsOfExperience={agent.yearsOfExperience}
        pricePerHour={agent.pricePerHour}
        availability={agent.availability}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Reviews Section */}
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-semibold mb-6">Reviews</h2>
            <div className="space-y-6">
              {agent.reviews.map((review) => (
                <div key={review.id} className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-medium text-gray-900">{review.userName}</h3>
                      <p className="text-sm text-gray-500">{review.date}</p>
                    </div>
                    <div className="flex items-center">
                      <span className="text-yellow-400">★</span>
                      <span className="ml-1 text-gray-600">{review.rating.toFixed(1)}</span>
                    </div>
                  </div>
                  <p className="text-gray-600">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Booking Form Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <BookingForm
                agentId={agent.id}
                agentName={agent.name}
                pricePerHour={agent.pricePerHour}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// This would typically fetch data from your API
export async function getStaticPaths() {
  return {
    paths: [
      { params: { agentId: '1' } },
      // Add more static paths here
    ],
    fallback: true,
  };
}

export async function getStaticProps({ params }: { params: { agentId: string } }) {
  // Fetch agent data based on params.agentId
  return {
    props: {},
    revalidate: 60, // Revalidate every 60 seconds
  };
} 