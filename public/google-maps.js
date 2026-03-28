// Google Maps API loader
(function() {
  // Use a hardcoded API key for now - replace with your actual key
  const API_KEY = 'AIzaSyBtSa0Xy1nJZ38A2kH2wD6v7x8y9z0abc1'; // Replace with your actual key
  
  // Load Google Maps API
  const script = document.createElement('script');
  script.async = true;
  script.defer = true;
  script.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}&libraries=places&callback=initMap`;
  
  // Initialize map when API is loaded
  window.initMap = function() {
    console.log('Google Maps API loaded successfully');
    window.dispatchEvent(new Event('google-maps-loaded'));
  };
  
  // Handle errors
  script.onerror = function() {
    console.error('Failed to load Google Maps API');
    window.dispatchEvent(new Event('google-maps-error'));
  };
  
  document.head.appendChild(script);
})();
