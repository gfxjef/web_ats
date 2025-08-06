"use client";

import { Menu, X, MapPin, Facebook, Instagram, Music, MessageCircle } from "lucide-react";
import { useState } from "react";

interface HamburgerMenuProps {
  className?: string;
}

export function HamburgerMenu({ className = "" }: HamburgerMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentView, setCurrentView] = useState<'menu' | 'locations'>('menu');

  const socialLinks = [
    {
      id: 1,
      name: "WhatsApp",
      url: "https://wa.me/51938101013",
      icon: MessageCircle,
      color: "text-green-600",
      bgColor: "bg-green-50 hover:bg-green-100",
      description: "938 101 013"
    },
    {
      id: 2,
      name: "Facebook",
      url: "https://www.facebook.com/atusaludperu",
      icon: Facebook,
      color: "text-blue-600",
      bgColor: "bg-blue-50 hover:bg-blue-100",
      description: "@atusaludperu"
    },
    {
      id: 3,
      name: "Instagram", 
      url: "https://www.instagram.com/atusaludpe/",
      icon: Instagram,
      color: "text-pink-600",
      bgColor: "bg-pink-50 hover:bg-pink-100",
      description: "@atusaludpe"
    },
    {
      id: 4,
      name: "TikTok",
      url: "https://www.tiktok.com/@atusaludpe",
      icon: Music,
      color: "text-gray-900",
      bgColor: "bg-gray-50 hover:bg-gray-100",
      description: "@atusaludpe"
    }
  ];

  const locations = [
    {
      id: 1,
      name: "Sede Bayóvar",
      address: "San Juan de Lurigancho, Lima",
      mapUrl: "https://maps.app.goo.gl/Xgn8HXiJyLv5sjKU9",
      hours: "Lun - Sab: 9:00 AM - 11:50 PM",
      phone: "+51 938 101 013"
    },
    {
      id: 2,
      name: "Sede Jardines", 
      address: "San Juan de Lurigancho, Lima",
      mapUrl: "https://maps.app.goo.gl/pb7iNKYb23LVbNUQ7",
      hours: "Lun - Sab: 9:00 AM - 11:50 PM",
      phone: "+51 9381 101 013"
    }
  ];

  const handleSocialClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const handleLocationClick = (mapUrl: string) => {
    window.open(mapUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  const closeModal = () => {
    setIsOpen(false);
    setCurrentView('menu');
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="flex flex-col items-center justify-center w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors duration-200 group relative"
        aria-label="Menú"
      >
        <div className="w-5 flex flex-col items-center justify-center space-y-1">
          <div className="w-4 h-0.5 bg-gray-700 rounded-full transition-all duration-200 ease-in-out group-hover:w-5"></div>
          <div className="w-5 h-0.5 bg-gray-700 rounded-full transition-all duration-200 ease-in-out"></div>
          <div className="w-3 h-0.5 bg-gray-700 rounded-full transition-all duration-200 ease-in-out group-hover:w-5"></div>
        </div>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm max-h-[80vh] overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  {currentView === 'menu' ? (
                    <Menu className="w-5 h-5 text-orange-600" />
                  ) : (
                    <MapPin className="w-5 h-5 text-orange-600" />
                  )}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    {currentView === 'menu' ? 'Menú' : 'Nuestras Sedes'}
                  </h2>
                  <p className="text-sm text-gray-600">
                    {currentView === 'menu' ? 'Conecta con nosotros' : 'Visítanos'}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors duration-200"
                aria-label="Cerrar"
              >
                <X className="w-4 h-4 text-gray-600" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {currentView === 'menu' ? (
                // Menu View
                <div className="space-y-3">
                  {/* Social Links */}
                  {socialLinks.map((social) => (
                    <button
                      key={social.id}
                      onClick={() => handleSocialClick(social.url)}
                      className={`w-full flex items-center p-3 rounded-xl ${social.bgColor} transition-colors duration-200 group`}
                    >
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3 shadow-sm group-hover:scale-105 transition-transform duration-200">
                        <social.icon className={`w-5 h-5 ${social.color}`} />
                      </div>
                      <div className="flex-1 text-left">
                        <div className="font-medium text-gray-900">{social.name}</div>
                        <div className="text-sm text-gray-600">{social.description}</div>
                      </div>
                    </button>
                  ))}

                  {/* Locations Button */}
                  <button
                    onClick={() => setCurrentView('locations')}
                    className="w-full flex items-center p-3 rounded-xl bg-orange-50 hover:bg-orange-100 transition-colors duration-200 group"
                  >
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3 shadow-sm group-hover:scale-105 transition-transform duration-200">
                      <MapPin className="w-5 h-5 text-orange-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">Nuestras Sedes</div>
                      <div className="text-sm text-gray-600">Ver ubicaciones</div>
                    </div>
                  </button>
                </div>
              ) : (
                // Locations View
                <div className="space-y-4">
                  {locations.map((location) => (
                    <div
                      key={location.id}
                      className="border border-gray-200 rounded-xl p-4 hover:border-orange-200 hover:bg-orange-50/30 transition-all duration-200"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                          <MapPin className="w-4 h-4 text-orange-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{location.name}</h3>
                          <p className="text-gray-600 text-sm mt-1">{location.address}</p>
                          <div className="mt-2 space-y-1">
                            <p className="text-gray-500 text-xs">{location.hours}</p>
                            <p className="text-gray-500 text-xs">{location.phone}</p>
                          </div>
                          <button
                            onClick={() => handleLocationClick(location.mapUrl)}
                            className="mt-3 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium w-full transition-colors duration-200"
                          >
                            Ver Ruta
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Back Button */}
                  <button
                    onClick={() => setCurrentView('menu')}
                    className="w-full mt-4 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200"
                  >
                    ← Volver al Menú
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}