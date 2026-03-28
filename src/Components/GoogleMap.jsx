import React, { useEffect, useRef, useState } from 'react';
import { 
  initializeMap, 
  createMarker, 
  createInfoWindow, 
  getCurrentLocation,
  getTravelInfo,
  drawCircle,
  fitMapToBounds
} from '../utils/mapUtils';

const GoogleMap = ({ 
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
  const markersRef = useRef([]);
  const userLocationRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeGoogleMap = async () => {
      try {
        if (!mapRef.current) return;

        // Initialize map
        const mapOptions = {
          zoom,
          center: center || { lat: 27.7172, lng: 85.3240 }, // Default to Kathmandu
          styles: [
            {
              featureType: 'poi.medical',
              elementType: 'labels.icon',
              stylers: [{ color: '#4285F4' }]
            }
          ]
        };

        const map = await initializeMap(mapRef.current, mapOptions);
        mapInstanceRef.current = map;

        // Ensure map renders correctly if container was hidden/resized
        setTimeout(() => {
          if (map) map.invalidateSize();
        }, 300);

        // Get user location if requested
        if (showUserLocation) {
          try {
            const userLocation = await getCurrentLocation();
            
            // Add user location marker
            const userMarker = createMarker(map, userLocation, {
              icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="8" fill="#4285F4" stroke="white" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" fill="white"/>
                  </svg>
                `),
                scaledSize: new window.google.maps.Size(24, 24),
                anchor: new window.google.maps.Point(12, 12)
              },
              title: 'Your Location',
              zIndex: 1000
            });

            const userContent = `
              <div style="padding: 8px; font-family: Arial, sans-serif;">
                <strong style="color: #4285F4;">Your Location</strong><br>
                <small>This is where you are now</small>
              </div>
            `;
            
            const userWindow = createInfoWindow(userContent);
            userMarker.addListener('click', () => {
              userWindow.open(map, userMarker);
            });

            userLocationRef.current = userMarker;

            // Draw search radius circle if specified
            if (searchRadius) {
              drawCircle(map, userLocation, searchRadius * 1000, {
                fillColor: '#4285F4',
                fillOpacity: 0.1,
                strokeColor: '#4285F4',
                strokeOpacity: 0.3
              });
            }

            // Center map on user location if no other center provided
            if (!center) {
              map.setCenter(userLocation);
            }
          } catch (locationError) {
            console.warn('Could not get user location:', locationError);
            setError('Could not access your location. Using default location.');
          }
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to initialize map:', err);
        setError('Failed to load map. Please refresh the page.');
        setLoading(false);
      }
    };

    initializeGoogleMap();

    return () => {
      // Cleanup markers
      markersRef.current.forEach(marker => marker.setMap(null));
      markersRef.current = [];
      
      if (userLocationRef.current) {
        userLocationRef.current.setMap(null);
        userLocationRef.current = null;
      }
    };
  }, [center, zoom, showUserLocation, searchRadius]);

  // Update markers when doctors change
  useEffect(() => {
    if (!mapInstanceRef.current || loading) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null));
    markersRef.current = [];

    // Add markers for each doctor
    const markers = doctors.map(doctor => {
      if (!doctor.location || !doctor.location.coordinates) return null;

      const position = {
        lat: doctor.location.coordinates[1],
        lng: doctor.location.coordinates[0]
      };

      // Create custom marker icon
      const markerIcon = {
        url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="16" cy="16" r="12" fill="#EA4335" stroke="white" stroke-width="3"/>
            <path d="M12 14 L12 18 L20 18 L20 14 Z" fill="white"/>
            <rect x="14" y="10" width="4" height="4" fill="white"/>
          </svg>
        `),
        scaledSize: new window.google.maps.Size(32, 32),
        anchor: new window.google.maps.Point(16, 16)
      };

      const marker = createMarker(mapInstanceRef.current, position, {
        icon: markerIcon,
        title: doctor.clinic?.name || doctor.name,
        zIndex: 500
      });

      // Create info window content
      const infoContent = `
        <div style="padding: 12px; font-family: Arial, sans-serif; max-width: 280px;">
          <div style="font-weight: bold; color: #333; margin-bottom: 8px; font-size: 16px;">
            ${doctor.name}
          </div>
          <div style="color: #666; margin-bottom: 4px; font-size: 14px;">
            <strong>${doctor.specialization}</strong>
          </div>
          <div style="color: #666; margin-bottom: 4px; font-size: 13px;">
            🏥 ${doctor.clinic?.name || 'Clinic'}
          </div>
          <div style="color: #666; margin-bottom: 4px; font-size: 13px;">
            📍 ${doctor.clinic?.address || 'Address not available'}
          </div>
          <div style="color: #666; margin-bottom: 4px; font-size: 13px;">
            📞 ${doctor.phone || 'Phone not available'}
          </div>
          <div style="color: #666; margin-bottom: 8px; font-size: 13px;">
            💰 Rs. ${doctor.consultationFee || 'N/A'}
          </div>
          ${doctor.distance ? `
            <div style="color: #4285F4; font-weight: 500; font-size: 13px;">
              📍 ${doctor.distance} ${doctor.unit || 'km'} away
            </div>
          ` : ''}
          <div style="margin-top: 12px; display: flex; gap: 8px;">
            <button 
              onclick="window.selectDoctor('${doctor._id || doctor.id}')"
              style="
                flex: 1;
                background: #f1f3f4; 
                color: #3c4043; 
                border: 1px solid #dadce0; 
                padding: 8px 12px; 
                border-radius: 6px; 
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
              "
            >
              Details
            </button>
            <button 
              onclick="window.bookDoctor('${doctor._id || doctor.id}')"
              style="
                flex: 1;
                background: #1a73e8; 
                color: white; 
                border: none; 
                padding: 8px 12px; 
                border-radius: 6px; 
                cursor: pointer;
                font-size: 13px;
                font-weight: 500;
                white-space: nowrap;
              "
            >
              Book & Pay
            </button>
          </div>
        </div>
      `;

      const infoWindow = createInfoWindow(infoContent);
      
      marker.addListener('click', () => {
        infoWindow.open(mapInstanceRef.current, marker);
      });

      return marker;
    }).filter(Boolean);

    markersRef.current = markers;

    // Fit map to show all markers if there are doctors
    if (markers.length > 0) {
      const allMarkers = [...markers];
      if (userLocationRef.current) {
        allMarkers.push(userLocationRef.current);
      }
      fitMapToBounds(mapInstanceRef.current, allMarkers);
    }
  }, [doctors, loading]);

  // Global function for doctor selection (called from info window)
  useEffect(() => {
    window.selectDoctor = (doctorId) => {
      if (onDoctorSelect) {
        onDoctorSelect(doctorId);
      }
    };

    window.bookDoctor = (doctorId) => {
      if (onDoctorSelect) {
        onDoctorSelect(doctorId, true);
      }
    };

    return () => {
      delete window.selectDoctor;
      delete window.bookDoctor;
    };
  }, [onDoctorSelect]);

  if (error) {
    return (
      <div 
        className={`bg-red-50 border border-red-200 rounded-lg flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center p-4">
          <div className="text-red-600 font-medium mb-2">⚠️ Map Error</div>
          <div className="text-red-500 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div 
        className={`bg-gray-100 rounded-lg flex items-center justify-center ${className}`}
        style={{ height }}
      >
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full mx-auto mb-2"></div>
          <div className="text-gray-600 text-sm">Loading map...</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden shadow-lg ${className}`} style={{ height }}>
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default GoogleMap;
