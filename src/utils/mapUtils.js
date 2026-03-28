// Google Maps utility functions

// Wait for Google Maps API to load
export const waitForGoogleMaps = () => {
  return new Promise((resolve) => {
    if (window.google && window.google.maps) {
      resolve();
    } else {
      window.addEventListener('google-maps-loaded', resolve);
    }
  });
};

// Initialize map
export const initializeMap = async (mapContainer, options = {}) => {
  await waitForGoogleMaps();
  
  const defaultOptions = {
    zoom: 12,
    center: { lat: 27.7172, lng: 85.3240 }, // Kathmandu default
    mapTypeControl: true,
    streetViewControl: true,
    fullscreenControl: true,
    ...options
  };

  return new window.google.maps.Map(mapContainer, defaultOptions);
};

// Create marker
export const createMarker = (map, position, options = {}) => {
  const defaultOptions = {
    map,
    position,
    animation: window.google.maps.Animation.DROP
  };

  return new window.google.maps.Marker({ ...defaultOptions, ...options });
};

// Create info window
export const createInfoWindow = (content) => {
  return new window.google.maps.InfoWindow({
    content,
    maxWidth: 300
  });
};

// Get user's current location
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
};

// Calculate distance between two points
export const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return distance;
};

// Geocode address to coordinates
export const geocodeAddress = async (address) => {
  await waitForGoogleMaps();
  
  const geocoder = new window.google.maps.Geocoder();
  
  return new Promise((resolve, reject) => {
    geocoder.geocode({ address }, (results, status) => {
      if (status === 'OK' && results[0]) {
        resolve({
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
          formattedAddress: results[0].formatted_address
        });
      } else {
        reject(new Error('Geocoding failed: ' + status));
      }
    });
  });
};

// Reverse geocode coordinates to address
export const reverseGeocode = async (lat, lng) => {
  await waitForGoogleMaps();
  
  const geocoder = new window.google.maps.Geocoder();
  const latlng = { lat, lng };
  
  return new Promise((resolve, reject) => {
    geocoder.geocode({ location: latlng }, (results, status) => {
      if (status === 'OK' && results[0]) {
        resolve({
          address: results[0].formatted_address,
          components: results[0].address_components
        });
      } else {
        reject(new Error('Reverse geocoding failed: ' + status));
      }
    });
  });
};

// Get travel time and distance using Google Maps Distance Matrix API
export const getTravelInfo = async (origin, destination, mode = 'driving') => {
  try {
    if (!window.google || !window.google.maps || !window.google.maps.DistanceMatrixService) {
      // Fallback: calculate straight-line distance if Google Maps is not available
      const dist = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
      return {
        distance: `${dist.toFixed(1)} km`,
        distanceValue: Math.round(dist * 1000),
        duration: 'N/A',
        durationValue: 0,
        isFallback: true
      };
    }

    await waitForGoogleMaps();
    
    const service = new window.google.maps.DistanceMatrixService();
    
    return new Promise((resolve, reject) => {
      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: mode,
          unitSystem: window.google.maps.UnitSystem.METRIC
        },
        (response, status) => {
          if (status === 'OK' && response.rows[0].elements[0].status === 'OK') {
            const element = response.rows[0].elements[0];
            resolve({
              distance: element.distance.text,
              distanceValue: element.distance.value, // in meters
              duration: element.duration.text,
              durationValue: element.duration.value // in seconds
            });
          } else {
            // Fallback on specific failure
            const dist = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
            resolve({
              distance: `${dist.toFixed(1)} km`,
              distanceValue: Math.round(dist * 1000),
              duration: 'N/A',
              durationValue: 0
            });
          }
        }
      );
    });
  } catch (err) {
    console.warn('getTravelInfo failed, using fallback:', err);
    const dist = calculateDistance(origin.lat, origin.lng, destination.lat, destination.lng);
    return {
      distance: `${dist.toFixed(1)} km`,
      distanceValue: Math.round(dist * 1000),
      duration: 'N/A',
      durationValue: 0
    };
  }
};

// Create autocomplete for address input
export const createAutocomplete = async (inputField, options = {}) => {
  await waitForGoogleMaps();
  
  const defaultOptions = {
    types: ['establishment', 'geocode'],
    componentRestrictions: { country: 'np' }, // Nepal
    ...options
  };

  return new window.google.maps.places.Autocomplete(inputField, defaultOptions);
};

// Add traffic layer to map
export const addTrafficLayer = (map) => {
  const trafficLayer = new window.google.maps.TrafficLayer();
  trafficLayer.setMap(map);
  return trafficLayer;
};

// Add transit layer to map
export const addTransitLayer = (map) => {
  const transitLayer = new window.google.maps.TransitLayer();
  transitLayer.setMap(map);
  return transitLayer;
};

// Draw circle around a point
export const drawCircle = (map, center, radius, options = {}) => {
  const defaultOptions = {
    map,
    center,
    radius, // in meters
    fillColor: '#4285F4',
    fillOpacity: 0.1,
    strokeColor: '#4285F4',
    strokeOpacity: 0.8,
    strokeWeight: 2
  };

  return new window.google.maps.Circle({ ...defaultOptions, ...options });
};

// Fit map bounds to show all markers
export const fitMapToBounds = (map, markers, padding = 50) => {
  const bounds = new window.google.maps.LatLngBounds();
  
  markers.forEach(marker => {
    bounds.extend(marker.getPosition());
  });
  
  map.fitBounds(bounds, padding);
};

// Get directions between two points
export const getDirections = async (origin, destination, travelMode = 'DRIVING') => {
  await waitForGoogleMaps();
  
  const directionsService = new window.google.maps.DirectionsService();
  
  return new Promise((resolve, reject) => {
    directionsService.route(
      {
        origin,
        destination,
        travelMode: window.google.maps.TravelMode[travelMode]
      },
      (result, status) => {
        if (status === 'OK') {
          resolve(result);
        } else {
          reject(new Error('Directions request failed: ' + status));
        }
      }
    );
  });
};

// Render directions on map
export const renderDirections = (map, directions) => {
  const directionsRenderer = new window.google.maps.DirectionsRenderer({
    draggable: true,
    panel: document.getElementById('directions-panel') || null
  });
  
  directionsRenderer.setMap(map);
  directionsRenderer.setDirections(directions);
  
  return directionsRenderer;
};
