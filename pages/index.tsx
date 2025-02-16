import { useRouter } from 'next/router';
// import { usePrivy } from '@privy-io/react-auth';
import Image from 'next/image';
import { FeatureIcon } from '../components/FeatureIcons';
import Link from 'next/link';

export default function HomePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-full bg-[#0A0F1E] relative overflow-hidden">
      {/* Animated Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0F1E] via-[#162449] to-[#0A0F1E]">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="relative pt-32 pb-20 sm:pt-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column */}
            <div className="space-y-8 relative">
              <div className="space-y-6">
                <div className="inline-block">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-50"></div>
                    <div className="relative px-4 py-2 bg-[#131B31] rounded-lg">
                      {/* green dot */}
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <div className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">
                          Platform will be live soon.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <h1 className="text-6xl font-bold leading-tight">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white">
                    Agents Market: The AI-Powered Autonomous Agent Platform
                  </span>
                </h1>
                <div className="text-gray-400 text-lg leading-relaxed">
                  Leveraging Autonomous AI to Redefine Digital Ownership and Transform User Interaction in the Crypto World
                </div>
              </div>
              <div className="flex space-x-6">
                <button
                  onClick={() => router.push('/agents/create')}
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
                  <div className="relative px-8 py-3 bg-[#0A0F1E] rounded-lg text-white group-hover:bg-[#131B31] transition duration-200">
                    Add Your Agent
                  </div>
                </button>
                <button className="px-8 py-3 rounded-lg text-white border border-transparent bg-white/5 hover:bg-white/10 backdrop-blur-sm transition duration-200">
                  <Link href="/agents">
                    Listing
                  </Link>
                </button>
              </div>
            </div>

            {/* Right Column - Dashboard Preview */}
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-50"></div>
              <div className="relative bg-[#0D1425] rounded-2xl p-8 backdrop-blur-sm">
                <div className="space-y-6">
                  {/* Chart Section */}
                  <div className="bg-[#131B31] rounded-xl p-6">
                    <div className="h-64 w-full bg-[#0A0F1E] rounded-lg p-4">
                      <div className="h-full w-full bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 rounded-lg relative overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-full h-40 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-50 blur-2xl"></div>
                        </div>
                        {/* Add your chart component here */}
                      </div>
                    </div>
                  </div>
                  {/* Bottom Grid */}
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-[#131B31] rounded-xl p-6">
                      <div className="h-40 w-full bg-[#0A0F1E] rounded-lg p-4">
                        <div className="h-full w-full bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-lg relative overflow-hidden">
                          {/* Add your content here */}
                        </div>
                      </div>
                    </div>
                    <div className="bg-[#131B31] rounded-xl p-6">
                      <div className="h-40 w-full bg-[#0A0F1E] rounded-lg p-4">
                        <div className="h-full w-full bg-gradient-to-br from-purple-500/10 to-blue-500/10 rounded-lg relative overflow-hidden">
                          {/* Add your content here */}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/5">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/5 to-transparent"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <span className="inline-block relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-50"></div>
              <span className="relative px-4 py-2 bg-[#131B31] rounded-lg text-gray-400 text-sm uppercase tracking-wider">
                Strategic Partner
              </span>
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
              <div className="relative">
                <Image src="/partners/bytedance.svg" alt="ByteDance" width={120} height={40} className="transition-transform duration-200 group-hover:scale-105" />
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
              <div className="relative">
                <Image src="/partners/vindax.svg" alt="Vindax" width={120} height={40} className="transition-transform duration-200 group-hover:scale-105" />
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
              <div className="relative">
                <Image src="/partners/xt.svg" alt="XT.com" width={120} height={40} className="transition-transform duration-200 group-hover:scale-105" />
              </div>
            </div>
            <div className="relative group">
              <div className="absolute -inset-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-200"></div>
              <div className="relative">
                <Image src="/partners/zoomex.svg" alt="Zoomex" width={120} height={40} className="transition-transform duration-200 group-hover:scale-105" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative py-24 bg-[#0A0F1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Features Header */}
          <div className="text-center mb-20">
            <div className="inline-block px-3 py-1 rounded-full bg-white/5 backdrop-blur-sm text-sm text-gray-400 mb-8">
              Features
            </div>
            <h2 className="text-5xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-300">
                Fully Loaded with
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-500">
                Game-Changing AI
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-300">
                Agents
              </span>
            </h2>
            <div className="text-gray-400 max-w-2xl mx-auto">
              Empowering digital transformation with autonomous Agent Markets that automate businesses, redefine online
              interaction, and elevate user engagement. Agents AI brings the next
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-12 gap-6">
            {/* Agent Markets Grid Card - 7 columns */}
            <div className="col-span-7 bg-[#0D1425] rounded-2xl p-8 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl"></div>
              <div className="relative">
                <h3 className="text-xl text-white font-medium mb-2">Access thousands of Agent Markets</h3>
                <div className="text-gray-400 text-sm mb-8">Create, Customize, and Unleash Intelligent Characters with Agents AI.</div>
                <div className="grid grid-cols-8 gap-4">
                  {[...Array(16)].map((_, i) => (
                    <div key={i} className={`${i >= 8 ? 'col-start-' + ((i - 7) * 2) : ''}`}>
                      <FeatureIcon key={i} index={i} />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Progress Card - 5 columns */}
            <div className="col-span-5 bg-[#0D1425] rounded-2xl p-8 relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl"></div>
              {/* Blue glow effect */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
              <div className="relative">
                {/* Checkmark Icon */}
                <div className="mb-8">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#2563EB]" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="relative mb-6">
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>0</span>
                    <span>100</span>
                  </div>
                  <div className="h-1 bg-[#1a2234] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#2563EB] to-[#7C3AED] rounded-full relative"
                      style={{ width: '95%' }}
                    >
                      {/* Animated glow effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-shimmer"></div>
                    </div>
                  </div>
                </div>

                {/* Text Content */}
                <h3 className="text-xl text-white font-medium leading-relaxed mb-2">
                  Get Exclusive Access to IDO Allocations in Leading Agent Market Projects through AgentPad.
                </h3>
              </div>
            </div>

            {/* Token Management Card - 6 columns */}
            <div className="col-span-6 bg-[#0D1425] rounded-2xl p-8 relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl"></div>
              {/* Blue glow effect */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
              <div className="relative">
                <h3 className="text-xl text-white font-medium mb-2">Token Management</h3>
                <div className="text-gray-400 text-sm mb-8">Easily Launch Your Agent Market Token & Amplify Its Reach with the Agent Portal.</div>
                <div className="relative h-48">
                  <div className="absolute inset-0">
                    {/* Semi-circle background with gradient */}
                    <div className="absolute inset-0 bg-[#131B31] rounded-t-full overflow-hidden opacity-30">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#2563EB]/20 to-transparent"></div>
                    </div>
                    {/* Concentric circles with icons */}
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full aspect-square">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="absolute inset-0 border border-[#2563EB]/20 rounded-full"
                          style={{
                            transform: `scale(${0.4 + i * 0.2})`,
                          }}
                        />
                      ))}
                      {/* Icons on the circles */}
                      {[
                        { top: '15%', left: '50%', icon: '⬡' },
                        { top: '40%', left: '30%', icon: '◈' },
                        { top: '40%', left: '70%', icon: '✧' },
                      ].map((pos, i) => (
                        <div
                          key={i}
                          className="absolute w-8 h-8 bg-[#131B31] rounded-lg flex items-center justify-center transform -translate-x-1/2 -translate-y-1/2 text-[#2563EB]"
                          style={{ top: pos.top, left: pos.left }}
                        >
                          {pos.icon}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Card - 6 columns */}
            <div className="col-span-6 bg-[#0D1425] rounded-2xl p-8 relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl"></div>
              {/* Blue glow effect */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
              <div className="relative">
                <h3 className="text-xl text-white font-medium mb-2">Analytics</h3>
                <div className="text-gray-400 text-sm mb-8">Gain Deep Insights into Your Token's On-Chain Ecosystem: Real-Time Analytics on Whale Activity, Buys, and Sells.</div>
                <div className="grid grid-cols-7 gap-3 h-40 items-end px-4">
                  {[0.65, 0.85, 0.45, 0.75, 0.55, 0.95, 0.7].map((height, i) => (
                    <div key={i} className="w-full bg-[#2563EB] rounded-t-lg relative group" style={{ height: `${height * 100}%` }}>
                      <div className="absolute inset-0 bg-gradient-to-b from-[#2563EB] to-[#7C3AED] opacity-50"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Moderation Card - 4 columns */}
            <div className="col-span-4 bg-[#0D1425] rounded-2xl p-8 relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl"></div>
              {/* Blue glow effect */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
              <div className="relative">
                <h3 className="text-xl text-white font-medium mb-2">AI Moderation</h3>
                <div className="text-gray-400 text-sm mb-8">We'll develop a dedicated AI moderation bot of your Agent Market, designed to actively engage and manage your community.</div>
                {/* Custom slider UI */}
                <div className="relative h-12 flex items-center">
                  <div className="w-full h-2 bg-[#131B31] rounded-full">
                    <div className="absolute top-1/2 -translate-y-1/2 w-full">
                      <div className="relative w-full h-1 bg-gradient-to-r from-[#2563EB] to-[#7C3AED] rounded-full">
                        {/* Slider dots */}
                        <div className="absolute -top-1.5 left-1/4 w-4 h-4 bg-[#131B31] border-2 border-[#2563EB] rounded-full"></div>
                        <div className="absolute -top-1.5 left-1/2 w-4 h-4 bg-[#131B31] border-2 border-[#2563EB] rounded-full"></div>
                        <div className="absolute -top-1.5 left-3/4 w-4 h-4 bg-[#131B31] border-2 border-[#2563EB] rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Social Media Management Card - 4 columns */}
            <div className="col-span-4 bg-[#0D1425] rounded-2xl p-8 relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl"></div>
              {/* Blue glow effect */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
              <div className="relative">
                <h3 className="text-xl text-white font-medium mb-2">Social Media Management</h3>
                <div className="text-gray-400 text-sm mb-8">Your Agent Market will handle content creation and posting across social networks, keeping your audience engaged effortlessly.</div>
                {/* Task list UI */}
                <div className="relative">
                  <div className="w-16 h-16 bg-[#131B31] rounded-xl flex items-center justify-center mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#2563EB] to-[#7C3AED] rounded-lg flex items-center justify-center text-white">
                      ✓
                    </div>
                  </div>
                  <div className="space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-1.5 bg-[#131B31] rounded-full w-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#2563EB] to-[#7C3AED] rounded-full" style={{ width: `${85 - i * 20}%` }}></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy and Security Card - 4 columns */}
            <div className="col-span-4 bg-[#0D1425] rounded-2xl p-8 relative group overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl"></div>
              {/* Blue glow effect */}
              <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500 rounded-full blur-3xl opacity-20"></div>
              <div className="relative">
                <h3 className="text-xl text-white font-medium mb-2">Privacy and Security</h3>
                <div className="text-gray-400 text-sm mb-8">Protecting Your Data and Ensuring Safe Interactions Every Step of the Way.</div>
                {/* Lock icon with glow */}
                <div className="relative flex justify-center">
                  <div className="w-20 h-20 bg-[#131B31] rounded-xl flex items-center justify-center">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#2563EB] to-[#7C3AED] rounded-lg flex items-center justify-center text-white text-2xl">
                      🔒
                    </div>
                  </div>
                  {/* Glow effect */}
                  <div className="absolute inset-0 bg-[#2563EB] rounded-xl filter blur-xl opacity-20"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="relative py-24 bg-[#0A0F1E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                WHAT OTHERS SAY
              </span>
            </h2>
          </div>

          {/* Testimonials Grid */}
          <div className="relative overflow-hidden">
            <div className="flex animate-testimonial">
              {/* First set of testimonials */}
              <div className="flex gap-6 shrink-0">
                {/* Testimonial Card 1 */}
                <div className="w-[calc(33.333333%-1rem)] bg-[#0D1425] rounded-2xl p-8 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl"></div>
                  <div className="relative">
                    <div className="text-gray-400 text-sm mb-8 leading-relaxed">
                      Robots are not going to replace humans, they are going to make their jobs much more humane. Difficult, demeaning,
                    </div>
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                        Z
                      </div>
                      <div className="ml-4">
                        <h4 className="text-white font-medium">Zesty</h4>
                        <div className="text-gray-400 text-sm">Famous AI Scientist</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Testimonial Card 2 */}
                <div className="w-[calc(33.333333%-1rem)] bg-[#0D1425] rounded-2xl p-8 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl"></div>
                  <div className="relative">
                    <div className="text-gray-400 text-sm mb-8 leading-relaxed">
                      As more and more artificial intelligence is entering into the world, more and more emotional intelligence must enter into leadership.
                    </div>
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                        AR
                      </div>
                      <div className="ml-4">
                        <h4 className="text-white font-medium">Amit Ray</h4>
                        <div className="text-gray-400 text-sm">Co-founder</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Testimonial Card 3 */}
                <div className="w-[calc(33.333333%-1rem)] bg-[#0D1425] rounded-2xl p-8 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl"></div>
                  <div className="relative">
                    <div className="text-gray-400 text-sm mb-8 leading-relaxed">
                      AI doesn't have to be evil to destroy humanity - if AI has a goal and humanity just happens to come in the way, it will destroy humanity as a matter of course.
                    </div>
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                        JR
                      </div>
                      <div className="ml-4">
                        <h4 className="text-white font-medium">John Ray</h4>
                        <div className="text-gray-400 text-sm">Technology Enthusiast</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Second set of testimonials (duplicate for seamless loop) */}
              <div className="flex gap-6 shrink-0">
                {/* Testimonial Card 4 */}
                <div className="w-[calc(33.333333%-1rem)] bg-[#0D1425] rounded-2xl p-8 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl"></div>
                  <div className="relative">
                    <div className="text-gray-400 text-sm mb-8 leading-relaxed">
                      AI doesn't have to be evil to destroy humanity - if AI has a goal and humanity just happens to come in the way, it will destroy humanity as a matter of course.
                    </div>
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                        PB
                      </div>
                      <div className="ml-4">
                        <h4 className="text-white font-medium">Panglima Bagas</h4>
                        <div className="text-gray-400 text-sm">CEO Of Log Zetos</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Testimonial Card 5 */}
                <div className="w-[calc(33.333333%-1rem)] bg-[#0D1425] rounded-2xl p-8 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl"></div>
                  <div className="relative">
                    <div className="text-gray-400 text-sm mb-8 leading-relaxed">
                      Robots are not going to replace humans, they are going to make their jobs much more humane. Difficult, demeaning, demanding, dangerous.
                    </div>
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                        EM
                      </div>
                      <div className="ml-4">
                        <h4 className="text-white font-medium">Elon Musk</h4>
                        <div className="text-gray-400 text-sm">Famous AI Scientist</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Testimonial Card 1 (duplicate) */}
                <div className="w-[calc(33.333333%-1rem)] bg-[#0D1425] rounded-2xl p-8 relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl"></div>
                  <div className="relative">
                    <div className="text-gray-400 text-sm mb-8 leading-relaxed">
                      Robots are not going to replace humans, they are going to make their jobs much more humane. Difficult, demeaning,
                    </div>
                    <div className="flex items-center">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-medium">
                        Z
                      </div>
                      <div className="ml-4">
                        <h4 className="text-white font-medium">Zesty</h4>
                        <div className="text-gray-400 text-sm">Famous AI Scientist</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
