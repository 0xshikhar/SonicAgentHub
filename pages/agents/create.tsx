import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';

interface FormData {
  name: string;
  description: string;
  category: string;
  chains: string[];
  version: string;
  imageUrl: string;
  contractAddress: string;
  twitter?: string;
  website?: string;
  features: string[];
  capabilities: string[];
  requirements: string[];
}

const categories = [
  { id: 'Trading', name: 'Trading Agent', icon: '📈' },
  { id: 'Social', name: 'Social Agent', icon: '🤝' },
  { id: 'DeFi', name: 'DeFi Agent', icon: '💰' },
  { id: 'NFT', name: 'NFT Agent', icon: '🎨' },
  { id: 'Gaming', name: 'Gaming Agent', icon: '🎮' },
  { id: 'DAO', name: 'DAO Agent', icon: '🏛️' },
];

const chains = [
  { id: 'ETH', name: 'Ethereum', icon: '/chains/eth.svg' },
  { id: 'BSC', name: 'BSC', icon: '/chains/bsc.svg' },
  { id: 'Solana', name: 'Solana', icon: '/chains/sol.svg' },
  { id: 'Polygon', name: 'Polygon', icon: '/chains/polygon.svg' },
  { id: 'Arbitrum', name: 'Arbitrum', icon: '/chains/arbitrum.svg' },
];

export default function CreateAgentPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    category: '',
    chains: [],
    version: '',
    imageUrl: '',
    contractAddress: '',
    twitter: '',
    website: '',
    features: [''],
    capabilities: [''],
    requirements: [''],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayInputChange = (index: number, value: string, field: 'features' | 'capabilities' | 'requirements') => {
    setFormData((prev) => {
      const newArray = [...prev[field]];
      newArray[index] = value;
      return { ...prev, [field]: newArray };
    });
  };

  const addArrayItem = (field: 'features' | 'capabilities' | 'requirements') => {
    setFormData((prev) => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayItem = (index: number, field: 'features' | 'capabilities' | 'requirements') => {
    setFormData((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically send the data to your API
    console.log(formData);
    // Redirect to the listing page after successful submission
    router.push('/listing');
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-white text-sm font-medium mb-2">Agent Name</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="w-full bg-[#131B31] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          placeholder="Enter your agent's name"
        />
      </div>

      <div>
        <label className="block text-white text-sm font-medium mb-2">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          rows={4}
          className="w-full bg-[#131B31] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          placeholder="Describe your agent's functionality"
        />
      </div>

      <div>
        <label className="block text-white text-sm font-medium mb-2">Category</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((category) => (
            <button
              key={category.id}
              type="button"
              onClick={() => setFormData((prev) => ({ ...prev, category: category.id }))}
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                formData.category === category.id
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-[#131B31] text-gray-400 hover:text-white'
              }`}
            >
              <span className="mr-2">{category.icon}</span>
              {category.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-white text-sm font-medium mb-2">Supported Chains</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {chains.map((chain) => (
            <button
              key={chain.id}
              type="button"
              onClick={() => {
                setFormData((prev) => ({
                  ...prev,
                  chains: prev.chains.includes(chain.id)
                    ? prev.chains.filter((c) => c !== chain.id)
                    : [...prev.chains, chain.id],
                }));
              }}
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                formData.chains.includes(chain.id)
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                  : 'bg-[#131B31] text-gray-400 hover:text-white'
              }`}
            >
              <Image
                src={chain.icon}
                alt={chain.name}
                width={20}
                height={20}
                className="mr-2"
              />
              {chain.name}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-white text-sm font-medium mb-2">Version</label>
        <input
          type="text"
          name="version"
          value={formData.version}
          onChange={handleInputChange}
          className="w-full bg-[#131B31] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          placeholder="e.g., 1.0.0"
        />
      </div>

      <div>
        <label className="block text-white text-sm font-medium mb-2">Contract Address</label>
        <input
          type="text"
          name="contractAddress"
          value={formData.contractAddress}
          onChange={handleInputChange}
          className="w-full bg-[#131B31] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          placeholder="Enter contract address"
        />
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-white text-sm font-medium mb-2">Features</label>
        {formData.features.map((feature, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={feature}
              onChange={(e) => handleArrayInputChange(index, e.target.value, 'features')}
              className="flex-1 bg-[#131B31] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="Enter a feature"
            />
            <button
              type="button"
              onClick={() => removeArrayItem(index, 'features')}
              className="px-4 py-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('features')}
          className="mt-2 px-4 py-2 bg-[#131B31] text-blue-400 rounded-xl hover:bg-[#1a2234]"
        >
          Add Feature
        </button>
      </div>

      <div>
        <label className="block text-white text-sm font-medium mb-2">Capabilities</label>
        {formData.capabilities.map((capability, index) => (
          <div key={index} className="flex gap-2 mb-2">
            <input
              type="text"
              value={capability}
              onChange={(e) => handleArrayInputChange(index, e.target.value, 'capabilities')}
              className="flex-1 bg-[#131B31] text-white border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              placeholder="Enter a capability"
            />
            <button
              type="button"
              onClick={() => removeArrayItem(index, 'capabilities')}
              className="px-4 py-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={() => addArrayItem('capabilities')}
          className="mt-2 px-4 py-2 bg-[#131B31] text-blue-400 rounded-xl hover:bg-[#1a2234]"
        >
          Add Capability
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-[#0D1425] rounded-2xl p-8 relative">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl"></div>
        <div className="relative">
          <h1 className="text-3xl font-bold text-white mb-8">Create AI Agent</h1>

          {/* Progress Steps */}
          <div className="flex items-center mb-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    step <= currentStep
                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                      : 'bg-[#131B31] text-gray-400'
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-24 h-1 mx-2 ${
                      step < currentStep
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500'
                        : 'bg-[#131B31]'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {currentStep === 1 && renderStep1()}
            {currentStep === 2 && renderStep2()}
            {currentStep === 3 && renderStep3()}

            <div className="flex justify-between mt-8">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="px-6 py-3 bg-[#131B31] text-white rounded-xl hover:bg-[#1a2234]"
                >
                  Previous
                </button>
              )}
              {currentStep < 3 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:opacity-90"
                >
                  Next
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:opacity-90"
                >
                  Submit
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 