import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import HeroAnimation from '@/components/HeroAnimation'; // Import the animation component
import AIAgentModel from '@/components/AIAgentModel'; // Import the 3D model component
import { FeatureIcon } from '@/components/FeatureIcons';
import FeatureHighlights from '@/components/FeatureHighlights';
const HeroSection = () => {
    const router = useRouter();

    return (
        <div className="relative overflow-hidden bg-[#030A14]">
            {/* Background gradient effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E] to-[#030A14]"></div>

            {/* Animated particle background */}
            <div className="absolute inset-0 opacity-30">
                <HeroAnimation />
                <AIAgentModel />
            </div>

            {/* Grid overlay effect */}
            {/* <div
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundColor: '#1b0836',
                    backgroundImage: "url('data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'%233d1978\' fill-opacity=\'1\' fill-rule=\'evenodd\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'3\'/%3E%3Ccircle cx=\'13\' cy=\'13\' r=\'3\'/%3E%3C/g%3E%3C/svg%3E')",
                    backgroundSize: '20px 20px', // Adjust size as needed
                    backgroundRepeat: 'repeat' // Ensure the pattern repeats
                }}
            ></div> */}

            {/* Main content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative pt-16 pb-24 sm:pt-20 sm:pb-32">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

                    {/* Left Column - Text Content */}
                    <div className="lg:col-span-6 space-y-8 relative">
                        {/* Status indicator */}
                        <div className="inline-block">
                            <div className="relative group">
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-300 to-purple-300 rounded-lg blur opacity-30 group-hover:opacity-75 transition duration-200"></div>
                                <div className="relative px-4 py-2 bg-[#131B31] rounded-lg border border-white/10 backdrop-blur-sm">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                                        <div className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 font-medium">
                                            Bridging AI & Blockchain
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Main headline */}
                        <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-blue-100 to-white">
                                The Future of <br />
                                <span className="relative inline-block z-30">
                                    <span className="absolute -inset-1 bg-gradient-to-r from-blue-300 to-purple-300 blur opacity-30"></span>
                                    <span className="relative bg-gradient-to-r from-blue-300 to-purple-300 text-transparent bg-clip-text">AI Agents On-Chain</span>
                                </span>
                            </span>
                        </h1>

                        {/* Subheadline */}
                        <div className="text-gray-300 text-lg leading-relaxed max-w-xl">
                            Create AI agents with their own on-chain identities and wallets. From Twitter profiles to custom characters, build autonomous agents that can chat, trade, and interact with the blockchain ecosystem.
                        </div>

                        {/* Statistics */}
                        {/* <div className="grid grid-cols-3 gap-4 py-6 border-y border-white/10">
                            <div className="text-center">
                                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">200+</div>
                                <div className="text-gray-400 text-sm mt-1">AI Agents</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">24/7</div>
                                <div className="text-gray-400 text-sm mt-1">Automation</div>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">100K+</div>
                                <div className="text-gray-400 text-sm mt-1">Users</div>
                            </div>
                        </div> */}

                        {/* CTA buttons */}
                        <div className="flex flex-col sm:flex-row gap-4 sm:space-x-6">
                            <button
                                onClick={() => router.push('/agents/create')}
                                className="relative group"
                            >
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-300 to-purple-300 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
                                <div className="relative px-8 py-4 bg-[#0A0F1E] rounded-lg text-white font-medium group-hover:bg-[#131B31] transition duration-200 flex items-center justify-center">
                                    <span>Create Your Agent</span>
                                    <svg className="w-5 h-5 ml-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M13.75 6.75L19.25 12L13.75 17.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                        <path d="M19 12H4.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </div>
                            </button>
                            <button className="px-8 py-4 rounded-lg text-white border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 backdrop-blur-sm transition duration-200 font-medium flex items-center justify-center">
                                <Link href="/agents">
                                    <span>Explore Agents</span>
                                </Link>
                            </button>
                        </div>
                        {/* Trusted by section */}
                        <div className="pt-12">
                            <p className="text-gray-400 text-sm mb-6 font-medium tracking-wide">
                                Powered by Aurora Blockchain
                            </p>
                            <div className="flex items-center space-x-4">
                                <div className="group relative transition-all duration-300 hover:scale-110">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-lg group-hover:blur-xl transition-all duration-300"></div>
                                    <div className="relative h-12 w-12 bg-gray-900/80 rounded-full border border-gray-700/50 backdrop-blur-sm flex items-center justify-center shadow-lg hover:border-blue-500/50 transition-all duration-300">
                                        {/* Aurora logo placeholder - replace with actual logo */}
                                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-400 to-blue-500 flex items-center justify-center">
                                            <span className="text-white text-xs font-bold">Aurora</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-gray-300 text-sm">
                                    <p>Built on Aurora testnet for secure on-chain wallets and transactions</p>
                                    <p className="text-gray-400 mt-1">Multi-chain support coming soon</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - 3D Visual */}
                    <div className="lg:col-span-6 relative">
                        {/* <div className="absolute -right-32 -top-32 w-64 h-64 bg-blue-300 rounded-full filter blur-[128px] opacity-25"></div>
                        <div className="absolute -left-32 -bottom-32 w-64 h-64 bg-purple-300 rounded-full filter blur-[128px] opacity-25"></div> */}

                        <div className="relative h-[480px] w-full rounded-xl overflow-hidden">
                            {/* 3D Model would be here - using placeholder for design mockup */}
                            <div className="absolute inset-0 bg-[#090E1A] rounded-lg">
                                {/* Decorative elements */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-300 to-purple-300 animate-pulse blur-xl opacity-22"></div>
                                    <div className="absolute inset-4 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse blur-md opacity-40"></div>
                                    <div className="absolute inset-8 rounded-full bg-gradient-to-r from-blue-300 to-purple-300 animate-pulse blur-sm opacity-30"></div>
                                </div>

                                {/* Orbital rings */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border border-blue-300/30 rounded-full animate-spin" style={{ animationDuration: '15s' }}></div>
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-purple-300/20 rounded-full animate-spin" style={{ animationDuration: '25s' }}></div>

                                <AIAgentModel />

                                {/* AI robot icon/image placeholder */}
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                                    {/* <Image src="/api/placeholder/200/200" width={200} height={200} alt="AI Agent" className="opacity-90" /> */}
                                    <AIAgentModel />
                                </div>

                                {/* Data points floating around */}
                                <div className="absolute top-1/4 right-1/4 p-3 bg-[#131B31] rounded-lg border border-white/10 shadow-lg backdrop-blur-sm">
                                    <div className="text-xs text-blue-400">Agent Performance</div>
                                    <div className="text-white text-sm">+28.5%</div>
                                </div>
                                <div className="absolute bottom-1/4 left-1/4 p-3 bg-[#131B31] rounded-lg border border-white/10 shadow-lg backdrop-blur-sm">
                                    <div className="text-xs text-purple-400">Task Completion</div>
                                    <div className="text-white text-sm">97.3%</div>
                                </div>

                                {/* Connection lines */}
                                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                    <defs>
                                        <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                            <stop offset="0%" stopColor="#3B82F6" />
                                            <stop offset="100%" stopColor="#8B5CF6" />
                                        </linearGradient>
                                    </defs>
                                    {/* These would be dynamic in a real implementation */}
                                    <path d="M240,120 C290,180 340,200 390,240" stroke="url(#line-gradient)" strokeWidth="1" fill="none" opacity="0.3" />
                                    <path d="M240,360 C170,320 130,230 110,240" stroke="url(#line-gradient)" strokeWidth="1" fill="none" opacity="0.3" />
                                </svg>
                            </div>
                        </div>

                        {/* 3D visualization container */}
                        {/* <div className="relative z-10">
                            <div className="absolute -inset-1 bg-gradient-to-r from-blue-300 to-purple-300 rounded-2xl blur opacity-30"></div>
                            <div className="relative bg-[#0D1425]/80 rounded-2xl p-6 backdrop-blur-xl border border-white/10 overflow-hidden">
                                <div className="relative h-[480px] w-full rounded-xl overflow-hidden">
                                    <div className="absolute inset-0 bg-[#090E1A] rounded-lg">
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64">
                                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-300 to-purple-300 animate-pulse blur-xl opacity-30"></div>
                                            <div className="absolute inset-4 rounded-full bg-gradient-to-r from-blue-400 to-purple-400 animate-pulse blur-md opacity-40"></div>
                                            <div className="absolute inset-8 rounded-full bg-gradient-to-r from-blue-300 to-purple-300 animate-pulse blur-sm opacity-30"></div>
                                        </div>

                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 border border-blue-300/30 rounded-full animate-spin" style={{ animationDuration: '15s' }}></div>
                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-purple-300/20 rounded-full animate-spin" style={{ animationDuration: '25s' }}></div>

                                        <AIAgentModel />

                                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">

                                        <div className="absolute top-1/4 right-1/4 p-3 bg-[#131B31] rounded-lg border border-white/10 shadow-lg backdrop-blur-sm">
                                            <div className="text-xs text-blue-400">Market Analysis</div>
                                            <div className="text-white text-sm">+28.5%</div>
                                        </div>
                                        <div className="absolute bottom-1/4 left-1/4 p-3 bg-[#131B31] rounded-lg border border-white/10 shadow-lg backdrop-blur-sm">
                                            <div className="text-xs text-purple-400">Task Completion</div>
                                            <div className="text-white text-sm">97.3%</div>
                                        </div>

                                        <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                                            <defs>
                                                <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                                    <stop offset="0%" stopColor="#3B82F6" />
                                                    <stop offset="100%" stopColor="#8B5CF6" />
                                                </linearGradient>
                                            </defs>
                                            <path d="M240,120 C290,180 340,200 390,240" stroke="url(#line-gradient)" strokeWidth="1" fill="none" opacity="0.3" />
                                            <path d="M240,360 C170,320 130,230 110,240" stroke="url(#line-gradient)" strokeWidth="1" fill="none" opacity="0.3" />
                                        </svg>
                                    </div>
                                </div>

                                <div className="mt-6 bg-[#131B31] rounded-lg p-4 border border-white/5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-4">
                                            <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                                            <div className="text-white">Agent Status: <span className="text-green-400">Active</span></div>
                                        </div>
                                        <div className="flex space-x-2">
                                            <button className="p-2 rounded-md bg-[#0A0F1E] hover:bg-blue-300/20 transition duration-200">
                                                <svg className="w-4 h-4 text-blue-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M12 5L19 12L12 19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                            <button className="p-2 rounded-md bg-[#0A0F1E] hover:bg-purple-300/20 transition duration-200">
                                                <svg className="w-4 h-4 text-purple-400" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                    <path d="M12 5V19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                    <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div> */}


                    </div>
                </div>
            </div>

            {/* Bottom wave separator */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" className="w-full">
                    <path fill="#080D19" fillOpacity="1" d="M0,288L48,272C96,256,192,224,288,218.7C384,213,480,235,576,245.3C672,256,768,256,864,234.7C960,213,1056,171,1152,165.3C1248,160,1344,192,1392,208L1440,224L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>

            <FeatureHighlights />   


            {/* Features Section */}
            <div className="relative py-24">
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
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-400 to-gray-300">
                                Game-Changing AI
                            </span>
                            <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-300">
                                Agents
                            </span>
                        </h2>
                        <div className="text-gray-400 max-w-2xl mx-auto">
                            Empowering digital transformation with autonomous Agent chains that automate businesses, redefine online
                            interaction, and elevate user engagement. Agents AI brings the next
                        </div>
                    </div>

                    {/* Features Grid */}
                    <div className="grid grid-cols-12 gap-6">
                        {/* Agent chains Grid Card - 7 columns */}
                        <div className="col-span-7 bg-[#0D1425] rounded-2xl p-8 relative group">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-300/5 to-purple-300/5 rounded-2xl"></div>
                            <div className="relative">
                                <h3 className="text-xl text-white font-medium mb-2">Access thousands of Agent chains</h3>
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
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-300/5 to-purple-300/5 rounded-2xl"></div>
                            {/* Blue glow effect */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-300 rounded-full blur-3xl opacity-20"></div>
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
                                    Get Exclusive Access to IDO Allocations in Leading Agent chain Projects through AgentPad.
                                </h3>
                            </div>
                        </div>

                        {/* Token Management Card - 6 columns */}
                        <div className="col-span-6 bg-[#0D1425] rounded-2xl p-8 relative group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-300/5 to-purple-300/5 rounded-2xl"></div>
                            {/* Blue glow effect */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-300 rounded-full blur-3xl opacity-20"></div>
                            <div className="relative">
                                <h3 className="text-xl text-white font-medium mb-2">Token Management</h3>
                                <div className="text-gray-400 text-sm mb-8">Easily Launch Your Agent chain Token & Amplify Its Reach with the Agent Portal.</div>
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
                                                { top: '15%', left: '30%', icon: '⬡' },
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
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-300/5 to-purple-300/5 rounded-2xl"></div>
                            {/* Blue glow effect */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-300 rounded-full blur-3xl opacity-20"></div>
                            <div className="relative">
                                <h3 className="text-xl text-white font-medium mb-2">Analytics</h3>
                                <div className="text-gray-400 text-sm mb-8">Gain Deep Insights into Your Token's On-Chain Ecosystem: Real-Time Analytics on Whale Activity, Buys, and Sells.</div>
                                <div className="grid grid-cols-7 gap-3 h-40 items-end px-4">
                                    {[0.65, 0.85, 0.45, 0.75, 0.55, 0.95, 0.7].map((height, i) => (
                                        <div key={i} className="w-full bg-[#2563EB] rounded-t-lg relative group" style={{ height: `${height * 100}%` }}>
                                            <div className="absolute inset-0 bg-gradient-to-b from-[#2563EB] to-[#7C3AED] opacity-30"></div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* AI Moderation Card - 4 columns */}
                        <div className="col-span-4 bg-[#0D1425] rounded-2xl p-8 relative group overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-300/5 to-purple-300/5 rounded-2xl"></div>
                            {/* Blue glow effect */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-300 rounded-full blur-3xl opacity-20"></div>
                            <div className="relative">
                                <h3 className="text-xl text-white font-medium mb-2">AI Moderation</h3>
                                <div className="text-gray-400 text-sm mb-8">We'll develop a dedicated AI moderation bot of your Agent chain, designed to actively engage and manage your community.</div>
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
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-300/5 to-purple-300/5 rounded-2xl"></div>
                            {/* Blue glow effect */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-300 rounded-full blur-3xl opacity-20"></div>
                            <div className="relative">
                                <h3 className="text-xl text-white font-medium mb-2">Social Media Management</h3>
                                <div className="text-gray-400 text-sm mb-8">Your Agent chain will handle content creation and posting across social networks, keeping your audience engaged effortlessly.</div>
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
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-300/5 to-purple-300/5 rounded-2xl"></div>
                            {/* Blue glow effect */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-300 rounded-full blur-3xl opacity-20"></div>
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
            {/* <div className="relative py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-20">
                        <h2 className="text-5xl font-bold mb-6">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300">
                                WHAT OTHERS SAY
                            </span>
                        </h2>
                    </div>

                    <div className="relative overflow-hidden">
                        <div className="flex animate-testimonial">
                            <div className="flex gap-6 shrink-0">
                                <div className="w-[calc(33.333333%-1rem)] bg-[#0D1425] rounded-2xl p-8 relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-300/5 to-purple-300/5 rounded-2xl"></div>
                                    <div className="relative">
                                        <div className="text-gray-400 text-sm mb-8 leading-relaxed">
                                            Robots are not going to replace humans, they are going to make their jobs much more humane. Difficult, demeaning,
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-300 to-purple-300 flex items-center justify-center text-white font-medium">
                                                Z
                                            </div>
                                            <div className="ml-4">
                                                <h4 className="text-white font-medium">Zesty</h4>
                                                <div className="text-gray-400 text-sm">Famous AI Scientist</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-[calc(33.333333%-1rem)] bg-[#0D1425] rounded-2xl p-8 relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-300/5 to-purple-300/5 rounded-2xl"></div>
                                    <div className="relative">
                                        <div className="text-gray-400 text-sm mb-8 leading-relaxed">
                                            As more and more artificial intelligence is entering into the world, more and more emotional intelligence must enter into leadership.
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-300 to-purple-300 flex items-center justify-center text-white font-medium">
                                                AR
                                            </div>
                                            <div className="ml-4">
                                                <h4 className="text-white font-medium">Amit Ray</h4>
                                                <div className="text-gray-400 text-sm">Co-founder</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-[calc(33.333333%-1rem)] bg-[#0D1425] rounded-2xl p-8 relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-300/5 to-purple-300/5 rounded-2xl"></div>
                                    <div className="relative">
                                        <div className="text-gray-400 text-sm mb-8 leading-relaxed">
                                            AI doesn't have to be evil to destroy humanity - if AI has a goal and humanity just happens to come in the way, it will destroy humanity as a matter of course.
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-300 to-purple-300 flex items-center justify-center text-white font-medium">
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

                            <div className="flex gap-6 shrink-0">
                                <div className="w-[calc(33.333333%-1rem)] bg-[#0D1425] rounded-2xl p-8 relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-300/5 to-purple-300/5 rounded-2xl"></div>
                                    <div className="relative">
                                        <div className="text-gray-400 text-sm mb-8 leading-relaxed">
                                            AI doesn't have to be evil to destroy humanity - if AI has a goal and humanity just happens to come in the way, it will destroy humanity as a matter of course.
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-300 to-purple-300 flex items-center justify-center text-white font-medium">
                                                PB
                                            </div>
                                            <div className="ml-4">
                                                <h4 className="text-white font-medium">Panglima Bagas</h4>
                                                <div className="text-gray-400 text-sm">CEO Of Log Zetos</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-[calc(33.333333%-1rem)] bg-[#0D1425] rounded-2xl p-8 relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-300/5 to-purple-300/5 rounded-2xl"></div>
                                    <div className="relative">
                                        <div className="text-gray-400 text-sm mb-8 leading-relaxed">
                                            Robots are not going to replace humans, they are going to make their jobs much more humane. Difficult, demeaning, demanding, dangerous.
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-300 to-purple-300 flex items-center justify-center text-white font-medium">
                                                EM
                                            </div>
                                            <div className="ml-4">
                                                <h4 className="text-white font-medium">Elon Musk</h4>
                                                <div className="text-gray-400 text-sm">Famous AI Scientist</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="w-[calc(33.333333%-1rem)] bg-[#0D1425] rounded-2xl p-8 relative group">
                                    <div className="absolute inset-0 bg-gradient-to-r from-blue-300/5 to-purple-300/5 rounded-2xl"></div>
                                    <div className="relative">
                                        <div className="text-gray-400 text-sm mb-8 leading-relaxed">
                                            Robots are not going to replace humans, they are going to make their jobs much more humane. Difficult, demeaning,
                                        </div>
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-300 to-purple-300 flex items-center justify-center text-white font-medium">
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
            </div> */}
        </div>
    );
};

export default HeroSection;