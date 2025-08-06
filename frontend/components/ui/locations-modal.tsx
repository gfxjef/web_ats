"use client";

import { MapPin, X, Navigation } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

interface LocationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const locations = [
  {
    id: 1,
    name: "Sede Bayóvar",
    address: "San Juan de Lurigancho, Lima",
    mapUrl: "https://maps.app.goo.gl/Xgn8HXiJyLv5sjKU9",
    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.952!2d-77.0049158!3d-11.95976!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105d01e2c8c4e5f%3A0x123456789!2sA%2BA%2Btu%2BSalud!5e0!3m2!1ses!2spe!4v1620000000000!5m2!1ses!2spe",
    hours: "Lun - Sab: 9:00 AM - 10:00 PM",
    phone: "+51 999 999 999"
  },
  {
    id: 2,
    name: "Sede Jardines", 
    address: "Santiago de Surco, Lima",
    mapUrl: "https://maps.app.goo.gl/pb7iNKYb23LVbNUQ7",
    embedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3901.952!2d-77.0206908!3d-12.0033938!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9105d01e2c8c4e5f%3A0x987654321!2sLicoreria%2BA%2Btu%2BSalud!5e0!3m2!1ses!2spe!4v1620000000000!5m2!1ses!2spe",
    hours: "Lun - Sab: 9:00 AM - 10:00 PM",
    phone: "+51 888 888 888"
  }
];

export function LocationsModal({ isOpen, onClose }: LocationsModalProps) {
  const [selectedLocation, setSelectedLocation] = useState<number | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm sm:max-w-md max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
              <MapPin className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Nuestras Sedes</h2>
              <p className="text-sm text-gray-600">Visítanos</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="w-8 h-8 rounded-full p-0 hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto max-h-[calc(85vh-80px)]">
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
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-base">{location.name}</h3>
                    <p className="text-gray-600 text-sm mt-1">{location.address}</p>
                    <div className="mt-2 space-y-1">
                      <p className="text-gray-500 text-xs">{location.hours}</p>
                      <p className="text-gray-500 text-xs">{location.phone}</p>
                    </div>
                    
                    <div className="mt-3">
                      <Button
                        size="sm"
                        onClick={() => window.open(location.mapUrl, '_blank')}
                        className="bg-orange-500 hover:bg-orange-600 text-white w-full h-8 text-sm"
                      >
                        <Navigation className="w-3 h-3 mr-2" />
                        Ver Ruta en Maps
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer info */}
          <div className="mt-4 p-3 bg-gray-50 rounded-xl">
            <p className="text-xs text-gray-500 text-center">
              📍 Delivery disponible en ambas zonas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}