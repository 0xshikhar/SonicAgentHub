// pages/index.tsx
import { useState } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function Home() {
    const [email, setEmail] = useState('');
    const router = useRouter();
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Handle email submission logic here
        alert(`Thank you for your interest! We'll keep you updated at ${email}`);
        setEmail('');
    };

    return (
        <div className="min-h-screen flex flex-col">
            <Head>
                <title>Agents Market | AI-Powered Autonomous Agent Platform</title>
                <meta name="description" content="Discover and deploy autonomous AI agents to automate your tasks and workflows" />
                <link rel="icon" href="/favicon.ico" />
            </Head>



            {/* Navigation */}
            <nav className="bg-white shadow-sm py-4">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <div className="flex items-center">
                        <div className="text-2xl font-bold text-indigo-600">AgentsMarket</div>
                    </div>
                    <div className="hidden md:flex space-x-8">
                        <a href="#features" className="text-gray-700 hover:text-indigo-600">Features</a>
                        <a href="#agents" className="text-gray-700 hover:text-indigo-600">Agent Library</a>
                        <a href="#pricing" className="text-gray-700 hover:text-indigo-600">Pricing</a>
                        <a href="#faq" className="text-gray-700 hover:text-indigo-600">FAQ</a>
                    </div>
                    <div>
                        <button className="bg-indigo-600 text-white py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors">
                            Sign Up
                        </button>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 sm:pt-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
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


            {/* Hero Section */}
            <section className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-20">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center">
                        <div className="md:w-1/2 mb-10 md:mb-0">
                            <h1 className="text-4xl md:text-5xl font-bold mb-6">
                                The AI-Powered Autonomous Agent Platform
                            </h1>
                            <p className="text-xl mb-8">
                                Discover, deploy, and manage AI agents that automate your tasks and workflows with human-like intelligence.
                            </p>
                            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4">
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className="px-4 py-3 rounded-lg text-gray-800 w-full sm:w-64"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                                <button
                                    type="submit"
                                    className="bg-white text-indigo-600 font-bold py-3 px-6 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    Join Waitlist
                                </button>
                            </form>
                        </div>
                        <div className="md:w-1/2 flex justify-center">
                            <div className="relative w-full max-w-lg h-64 md:h-96">
                                <div className="absolute top-0 left-0 w-full h-full bg-white/10 backdrop-blur-md rounded-2xl overflow-hidden">
                                    {/* Placeholder for an illustration of agents working */}
                                    <div className="h-full flex items-center justify-center">
                                        <div className="text-6xl">🤖</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-16">Platform Features</h2>

                    <div className="grid md:grid-cols-3 gap-10">
                        <div className="bg-white p-8 rounded-xl shadow-sm">
                            <div className="text-4xl mb-4 text-indigo-600">🔍</div>
                            <h3 className="text-xl font-semibold mb-3">Discover Agents</h3>
                            <p className="text-gray-600">
                                Browse our marketplace of specialized AI agents designed for various tasks and industries.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-sm">
                            <div className="text-4xl mb-4 text-indigo-600">🔄</div>
                            <h3 className="text-xl font-semibold mb-3">Seamless Integration</h3>
                            <p className="text-gray-600">
                                Easily integrate agents with your existing workflows and applications through our API.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-sm">
                            <div className="text-4xl mb-4 text-indigo-600">⚙️</div>
                            <h3 className="text-xl font-semibold mb-3">Customizable Agents</h3>
                            <p className="text-gray-600">
                                Tailor agents to your specific needs with our intuitive configuration interface.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-sm">
                            <div className="text-4xl mb-4 text-indigo-600">📊</div>
                            <h3 className="text-xl font-semibold mb-3">Performance Analytics</h3>
                            <p className="text-gray-600">
                                Monitor your agents' performance and optimize their effectiveness over time.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-sm">
                            <div className="text-4xl mb-4 text-indigo-600">🔒</div>
                            <h3 className="text-xl font-semibold mb-3">Enterprise Security</h3>
                            <p className="text-gray-600">
                                Rest easy with our robust security measures and data privacy controls.
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-xl shadow-sm">
                            <div className="text-4xl mb-4 text-indigo-600">🚀</div>
                            <h3 className="text-xl font-semibold mb-3">Scalable Infrastructure</h3>
                            <p className="text-gray-600">
                                Scale your agent deployments from a few to thousands as your needs grow.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Agent Library Section */}
            <section id="agents" className="py-20">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-16">Agent Library</h2>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                name: "Data Analyst Agent",
                                description: "Processes and analyzes your data, generating insights and visualizations automatically.",
                                icon: "📊"
                            },
                            {
                                name: "Customer Support Agent",
                                description: "Handles customer inquiries with natural language understanding and problem resolution.",
                                icon: "💬"
                            },
                            {
                                name: "Research Assistant",
                                description: "Gathers information from multiple sources to answer complex questions and generate reports.",
                                icon: "🔍"
                            },
                            {
                                name: "Content Creator",
                                description: "Generates blog posts, social media content, and marketing copy based on your brand guidelines.",
                                icon: "✍️"
                            },
                            {
                                name: "DevOps Agent",
                                description: "Monitors systems, detects issues, and implements fixes to maintain operational stability.",
                                icon: "🛠️"
                            },
                            {
                                name: "Sales Prospector",
                                description: "Identifies potential leads and initiates contact with personalized outreach strategies.",
                                icon: "📈"
                            }
                        ].map((agent, index) => (
                            <div key={index} className="border border-gray-200 rounded-xl overflow-hidden hover:shadow-md transition-shadow">
                                <div className="p-6">
                                    <div className="text-4xl mb-4">{agent.icon}</div>
                                    <h3 className="text-xl font-semibold mb-2">{agent.name}</h3>
                                    <p className="text-gray-600 mb-4">{agent.description}</p>
                                    <button className="text-indigo-600 font-medium hover:text-indigo-800">
                                        Learn more →
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <button className="bg-indigo-600 text-white py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors">
                            Explore All Agents
                        </button>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-16">What Our Users Say</h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                quote: "Agents Market has transformed how our team handles routine tasks. We've saved countless hours that we can now dedicate to strategic initiatives.",
                                author: "Sarah Johnson",
                                title: "CTO, TechSolutions Inc."
                            },
                            {
                                quote: "The data analysis agent has become an indispensable member of our research team, processing information at a scale we couldn't achieve before.",
                                author: "Michael Chen",
                                title: "Lead Researcher, HealthTech"
                            },
                            {
                                quote: "Setting up our customer support agent was surprisingly easy, and the ROI has been tremendous. Our satisfaction scores are at an all-time high.",
                                author: "Jessica Williams",
                                title: "Customer Success Manager, E-commerce Plus"
                            }
                        ].map((testimonial, index) => (
                            <div key={index} className="bg-white p-8 rounded-xl shadow-sm">
                                <p className="italic text-gray-600 mb-6">"{testimonial.quote}"</p>
                                <div>
                                    <p className="font-semibold">{testimonial.author}</p>
                                    <p className="text-gray-500 text-sm">{testimonial.title}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-16">Simple, Transparent Pricing</h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {[
                            {
                                plan: "Starter",
                                price: "$49",
                                features: [
                                    "Access to 5 basic agents",
                                    "1,000 agent tasks per month",
                                    "Email support",
                                    "Basic analytics",
                                    "API access"
                                ],
                                isPopular: false
                            },
                            {
                                plan: "Professional",
                                price: "$149",
                                features: [
                                    "Access to all 20+ agents",
                                    "10,000 agent tasks per month",
                                    "Priority support",
                                    "Advanced analytics",
                                    "API access",
                                    "Custom agent configurations"
                                ],
                                isPopular: true
                            },
                            {
                                plan: "Enterprise",
                                price: "Custom",
                                features: [
                                    "Unlimited access to all agents",
                                    "Unlimited agent tasks",
                                    "24/7 dedicated support",
                                    "Enterprise analytics",
                                    "Advanced API access",
                                    "Custom agent development",
                                    "SSO integration"
                                ],
                                isPopular: false
                            }
                        ].map((plan, index) => (
                            <div key={index} className={`border rounded-xl overflow-hidden ${plan.isPopular ? 'border-indigo-600 relative' : 'border-gray-200'}`}>
                                {plan.isPopular && (
                                    <div className="bg-indigo-600 text-white text-center py-1 text-sm font-medium">
                                        Most Popular
                                    </div>
                                )}
                                <div className="p-8">
                                    <h3 className="text-xl font-bold mb-2">{plan.plan}</h3>
                                    <div className="mb-6">
                                        <span className="text-4xl font-bold">{plan.price}</span>
                                        {plan.price !== "Custom" && <span className="text-gray-500">/month</span>}
                                    </div>
                                    <ul className="space-y-3 mb-8">
                                        {plan.features.map((feature, fIndex) => (
                                            <li key={fIndex} className="flex items-start">
                                                <span className="text-green-500 mr-2">✓</span>
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button
                                        className={`w-full py-3 px-6 rounded-lg font-medium ${plan.isPopular
                                            ? 'bg-indigo-600 text-white hover:bg-indigo-700'
                                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                                            } transition-colors`}
                                    >
                                        {plan.price === "Custom" ? "Contact Sales" : "Get Started"}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section id="faq" className="py-20 bg-gray-50">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center mb-16">Frequently Asked Questions</h2>

                    <div className="max-w-3xl mx-auto space-y-8">
                        {[
                            {
                                question: "What are autonomous agents?",
                                answer: "Autonomous agents are AI systems that can perform tasks independently with minimal human supervision. They use advanced machine learning to understand context, make decisions, and take actions to accomplish their assigned goals."
                            },
                            {
                                question: "How do I integrate agents with my existing systems?",
                                answer: "Our platform provides comprehensive API documentation and integration guides. Most agents can be integrated through REST APIs, webhooks, or our SDK available in multiple programming languages."
                            },
                            {
                                question: "Can I customize the agents to fit my specific needs?",
                                answer: "Yes, all our agents can be customized through our intuitive configuration interface. Professional and Enterprise plans also offer deeper customization options and the ability to build custom agents."
                            },
                            {
                                question: "How secure is the platform?",
                                answer: "Security is our top priority. We employ end-to-end encryption, regular security audits, and comply with industry standards like SOC 2 and GDPR. Enterprise plans include additional security features like dedicated environments."
                            },
                            {
                                question: "What kind of support do you offer?",
                                answer: "We provide email support for all plans, with priority support for Professional users and 24/7 dedicated support for Enterprise customers. Our documentation and knowledge base are comprehensive and regularly updated."
                            }
                        ].map((faq, index) => (
                            <div key={index} className="border-b border-gray-200 pb-6">
                                <h3 className="text-xl font-semibold mb-3">{faq.question}</h3>
                                <p className="text-gray-600">{faq.answer}</p>
                            </div>
                        ))}
                    </div>

                    <div className="mt-12 text-center">
                        <p className="mb-4">Still have questions?</p>
                        <button className="bg-indigo-600 text-white py-3 px-8 rounded-lg hover:bg-indigo-700 transition-colors">
                            Contact Support
                        </button>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
                <div className="container mx-auto px-4 text-center">
                    <h2 className="text-3xl font-bold mb-6">Ready to Transform Your Workflow?</h2>
                    <p className="text-xl mb-8 max-w-2xl mx-auto">
                        Join thousands of businesses already using Agents Market to automate tasks and boost productivity.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <button className="bg-white text-indigo-600 font-bold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">
                            Start Free Trial
                        </button>
                        <button className="bg-transparent border-2 border-white text-white font-bold py-3 px-8 rounded-lg hover:bg-white/10 transition-colors">
                            Schedule Demo
                        </button>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-gray-900 text-white py-12">
                <div className="container mx-auto px-4">
                    <div className="grid md:grid-cols-4 gap-8">
                        <div>
                            <div className="text-2xl font-bold mb-4">AgentsMarket</div>
                            <p className="text-gray-400">
                                The future of work is here. Automate, innovate, and scale with AI agents.
                            </p>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-4">Platform</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white">Features</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Agent Library</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Integrations</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Pricing</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-4">Resources</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white">Documentation</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">API Reference</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Case Studies</a></li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-semibold text-lg mb-4">Company</h3>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Careers</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                                <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
                        <div className="text-gray-400 mb-4 md:mb-0">
                            &copy; {new Date().getFullYear()} Agents Market. All rights reserved.
                        </div>
                        <div className="flex space-x-6">
                            <a href="#" className="text-gray-400 hover:text-white">
                                <span className="sr-only">Twitter</span>
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                                </svg>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white">
                                <span className="sr-only">LinkedIn</span>
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                                </svg>
                            </a>
                            <a href="#" className="text-gray-400 hover:text-white">
                                <span className="sr-only">GitHub</span>
                                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                                </svg>
                            </a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}