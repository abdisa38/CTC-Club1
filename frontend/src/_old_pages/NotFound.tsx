import Link from "next/link";
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-primary mb-4">404</h1>
          <div className="w-24 h-1 bg-primary mx-auto mb-6"></div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Page Not Found</h2>
          <p className="text-xl text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href=
            className="inline-flex items-center gap-2 px-8 py-4 bg-primary hover:bg-blue-700 text-white rounded-lg font-semibold transition"
          >
            <Home className="w-5 h-5" />
            Go Home
          </Link>
          <Link href=
            className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-primary border-2 border-primary rounded-lg font-semibold transition"
          >
            <Search className="w-5 h-5" />
            Browse Exams
          </Link>
        </div>
      </div>
    </div>
  );
}