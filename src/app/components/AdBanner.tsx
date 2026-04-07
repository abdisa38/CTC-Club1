interface AdBannerProps {
  position: 'top' | 'sidebar' | 'in-content';
  className?: string;
}

export default function AdBanner({ position, className = '' }: AdBannerProps) {
  const getAdDimensions = () => {
    switch (position) {
      case 'top':
        return 'h-24 md:h-32';
      case 'sidebar':
        return 'h-64';
      case 'in-content':
        return 'h-48';
      default:
        return 'h-32';
    }
  };

  return (
    <div className={`${getAdDimensions()} bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center ${className}`}>
      <div className="text-center">
        <p className="text-gray-500 font-medium text-sm">Advertisement</p>
        <p className="text-gray-400 text-xs mt-1">
          {position === 'top' && 'Top Banner Ad (728x90 or 970x90)'}
          {position === 'sidebar' && 'Sidebar Ad (300x250 or 300x600)'}
          {position === 'in-content' && 'In-Content Ad (336x280)'}
        </p>
      </div>
    </div>
  );
}
