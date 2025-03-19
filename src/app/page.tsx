import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center px-4 py-16 bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:to-slate-800 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
          Family Gacha THR App
        </h1>
        <p className="text-xl md:text-2xl mb-8 max-w-2xl text-slate-700 dark:text-slate-300">
          Add fun to your family events with interactive games and rewards
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/game">
            <Button size="lg" className="px-8">Join a Game</Button>
          </Link>
          <Link href="/dashboard">
            <Button variant="outline" size="lg" className="px-8">Create an Event</Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-16 px-4 bg-white dark:bg-slate-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-slate-50 dark:bg-slate-700">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-blue-600 dark:text-blue-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 0 1 9 14.437V9.564Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Gacha Wheel</h3>
              <p className="text-slate-600 dark:text-slate-300">Spin the wheel for random rewards and exciting prizes</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-slate-50 dark:bg-slate-700">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-purple-600 dark:text-purple-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Trivia Games</h3>
              <p className="text-slate-600 dark:text-slate-300">Test knowledge with customizable trivia questions for all ages</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow bg-slate-50 dark:bg-slate-700">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-green-600 dark:text-green-300">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 11.25v8.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 1 0 9.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1 1 14.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Digital Rewards</h3>
              <p className="text-slate-600 dark:text-slate-300">Manage and distribute digital rewards to participants</p>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="py-16 px-4 bg-slate-50 dark:bg-slate-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold mb-4">1</div>
              <h3 className="text-xl font-semibold mb-2">Create an Event</h3>
              <p className="text-slate-600 dark:text-slate-400">Sign up and create a new event with custom games and prizes</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold mb-4">2</div>
              <h3 className="text-xl font-semibold mb-2">Invite Participants</h3>
              <p className="text-slate-600 dark:text-slate-400">Share the game code or QR code with family members</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-full bg-blue-500 text-white flex items-center justify-center text-xl font-bold mb-4">3</div>
              <h3 className="text-xl font-semibold mb-2">Play & Win</h3>
              <p className="text-slate-600 dark:text-slate-400">Enjoy interactive games and win exciting rewards</p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 px-4 bg-blue-600 dark:bg-blue-800 text-white text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-xl mb-8">Create an event for your next family gathering today!</p>
          <Link href="/signup">
            <Button variant="secondary" size="lg" className="px-8">Create Account</Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-8 px-4 bg-slate-800 text-slate-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm">© 2025 Family Gacha THR App. All rights reserved.</p>
          </div>
          <div className="flex gap-6">
            <Link href="/about" className="hover:text-white">About</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
