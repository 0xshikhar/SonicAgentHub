import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { FeatureIcon } from '@/components/FeatureIcons';
import HeroSection from '@/components/Hero';
import HeroAnimation from '@/components/HeroAnimation';
import { showToast } from '@/lib/toast';

export default function HomePage() {
  const router = useRouter();
  const { auth } = router.query;

  useEffect(() => {
    // Show toast if redirected from a protected route
    if (auth === 'required') {
      showToast.error('Please connect your wallet to access this page');
      
      // Remove the query parameter to prevent showing the toast again on refresh
      const { pathname } = router;
      router.replace(pathname, undefined, { shallow: true });
    }
  }, [auth, router]);

  return (
    <div className="min-h-screen w-full bg-[#050A14] relative overflow-hidden">
      {/* Background gradient effect */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0A0F1E] to-[#050A14]"></div>

      {/* Animated particle background */}
      <div className="absolute inset-0 opacity-30">
        <HeroAnimation />
      </div>
      
      {/* Animated Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0F1E] via-[#162449] to-[#0A0F1E]">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-cyan-500 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      <HeroSection />


      {/* <div className="relative border-t border-white/5">
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
      </div> */}

    </div>
  );
}
