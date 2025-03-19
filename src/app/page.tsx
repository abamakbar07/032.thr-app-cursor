import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center px-4 py-24 overflow-hidden bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 text-center">
        {/* Background pattern */}
        <div className="absolute inset-0 z-0 opacity-10">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-32 -right-24 w-96 h-96 bg-cyan-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-24 left-24 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="relative z-10">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500 animate-fade-in-up">
            Family Gacha THR App
          </h1>
          <p className="text-xl md:text-2xl mb-10 max-w-2xl mx-auto text-slate-700 dark:text-slate-300 animate-fade-in-up animation-delay-300">
            Add fun to your family events with interactive games and rewards
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up animation-delay-600">
            <Link href="/game/join">
              <Button 
                size="lg" 
                className="px-8 py-4 shadow-lg hover:shadow-blue-500/20 transition-all duration-300"
              >
                Join a Game
              </Button>
            </Link>
            <Link href="/dashboard/rooms/new">
              <Button 
                variant="outline" 
                size="lg" 
                className="px-8 py-4 hover:bg-blue-50 dark:hover:bg-slate-700 transition-all duration-300"
              >
                Create Game Room
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4 bg-white dark:bg-slate-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-900 dark:text-white">Features</h2>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-16 max-w-xl mx-auto">Designed to create memorable experiences for your family events</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-8 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 bg-slate-50 dark:bg-slate-700 group hover:scale-105 hover:bg-gradient-to-b hover:from-blue-50 hover:to-white dark:hover:from-slate-700 dark:hover:to-slate-800">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-600 dark:text-blue-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 0 1 9 14.437V9.564Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Gacha Wheel</h3>
              <p className="text-slate-600 dark:text-slate-300">Spin the wheel for random rewards and exciting prizes</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-8 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 bg-slate-50 dark:bg-slate-700 group hover:scale-105 hover:bg-gradient-to-b hover:from-purple-50 hover:to-white dark:hover:from-slate-700 dark:hover:to-slate-800">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-purple-600 dark:text-purple-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Trivia Games</h3>
              <p className="text-slate-600 dark:text-slate-300">Test knowledge with customizable trivia questions for all ages</p>
            </div>
            
            <div className="flex flex-col items-center text-center p-8 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 bg-slate-50 dark:bg-slate-700 group hover:scale-105 hover:bg-gradient-to-b hover:from-green-50 hover:to-white dark:hover:from-slate-700 dark:hover:to-slate-800">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-green-600 dark:text-green-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">Digital Rewards</h3>
              <p className="text-slate-600 dark:text-slate-300">Manage and distribute digital rewards to participants</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-4 bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-green-500"></div>
        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-slate-900 dark:text-white">How It Works</h2>
          <p className="text-center text-slate-600 dark:text-slate-400 mb-16 max-w-xl mx-auto">Three simple steps to get started with your family event</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {/* Connection line */}
            <div className="hidden md:block absolute top-16 left-[calc(16.6%+1rem)] right-[calc(16.6%+1rem)] h-1 bg-blue-200 dark:bg-blue-800 z-0"></div>
            
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold mb-6 shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:scale-110">1</div>
              <h3 className="text-xl font-semibold mb-3">Create Game Room</h3>
              <p className="text-slate-600 dark:text-slate-400">Sign up and create a new game room with custom games and prizes</p>
            </div>
            
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold mb-6 shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:scale-110">2</div>
              <h3 className="text-xl font-semibold mb-3">Invite Participants</h3>
              <p className="text-slate-600 dark:text-slate-400">Share the room code or QR code with family members</p>
            </div>
            
            <div className="flex flex-col items-center text-center relative z-10">
              <div className="w-16 h-16 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold mb-6 shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:scale-110">3</div>
              <h3 className="text-xl font-semibold mb-3">Play & Win</h3>
              <p className="text-slate-600 dark:text-slate-400">Enjoy interactive games and win exciting rewards</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-600 to-blue-800 dark:from-blue-800 dark:to-blue-900 text-white text-center relative overflow-hidden">
        {/* Background elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-3xl mx-auto relative z-10">
          <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to get started?</h2>
          <p className="text-xl mb-10 text-blue-100">Create a game room for your next family gathering today!</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/dashboard/rooms/new">
              <Button 
                variant="secondary" 
                size="lg" 
                className="px-10 py-4 shadow-lg hover:shadow-white/20 transition-all duration-300 transform hover:scale-105"
              >
                Create Game Room
              </Button>
            </Link>
            <Link href="/game/join">
              <Button 
                variant="outline" 
                size="lg" 
                className="px-10 py-4 shadow-lg border-white text-white hover:bg-white/10 transition-all duration-300 transform hover:scale-105"
              >
                Join Existing Room
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
