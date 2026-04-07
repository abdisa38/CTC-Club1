"use client";

import Link from "next/link";
import { Trophy, Mail, MessageCircle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Trophy className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">Ofijan</span>
            </div>
            <p className="text-sm text-gray-400">
              Learn. Test. Compete.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/" className="hover:text-primary transition">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/scholarships" className="hover:text-primary transition">
                  Scholarships
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="hover:text-primary transition">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-primary transition">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-primary transition">
                  Register
                </Link>
              </li>
            </ul>
          </div>

          {/* Exam Categories */}
          <div>
            <h4 className="font-semibold mb-4">Exam Categories</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>
                <Link href="/category/grade-6" className="hover:text-primary transition">
                  Grade 6
                </Link>
              </li>
              <li>
                <Link href="/category/grade-8" className="hover:text-primary transition">
                  Grade 8
                </Link>
              </li>
              <li>
                <Link href="/category/mock-exam" className="hover:text-primary transition">
                  Mock Exams
                </Link>
              </li>
              <li>
                <Link href="/category/exit-exam" className="hover:text-primary transition">
                  Exit Exams
                </Link>
              </li>
              <li>
                <Link href="/category/euee" className="hover:text-primary transition">
                  EUEE Exams
                </Link>
              </li>
              <li>
                <Link href="/category/gat" className="hover:text-primary transition">
                  GAT
                </Link>
              </li>
              <li>
                <Link href="/category/coc" className="hover:text-primary transition">
                  COC Exams
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>info@ofijan.com</span>
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle className="w-4 h-4" />
                <span>@ofijan_telegram</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-white/10 text-center text-sm text-gray-400">
          <p>&copy; 2026 Ofijan. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}