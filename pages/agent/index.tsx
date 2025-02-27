import { useState } from 'react';
import AgentCard from '@/components/AgentCard';

// This would typically come from your API
interface Agent {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  specialties: string[];
  rating: number;
  pricePerHour: number;
}

export default function AgentsPage() {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [priceRange, setPriceRange] = useState('all');

  // This would typically be fetched from your API
  const agents: Agent[] = [
    {
      id: '1',
      name: 'John Doe',
      imageUrl: '/assets/agents/john-doe.jpg',
      description: 'Experienced AI agent specializing in natural language processing and machine learning.',
      specialties: ['NLP', 'Machine Learning', 'Python'],
      rating: 4.8,
      pricePerHour: 150,
    },
    // Add more sample agents here
  ];

  const specialties = Array.from(
    new Set(agents.flatMap((agent) => agent.specialties))
  ).sort();

  const filteredAgents = agents.filter((agent) => {
    const matchesSearch = agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = !selectedSpecialty || agent.specialties.includes(selectedSpecialty);
    
    const matchesPriceRange = (() => {
      switch (priceRange) {
        case 'under100':
          return agent.pricePerHour < 100;
        case '100to200':
          return agent.pricePerHour >= 100 && agent.pricePerHour <= 200;
        case 'over200':
          return agent.pricePerHour > 200;
        default:
          return true;
      }
    })();

    return matchesSearch && matchesSpecialty && matchesPriceRange;
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Find Your Perfect Agent</h1>
          <div className="mt-2 text-gray-600">Browse our selection of highly qualified AI agents</div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-sm mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                Search
              </label>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name or description"
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label htmlFor="specialty" className="block text-sm font-medium text-gray-700">
                Specialty
              </label>
              <select
                id="specialty"
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Specialties</option>
                {specialties.map((specialty) => (
                  <option key={specialty} value={specialty}>
                    {specialty}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="priceRange" className="block text-sm font-medium text-gray-700">
                Price Range
              </label>
              <select
                id="priceRange"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="all">All Prices</option>
                <option value="under100">Under $100/hr</option>
                <option value="100to200">$100 - $200/hr</option>
                <option value="over200">Over $200/hr</option>
              </select>
            </div>
          </div>
        </div>

        {/* Agent Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAgents.map((agent) => (
            <AgentCard
              key={agent.id}
              id={agent.id}
              name={agent.name}
              imageUrl={agent.imageUrl}
              description={agent.description}
              specialties={agent.specialties}
              rating={agent.rating}
              pricePerHour={agent.pricePerHour}
            />
          ))}
        </div>

        {filteredAgents.length === 0 && (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium text-gray-900">No agents found</h3>
            <div className="mt-2 text-gray-500">Try adjusting your filters</div>
          </div>
        )}
      </div>
    </div>
  );
} 