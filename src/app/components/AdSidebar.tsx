import { Link } from 'react-router';
import { ExternalLink, X } from 'lucide-react';
import { useState } from 'react';
import { getActiveAds } from '../data/mockData';

export default function AdSidebar() {
  const [dismissedAds, setDismissedAds] = useState<string[]>([]);
  const activeAds = getActiveAds().filter(ad => !dismissedAds.includes(ad.id));

  const dismissAd = (adId: string) => {
    setDismissedAds([...dismissedAds, adId]);
  };

  if (activeAds.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Sidebar Title */}
      <div className="bg-gradient-to-br from-primary to-red-700 rounded-xl p-4 text-white">
        <h3 className="font-bold text-lg">Sponsored</h3>
        <p className="text-sm text-white/80">Featured opportunities for you</p>
      </div>

      {/* Ad Cards */}
      {activeAds.map((ad) => (
        <div
          key={ad.id}
          className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-all group relative"
        >
          {/* Dismiss Button */}
          <button
            onClick={() => dismissAd(ad.id)}
            className="absolute top-2 right-2 z-10 w-6 h-6 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition opacity-0 group-hover:opacity-100"
            aria-label="Dismiss ad"
          >
            <X className="w-4 h-4 text-white" />
          </button>

          {/* Ad Image */}
          <div className="relative h-32 overflow-hidden bg-gray-200">
            <img
              src={ad.imageUrl}
              alt={ad.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </div>

          {/* Ad Content */}
          <div className="p-4">
            <h4 className="font-bold text-black mb-1 text-sm">{ad.title}</h4>
            <p className="text-xs text-gray-600 mb-3 line-clamp-2">{ad.description}</p>

            {/* CTA Button */}
            {ad.link.startsWith('http') ? (
              <a
                href={ad.link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-primary hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition"
              >
                Learn More
                <ExternalLink className="w-3 h-3" />
              </a>
            ) : (
              <Link
                to={ad.link}
                className="flex items-center justify-center gap-2 w-full py-2 px-3 bg-primary hover:bg-red-700 text-white rounded-lg text-xs font-semibold transition"
              >
                Learn More
              </Link>
            )}

            {/* Expiry Info */}
            <p className="text-xs text-gray-400 mt-2 text-center">
              Expires: {new Date(ad.expiryDate).toLocaleDateString()}
            </p>
          </div>
        </div>
      ))}

      {/* Ad Info */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
        <p className="text-xs text-gray-600 text-center">
          These ads help us provide free educational content. Click the × to dismiss.
        </p>
      </div>
    </div>
  );
}
