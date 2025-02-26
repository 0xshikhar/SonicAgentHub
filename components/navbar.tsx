import { useState } from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { ConnectButton } from "@rainbow-me/rainbowkit";


const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Agents', href: '/agents' },
  { name: 'Main', href: '/main' },
];

export default function Navbar() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-[#0A0F1E]/80 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-50 group-hover:opacity-75 transition duration-200"></div>
                <div className="relative flex items-center bg-[#0A0F1E] rounded-lg p-2">
                  <Image
                    src="/logo.svg"
                    alt="Agent Chain Logo"
                    width={40}
                    height={40}
                    className="mr-3"
                  />
                  <span className="text-white text-xl font-semibold">Agent Chain</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`text-base font-medium transition-colors duration-200 ${
                  router.pathname === item.href
                    ? 'text-white'
                    : 'text-gray-300 hover:text-white'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/agents/create')}
              className="relative group hidden md:block"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-200"></div>
              <div className="relative px-6 py-2 bg-[#0A0F1E] rounded-lg text-white group-hover:bg-[#131B31] transition duration-200">
                Add Your Agent
              </div>
            </button>

            {/* New Login Button */}
            {/* <button
              className="relative px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:opacity-90 transition-opacity"
            >
              Login
            </button> */}
            <ConnectButton />
            
            {/* Mobile Menu Button */}
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden relative w-10 h-10 bg-[#131B31] rounded-lg flex items-center justify-center text-gray-400 hover:text-white transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'} border-t border-white/5`}>
        <div className="px-4 pt-2 pb-3 space-y-1 bg-[#0A0F1E]/95 backdrop-blur-md">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`block px-3 py-2 rounded-lg text-base font-medium ${
                router.pathname === item.href
                  ? 'text-white bg-[#131B31]'
                  : 'text-gray-300 hover:text-white hover:bg-[#131B31]'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {item.name}
            </Link>
          ))}
          <button
            onClick={() => {
              router.push('/agents/create');
              setIsMobileMenuOpen(false);
            }}
            className="w-full mt-2 px-3 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
          >
            Add Your Agent
          </button>
        </div>
      </div>
    </nav>
  );
}
