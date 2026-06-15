"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-dark-900 text-white font-sans selection:bg-primary-500/30">
      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? "bg-dark-900/80 backdrop-blur-md border-b border-dark-800 py-4" : "bg-transparent py-6"}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="Strantchar" className="w-8 h-8 object-contain" />
            <span className="font-display font-bold text-xl tracking-tight">Strantchar</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-300">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How it works</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
          </div>

          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/login" className="text-sm font-medium bg-primary-500 hover:bg-primary-600 text-white px-5 py-2.5 rounded-full transition-all shadow-lg shadow-primary-500/20">
              Sign In
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-500/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary-400/10 border border-primary-400/20 text-primary-300 text-xs font-medium mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-300 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-400"></span>
              </span>
              Strantchar is now live in the US
            </div>
            
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight leading-[1.1] mb-6">
              Banking, but <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-300 to-primary-600">without the bank.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              No hidden fees. No paperwork. Just a seamless, beautifully designed financial experience right in your pocket. 
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login" className="w-full sm:w-auto px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-full font-medium transition-all shadow-xl shadow-primary-500/20 text-lg flex items-center justify-center gap-2">
                Sign In to Dashboard
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </Link>
            </div>
            <p className="text-sm text-gray-500 mt-6">Get $100 welcome bonus upon onboarding</p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-10 border-y border-dark-800 bg-dark-900/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-dark-800">
            <div className="text-center px-4">
              <p className="text-3xl md:text-4xl font-display font-bold text-white mb-2">1M+</p>
              <p className="text-sm text-gray-400 uppercase tracking-wider font-medium">Active Users</p>
            </div>
            <div className="text-center px-4">
              <p className="text-3xl md:text-4xl font-display font-bold text-white mb-2">$5B+</p>
              <p className="text-sm text-gray-400 uppercase tracking-wider font-medium">Processed</p>
            </div>
            <div className="text-center px-4">
              <p className="text-3xl md:text-4xl font-display font-bold text-white mb-2">99.9%</p>
              <p className="text-sm text-gray-400 uppercase tracking-wider font-medium">Uptime</p>
            </div>
            <div className="text-center px-4">
              <p className="text-3xl md:text-4xl font-display font-bold text-white mb-2">24/7</p>
              <p className="text-sm text-gray-400 uppercase tracking-wider font-medium">Support</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">Everything you need to manage your money</h2>
            <p className="text-gray-400 text-lg">We've rebuilt banking from the ground up to give you the features you actually care about.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-dark-800/50 border border-dark-700 p-8 rounded-3xl hover:bg-dark-800 transition-colors">
              <div className="w-12 h-12 bg-primary-500/20 text-primary-400 rounded-xl flex items-center justify-center text-2xl mb-6">
                <span className="material-symbols-outlined text-[2rem]">bolt</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Transfers</h3>
              <p className="text-gray-400 leading-relaxed">Send money to any Strantchar user instantly, for free. Funds arrive in their account before you close the app.</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-dark-800/50 border border-dark-700 p-8 rounded-3xl hover:bg-dark-800 transition-colors">
              <div className="w-12 h-12 bg-purple-500/20 text-purple-400 rounded-xl flex items-center justify-center text-2xl mb-6">
                <span className="material-symbols-outlined text-[2rem]">credit_card</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Virtual Cards</h3>
              <p className="text-gray-400 leading-relaxed">Generate virtual debit cards for secure online shopping. Freeze or delete them instantly with one tap.</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-dark-800/50 border border-dark-700 p-8 rounded-3xl hover:bg-dark-800 transition-colors">
              <div className="w-12 h-12 bg-blue-500/20 text-blue-400 rounded-xl flex items-center justify-center text-2xl mb-6">
                <span className="material-symbols-outlined text-[2rem]">payments</span>
              </div>
              <h3 className="text-xl font-bold mb-3">Instant Loans</h3>
              <p className="text-gray-400 leading-relaxed">Need extra cash? Apply for a loan and get approved in minutes. Low interest rates and flexible terms.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-24 bg-dark-950">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-400/10 border border-primary-400/20 text-primary-300 text-sm font-medium mb-6">
                Bank-Grade Security
              </div>
              <h2 className="text-3xl md:text-5xl font-display font-bold mb-6 leading-tight">Your money is safe with us.</h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-primary-400/20 flex items-center justify-center text-primary-400 shrink-0"><span className="material-symbols-outlined text-[1rem]">check</span></div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">Two-Factor Authentication</h4>
                    <p className="text-gray-400">Every login requires an OTP sent to your email, ensuring nobody but you can access your account.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-primary-400/20 flex items-center justify-center text-primary-400 shrink-0"><span className="material-symbols-outlined text-[1rem]">check</span></div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">End-to-End Encryption</h4>
                    <p className="text-gray-400">All data and transactions are encrypted using industry-standard AES-256 encryption.</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="mt-1 w-6 h-6 rounded-full bg-primary-400/20 flex items-center justify-center text-primary-400 shrink-0"><span className="material-symbols-outlined text-[1rem]">check</span></div>
                  <div>
                    <h4 className="font-bold text-lg mb-1">FDIC Insured</h4>
                    <p className="text-gray-400">Your deposits are insured up to $250,000 through our partner banks.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex-1 w-full max-w-md relative">
              <div className="absolute inset-0 bg-primary-500/20 blur-[100px] rounded-full" />
              <div className="relative bg-dark-800 border border-dark-600 rounded-3xl p-6 shadow-2xl">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-dark-700 rounded-xl flex items-center justify-center text-2xl"><span className="material-symbols-outlined">mail</span></div>
                  <div>
                    <p className="font-medium text-white">Verification Code</p>
                    <p className="text-sm text-gray-400">Sent to your email</p>
                  </div>
                </div>
                <div className="flex justify-between gap-2 mb-6">
                  {[4, 8, 2, 9, 1, 5].map((num, i) => (
                    <div key={i} className="w-12 h-14 bg-dark-900 border border-primary-500 rounded-lg flex items-center justify-center text-xl font-mono font-bold text-white shadow-[0_0_15px_rgba(2,132,168,0.3)]">
                      {num}
                    </div>
                  ))}
                </div>
                <button className="w-full py-3 bg-primary-500 text-white font-medium rounded-xl opacity-50 cursor-not-allowed">
                  Verify & Sign In
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary-500/10" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">Ready to upgrade your banking?</h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">Join thousands of users who have already switched to Strantchar.</p>
          <Link href="/login" className="inline-flex px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-full font-medium transition-all shadow-xl shadow-primary-500/20 text-lg items-center gap-2">
            Sign In Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-950 py-12 border-t border-dark-800">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 md:col-span-1">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-6 h-6 bg-primary-500 rounded flex items-center justify-center">
                  <svg width="12" height="12" fill="white" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
                  </svg>
                </div>
                <span className="font-display font-bold text-lg">Strantchar</span>
              </div>
              <p className="text-sm text-gray-500">The modern way to manage your money. Fast, secure, and built for the future.</p>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="#features" className="hover:text-primary-400 transition-colors">Features</Link></li>
                <li><Link href="/login" className="hover:text-primary-400 transition-colors">Cards</Link></li>
                <li><Link href="/login" className="hover:text-primary-400 transition-colors">Loans</Link></li>
                <li><Link href="/login" className="hover:text-primary-400 transition-colors">Transfers</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><a href="#" className="hover:text-primary-400 transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-primary-400 transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-500">
                <li><Link href="/terms" className="hover:text-primary-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-primary-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="/security" className="hover:text-primary-400 transition-colors">Security</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-dark-800 text-center text-sm text-gray-600">
            &copy; {new Date().getFullYear()} Strantchar Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
