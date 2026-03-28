// OpenStreetMap Loader - Completely Free Alternative to Google Maps
(function() {
    console.log('Loading OpenStreetMap...');
    
    // Load Leaflet CSS
    const leafletCSS = document.createElement('link');
    leafletCSS.rel = 'stylesheet';
    leafletCSS.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(leafletCSS);
    
    // Load Leaflet JS
    const leafletJS = document.createElement('script');
    leafletJS.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    leafletJS.onload = function() {
        console.log('OpenStreetMap (Leaflet) loaded successfully');
        window.dispatchEvent(new Event('map-loaded'));
        window.L = window.L; // Make L globally available
    };
    leafletJS.onerror = function() {
        console.error('Failed to load OpenStreetMap');
        window.dispatchEvent(new Event('map-error'));
    };
    document.head.appendChild(leafletJS);
})();
