import React, { useEffect, useRef, useState } from 'react';

const OpenStreetMap = ({ 
  doctors = [], 
  center = null, 
  zoom = 12, 
  height = '400px',
  showUserLocation = true,
  searchRadius = null,
  onDoctorSelect = null,
  className = ''
}) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersGroupRef = useRef(null);
  const userLocationMarkerRef = useRef(null);
  const radiusCircleRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize Map (Once)
  useEffect(() => {
    let map = null;
    const L = window.L;

    const init = () => {
      if (!mapRef.current || !L) return;

      try {
        // Ensure no leftover state
        if (mapRef.current._leaflet_id) {
          mapRef.current._leaflet_id = null;
        }

        const mapCenter = center ? [center.lat, center.lng] : [27.7172, 85.3240];
        map = L.map(mapRef.current).setView(mapCenter, zoom);
        
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19
        }).addTo(map);

        mapInstanceRef.current = map;
        markersGroupRef.current = L.layerGroup().addTo(map);
        
        setLoading(false);

        // Crucial for React: invalidate size after a delay to handle cases 
        // where the container might have been hidden or resized during mount
        setTimeout(() => {
          if (map) map.invalidateSize();
        }, 300);
      } catch (err) {
        console.error('Leaflet init error:', err);
        setError('Failed to initialize map');
        setLoading(false);
      }
    };

    if (L) {
      init();
    } else {
      window.addEventListener('map-loaded', init);
    }

    return () => {
      window.removeEventListener('map-loaded', init);
      if (map) {
        map.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []); // Only run once on mount

  // Update Center & Zoom
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map && center) {
      map.setView([center.lat, center.lng], zoom);
    }
  }, [center, zoom]);

  // Update Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersGroup = markersGroupRef.current;
    const L = window.L;
    if (!map || !markersGroup || !L) return;

    markersGroup.clearLayers();
    
    doctors.forEach(doctor => {
      if (!doctor.location?.coordinates) return;
      const [lng, lat] = doctor.location.coordinates;
      
      const marker = L.marker([lat, lng]);
      
      const popupContent = `
        <div style="min-width: 200px; padding: 5px;">
          <h4 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px;">Dr. ${doctor.name}</h4>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Specialization:</strong> ${doctor.specialization}</p>
          <p style="margin: 4px 0; font-size: 13px;"><strong>Fee:</strong> Rs. ${doctor.consultationFee || 'N/A'}</p>
          <div style="margin-top: 10px; display: flex; gap: 8px;">
            <button 
              onclick="window.selectDoctor && window.selectDoctor('${doctor.id || doctor._id}')"
              style="flex: 1; padding: 6px 4px; background: #f3f4f6; color: #374151; border: 1px solid #d1d5db; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;"
            >
              Details
            </button>
            <button 
              onclick="window.bookDoctor && window.bookDoctor('${doctor.id || doctor._id}')"
              style="flex: 1; padding: 6px 4px; background: #2563eb; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 12px; font-weight: 500;"
            >
              Book & Pay
            </button>
          </div>
        </div>
      `;
      
      marker.bindPopup(popupContent).addTo(markersGroup);
    });

    // Auto-fit bounds if we have doctors
    if (doctors.length > 0) {
      const bounds = doctors.map(d => [d.location.coordinates[1], d.location.coordinates[0]]);
      if (center) bounds.push([center.lat, center.lng]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [doctors]);

  // Update User Location & Radius
  useEffect(() => {
    const map = mapInstanceRef.current;
    const L = window.L;
    if (!map || !L || !showUserLocation || !center) return;

    // Clear previous
    if (userLocationMarkerRef.current) map.removeLayer(userLocationMarkerRef.current);
    if (radiusCircleRef.current) map.removeLayer(radiusCircleRef.current);

    userLocationMarkerRef.current = L.marker([center.lat, center.lng], {
      icon: L.divIcon({
        className: 'user-location-marker',
        html: '<div style="background: #3b82f6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.3);"></div>',
        iconSize: [20, 20]
      })
    }).addTo(map).bindPopup('Your Location');

    if (searchRadius) {
      radiusCircleRef.current = L.circle([center.lat, center.lng], {
        color: '#3b82f6',
        fillColor: '#3b82f6',
        fillOpacity: 0.1,
        radius: searchRadius * 1000
      }).addTo(map);
    }
  }, [center, searchRadius, showUserLocation]);

  // Global Handlers
  useEffect(() => {
    window.selectDoctor = (id) => {
      const doc = doctors.find(d => (d.id === id || d._id === id));
      if (doc && onDoctorSelect) onDoctorSelect(doc);
    };
    window.bookDoctor = (id) => {
      if (onDoctorSelect) onDoctorSelect(id, true);
    };
    return () => {
      delete window.selectDoctor;
      delete window.bookDoctor;
    };
  }, [doctors, onDoctorSelect]);

  return (
    <div className={`relative rounded-lg overflow-hidden border border-gray-200 shadow-inner ${className}`} style={{ height }}>
      {loading && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-gray-50/80 backdrop-blur-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-3"></div>
            <p className="text-gray-700 font-medium">Loading Map...</p>
          </div>
        </div>
      )}
      {error && (
        <div className="absolute inset-0 z-[1000] flex items-center justify-center bg-white/90">
          <div className="text-center p-6 rounded-xl border border-red-100 bg-white shadow-lg">
            <p className="text-red-600 font-medium mb-3">{error}</p>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Retry
            </button>
          </div>
        </div>
      )}
      <div ref={mapRef} className="w-full h-full z-10" />
    </div>
  );
};

export default OpenStreetMap;
