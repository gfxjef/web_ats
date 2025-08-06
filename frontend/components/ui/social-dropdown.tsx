"use client";

import { Share2, Facebook, Instagram, Music } from "lucide-react";
import { useState, useRef, useEffect } from "react";

interface SocialDropdownProps {
  className?: string;
}

const socialLinks = [
  {
    id: 1,
    name: "Facebook",
    url: "https://www.facebook.com/atusaludperu",
    icon: Facebook,
    color: "text-blue-600",
    bgColor: "bg-blue-50",
    description: "@atusaludperu"
  },
  {
    id: 2,
    name: "Instagram", 
    url: "https://www.instagram.com/atusaludpe/",
    icon: Instagram,
    color: "text-pink-600",
    bgColor: "bg-pink-50",
    description: "@atusaludpe"
  },
  {
    id: 3,
    name: "TikTok",
    url: "https://www.tiktok.com/@atusaludpe",
    icon: Music,
    color: "text-gray-900",
    bgColor: "bg-gray-50",
    description: "@atusaludpe"
  }
];

export function SocialDropdown({ className = "" }: SocialDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSocialClick = (url: string, name: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200 group"
        aria-label="Redes sociales"
      >
        <Share2 className={`w-5 h-5 text-gray-700 transition-transform duration-200 ${isOpen ? 'rotate-180' : 'group-hover:scale-110'}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-56 sm:w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center space-x-2">
              <Share2 className="w-5 h-5 text-gray-700" />
              <h3 className="font-semibold text-gray-900">Síguenos</h3>
            </div>
            <p className="text-sm text-gray-600 mt-1">Conecta con nosotros</p>
          </div>

          {/* Social Links */}
          <div className="py-2">
            {socialLinks.map((social) => (
              <button
                key={social.id}
                onClick={() => handleSocialClick(social.url, social.name)}
                className="w-full flex items-center px-4 py-3 hover:bg-gray-50 transition-colors duration-150 group"
              >
                <div className={`w-10 h-10 ${social.bgColor} rounded-full flex items-center justify-center mr-3 group-hover:scale-105 transition-transform duration-150`}>
                  <social.icon className={`w-5 h-5 ${social.color}`} />
                </div>
                <div className="flex-1 text-left">
                  <div className="font-medium text-gray-900 group-hover:text-gray-700">
                    {social.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {social.description}
                  </div>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                </div>
              </button>
            ))}
          </div>

          {/* Footer */}
          <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              ¡Mantente al día con nuestras ofertas!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}