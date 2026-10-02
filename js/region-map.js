(() => {
  const element = document.getElementById('origin-leaflet-map');
  if (!element || !window.L) return;

  const center = [11.0309829, 106.565394];
  const mapBounds = L.latLngBounds([11.018, 106.552], [11.044, 106.579]);
  const map = L.map(element, {
    center,
    zoom: 16,
    minZoom: 15,
    maxZoom: 17,
    maxBounds: mapBounds,
    maxBoundsViscosity: 1,
    bounceAtZoomLimits: false,
    zoomControl: true,
    scrollWheelZoom: true,
    doubleClickZoom: true,
    keyboard: true,
    worldCopyJump: false
  });

  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    minZoom: 15,
    maxZoom: 17,
    noWrap: true,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
  }).addTo(map);

  L.circle(center, {
    radius: 240,
    color: '#168449',
    weight: 2,
    fillColor: '#55ad73',
    fillOpacity: 0.1,
    interactive: false,
    className: 'map-focus-boundary'
  }).addTo(map);

  L.marker(center, {
    interactive: false,
    keyboard: false,
    icon: L.divIcon({
      className: 'map-pulse-icon',
      html: '<span class="map-pulse-ring"><i></i></span>',
      iconSize: [126, 126],
      iconAnchor: [63, 63]
    })
  }).addTo(map);

  L.circleMarker(center, {
    radius: 6,
    color: '#ffffff',
    weight: 3,
    fillColor: '#138249',
    fillOpacity: 1,
    interactive: false
  }).addTo(map);

  map.setMaxBounds(mapBounds);
  window.addEventListener('resize', () => map.invalidateSize({ pan: false }));
})();
