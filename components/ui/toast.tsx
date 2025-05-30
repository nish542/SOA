'use client';

import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

interface ToastProps {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'info';
  onRemove: (id: string) => void;
}

export function Toast({ id, title, description, type, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(id), 300); // Wait for fade out animation
    }, 4700);

    return () => clearTimeout(timer);
  }, [id, onRemove]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }[type];

  if (!isVisible) return null;

  return (
    <div
      className={`${bgColor} text-white p-4 rounded-lg shadow-lg mb-4 transition-opacity duration-300 ease-in-out`}
    >
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{title}</h3>
          {description && <p className="text-sm mt-1">{description}</p>}
        </div>
        <button
          onClick={() => onRemove(id)}
          className="ml-4 text-white hover:text-gray-200 transition-colors"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
} 