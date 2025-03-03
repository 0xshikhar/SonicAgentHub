import { ReactNode } from 'react';
import { Navbar } from '@/components/layout/navbar';
import Link from 'next/link';
import Image from 'next/image';
import DebugInfo from './DebugInfo';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#080B16] via-[#0B1221] to-[#080B16]">
      <Navbar />
      <main className="pt-20">
        {children}
      </main>
      <footer className="border-t border-white/5 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Logo and Description */}
            <div className="col-span-2">
              <div className="flex items-center mb-4">
                <div className="relative w-10 h-10 mr-3">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-50"></div>
                  <div className="relative bg-[#0A0F1E] rounded-lg p-2">
                    <Image src="/logo.svg" alt="Agent chain" width={24} height={24} />
                  </div>
                </div>
                <span className="text-white text-lg font-semibold">Agent chain</span>
              </div>
              <div className="text-gray-400 text-sm leading-relaxed">
                The AI-Powered Autonomous Agent Platform. Empowering digital transformation with autonomous Agent chains.
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-medium mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li><Link href="/listing" className="text-gray-400 hover:text-white text-sm">Browse Agents</Link></li>
                <li><Link href="/dashboard" className="text-gray-400 hover:text-white text-sm">Dashboard</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white text-sm">About Us</Link></li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-medium mb-4">Contact</h3>
              <ul className="space-y-2">
                <li><Link href="#" className="text-gray-400 hover:text-white text-sm">Discord</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white text-sm">Twitter</Link></li>
                <li><Link href="#" className="text-gray-400 hover:text-white text-sm">Telegram</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/5 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <div className="text-gray-400 text-sm mb-4 md:mb-0">
              © {new Date().getFullYear()} Agent chain. All rights reserved.
            </div>
            <div className="flex space-x-6">
              <Link href="#" className="text-gray-400 hover:text-white text-sm">Privacy Policy</Link>
              <Link href="#" className="text-gray-400 hover:text-white text-sm">Terms of Service</Link>
            </div>
          </div>
        </div>
      </footer>
      <DebugInfo />
    </div>
  );
}
