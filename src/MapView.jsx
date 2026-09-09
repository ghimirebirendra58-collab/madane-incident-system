import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'

function MapView({ incidents }) {
  return (
    <div style={{ height: '500px', width: '100%', position: 'relative' }}>
      <MapContainer
        center={[28.05, 83.35]}
        zoom={10}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {incidents.map((incident) =>
          incident.latitude && incident.longitude ? (
            <Marker
              key={incident.id}
              position={[incident.latitude, incident.longitude]}
            >
              <Popup>
  <strong>{incident.incident_type}</strong>
  <br />
  Ward: {incident.ward}
  <br />
  Location: {incident.location}
  <br />
  Description: {incident.description}
  <br />
  Status: {incident.status}
  <br />
  Reported: {new Date(incident.created_at).toLocaleString()}
</Popup>
            </Marker>
          ) : null
        )}
      </MapContainer>
    </div>
  )
}

export default MapView