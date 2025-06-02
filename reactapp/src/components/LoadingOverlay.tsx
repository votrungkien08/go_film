import { useEffect, useState } from 'react';

const LoadingOverlay = ({ onLoadingComplete }) => {
  const [isExpanding, setIsExpanding] = useState(false);
  const [isSplitting, setIsSplitting] = useState(false);

  useEffect(() => {
    // Bắt đầu hiệu ứng kéo dài thanh dọc
    const expandTimer = setTimeout(() => {
      setIsExpanding(true);
    }, 100);

    // Sau khi thanh kéo dài xong (1 giây), bắt đầu hiệu ứng tách
    const splitTimer = setTimeout(() => {
      setIsSplitting(true);
    }, 1100);

    // Sau khi tách xong (1 giây nữa), gọi onLoadingComplete
    const completeTimer = setTimeout(() => {
      onLoadingComplete();
    }, 2100);

    return () => {
      clearTimeout(expandTimer);
      clearTimeout(splitTimer);
      clearTimeout(completeTimer);
    };
  }, [onLoadingComplete]);

  return (
    <div className="fixed top-0 left-0 w-full h-full flex justify-center items-center z-50">
      {/* Background hồng được tách làm 2 phần */}
      <div
        className={`absolute top-0 left-0 w-1/2 h-full bg-[rgba(180,166,173,0.7)] transition-transform duration-1000 ${
          isSplitting ? '-translate-x-full' : 'translate-x-0'
        }`}
      />
      <div
        className={`absolute top-0 right-0 w-1/2 h-full bg-[rgba(180,166,173,0.7)] transition-transform duration-1000 ${
          isSplitting ? 'translate-x-full' : 'translate-x-0'
        }`}
      />

      {/* Thanh dọc ở giữa */}
      <div
        className={`w-1 bg-black transition-all duration-1000 ${
          isExpanding ? 'h-full' : 'h-24'
        } ${isSplitting ? 'opacity-0' : 'opacity-100'}`}
      />
    </div>
  );
};

export default LoadingOverlay;