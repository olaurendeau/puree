'use client';

import { useEffect, useState } from 'react';

type ToastProps = {
  message: string;
  duration?: number;
  onClose: () => void;
};

export const Toast = ({ message, duration = 5000, onClose }: ToastProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Attendre la fin de l'animation avant de supprimer
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  return (
    <div
      className={`fixed bottom-[4.5rem] left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 md:max-w-md bg-purple-500 text-white px-4 py-3 rounded-lg shadow-lg transition-all duration-300 z-[9999] ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      role="alert"
    >
      <div className="flex items-center gap-3">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="currentColor"
          stroke="none"
          aria-hidden="true"
          className="flex-shrink-0"
        >
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
        <p className="text-sm md:text-base">{message}</p>
      </div>
    </div>
  );
}; 