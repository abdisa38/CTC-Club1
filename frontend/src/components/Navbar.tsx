"use client";

import Link from "next/link";
import { Trophy, Menu, X } from 'lucide-react';
import { useState } from 'react';

interface NavbarProps {
  isLoggedIn?: boolean;
  userRole?: 'student' | 'admin' | 'encoder';
}

export default function Navbar({ isLoggedIn = false, userRole }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* Main Navigation */}
      <nav className="bg-black text-white border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Ofijan</span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-6">
              {!isLoggedIn ? (
                <>
                  <Link href="/" className="hover:text-primary transition">
                    Home
                  </Link>
                  <Link href="/exams" className="hover:text-primary transition">
                    Browse Exams
                  </Link>
                  <Link href="/scholarships" className="hover:text-primary transition">
                    Scholarships
                  </Link>
                  <Link href="/leaderboard" className="hover:text-primary transition">
                    Leaderboard
                  </Link>
                  <Link
                    href="/login"
                    className="px-4 py-2 hover:text-primary transition"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 bg-primary hover:bg-blue-700 rounded-lg transition"
                  >
                    Register
                  </Link>
                </>
              ) : (
                <>
                  {userRole === 'student' && (
                    <>
                      <Link href="/student/dashboard" className="hover:text-primary transition">
                        Dashboard
                      </Link>
                      <Link href="/student/exams" className="hover:text-primary transition">
                        Exams
                      </Link>
                      <Link href="/scholarships" className="hover:text-primary transition">
                        Scholarships
                      </Link>
                      <Link href="/leaderboard" className="hover:text-primary transition">
                        Leaderboard
                      </Link>
                    </>
                  )}
                  {userRole === 'admin' && (
                    <>
                      <Link href="/admin/dashboard" className="hover:text-primary transition">
                        Dashboard
                      </Link>
                      <Link href="/admin/exams" className="hover:text-primary transition">
                        Exams
                      </Link>
                      <Link href="/admin/questions" className="hover:text-primary transition">
                        Questions
                      </Link>
                      <Link href="/admin/gaming-questions" className="hover:text-primary transition">
                        Gaming
                      </Link>
                      <Link href="/admin/feedback" className="hover:text-primary transition">
                        Feedback
                      </Link>
                    </>
                  )}
                  {userRole === 'encoder' && (
                    <Link href="/encoder/dashboard" className="hover:text-primary transition">
                      Dashboard
                    </Link>
                  )}
                  <button className="px-4 py-2 bg-primary hover:bg-red-700 rounded-lg transition">
                    Logout
                  </button>
                </>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/10">
            <div className="px-4 py-4 space-y-3">
              {!isLoggedIn ? (
                <>
                  <Link
                    href="/"
                    className="block py-2 hover:text-primary transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link
                    href="/exams"
                    className="block py-2 hover:text-primary transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Browse Exams
                  </Link>
                  <Link
                    href="/scholarships"
                    className="block py-2 hover:text-primary transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Scholarships
                  </Link>
                  <Link
                    href="/leaderboard"
                    className="block py-2 hover:text-primary transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Leaderboard
                  </Link>
                  <Link
                    href="/login"
                    className="block py-2 hover:text-primary transition"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="block py-2 px-4 bg-primary hover:bg-blue-700 rounded-lg transition text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              ) : (
                <>
                  {userRole === 'student' && (
                    <>
                      <Link
                        href="/student/dashboard"
                        className="block py-2 hover:text-primary transition"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        href="/student/exams"
                        className="block py-2 hover:text-primary transition"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Exams
                      </Link>
                      <Link
                        href="/scholarships"
                        className="block py-2 hover:text-primary transition"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Scholarships
                      </Link>
                      <Link
                        href="/leaderboard"
                        className="block py-2 hover:text-primary transition"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Leaderboard
                      </Link>
                    </>
                  )}
                  <button className="w-full py-2 px-4 bg-primary hover:bg-red-700 rounded-lg transition text-center">
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}