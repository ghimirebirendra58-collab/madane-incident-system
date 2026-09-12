import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import './App.css'
import MapView from './MapView'
import Admin from './Admin'

function App() {
    if (window.location.pathname === '/admin') {
    return <Admin />
  }
  console.log('APP IS RUNNING')

  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState('')
  const [incidents, setIncidents] = useState([])
  const [assignments, setAssignments] = useState([])
  const [locationStatus, setLocationStatus] = useState('')
const [coordinates, setCoordinates] = useState({
  latitude: null,
  longitude: null
})

  const [form, setForm] = useState({
    type: '',
    ward: '',
    location: '',
    description: '',
    name: '',
    phone: ''
  })

  useEffect(() => {
    console.log('USEEFFECT IS RUNNING')

    const fetchIncidents = async () => {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        alert('FETCH ERROR: ' + error.message)
        console.error('FETCH ERROR:', error)
        return
      }

      setIncidents(data)
      console.log('INCIDENTS FROM DATABASE:', data)
        console.log('STARTING ASSIGNMENT QUERY')

console.log("STARTING ASSIGNMENT QUERY");
        const { data: assignmentData, error: assignmentError } = await supabase
  .from('public_incident_assignments')
  .select('*')
  .order('created_at', { ascending: true })

console.log('ASSIGNMENT QUERY FINISHED')
console.log('ASSIGNMENT DATA:', assignmentData)
console.log('ASSIGNMENT ERROR:', assignmentError)

if (assignmentError) {
  console.error('ASSIGNMENT FETCH ERROR:', assignmentError)
  return
}

setAssignments(assignmentData || [])
console.log('ASSIGNMENTS FROM DATABASE:', assignmentData)
}

    fetchIncidents()
 }, [])

 const handleChange = (e) => {
  setForm({
    ...form,
    [e.target.name]: e.target.value
  })
}

const getCurrentLocation = () => {
  setLocationStatus('Getting your location...')

  if (!navigator.geolocation) {
    setLocationStatus('❌ Location is not supported by this browser.')
    return
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const latitude = position.coords.latitude
      const longitude = position.coords.longitude

      setCoordinates({
        latitude,
        longitude
      })

      setLocationStatus(
        `📍 Location captured: ${latitude.toFixed(6)}, ${longitude.toFixed(6)}`
      )
    },
    (error) => {
      console.error('LOCATION ERROR:', error)
      setLocationStatus(
        '❌ Could not get your location. Please allow location access.'
      )
    }
  )
}
  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage('Submitting report...')

    const newIncident = {
      incident_type: form.type,
      ward: form.ward,
      location: form.location,
      description: form.description,
      reporter_name: form.name || null,
      reporter_phone: form.phone || null,
      status: 'NEW',
latitude: coordinates.latitude,
longitude: coordinates.longitude
    }

    const { data, error } = await supabase
      .from('incidents')
      .insert([newIncident])
      .select()

    if (error) {
      console.error('SUBMIT ERROR:', error)
      setMessage('❌ Report could not be submitted.')
      return
    }

    setIncidents((current) => [data[0], ...current])

    setMessage('✅ Report submitted successfully.')

    setForm({
      type: '',
      ward: '',
      location: '',
      description: '',
      name: '',
      phone: ''
    })
  }

  return (
    <div className="app">

      <header className="header">
        <div>
          <h1>Madane Rural Municipality</h1>
          <p>Disaster & Incident Reporting System</p>
        </div>

        <div className="language">
          नेपाली | English
        </div>
      </header>

      <main>

        <section className="hero">
          <h2>Report an Incident</h2>

          <p>
            Report landslides, floods, road damage, fire,
            water supply problems and other incidents.
          </p>

          <button onClick={() => setShowForm(true)}>
            Report Incident
          </button>
        </section>

        <section className="information">
          <h2>Madane Rural Municipality</h2>

          <p>
            This system helps citizens report incidents and
            helps the municipality respond efficiently.
          </p>

          <div className="wards">
            <span>Ward 1 – Aglung</span>
            <span>Ward 2 – Bajhkateri</span>
            <span>Ward 3 – Sirseni</span>
            <span>Ward 4 – Myalpokhari</span>
            <span>Ward 5 – Malagiri</span>
            <span>Ward 6 – Purkot Daha</span>
            <span>Ward 7 – Bhanbhane</span>
          </div>
        </section>

        <section className="map-section">
  <h2>Incident Map</h2>
 <MapView incidents={incidents} />
</section>
        <section className="incidents-section">
          <h2>Reported Incidents</h2>

          {incidents.length === 0 ? (
            <p>No incidents have been reported yet.</p>
          ) : (
            <div className="incident-list">

              {incidents.map((incident) => (
                <div
                  className="incident-card"
                  key={incident.id}
                >

                  <h3>{incident.incident_type}</h3>

                  <p>
                    <strong>Ward:</strong> {incident.ward}
                  </p>

                  <p>
                    <strong>Location:</strong> {incident.location}
                  </p>

                  <p>
                    <strong>Description:</strong> {incident.description}
                  </p>

                <p>
  <strong>Status:</strong>{' '}
  <span
    style={{
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '12px',
      fontSize: '12px',
      fontWeight: 'bold',
      background: '#fff3cd',
      color: '#856404',
      marginLeft: '5px'
    }}
  >
    {incident.status || 'NEW'}
  </span>
</p>

{/* ADD THIS PART HERE */}
<p>
  <strong>Forwarded to:</strong>{' '}
  {assignments.filter(
    (assignment) =>
      String(assignment.incident_id) === String(incident.id)
  ).length > 0
    ? assignments
        .filter(
          (assignment) =>
            String(assignment.incident_id) === String(incident.id)
        )
        .map((assignment) => assignment.assigned_to)
        .join(', ')
    : 'Not yet forwarded'}
</p>

<p>
  <strong>Reported:</strong>{' '}
  {new Date(incident.created_at).toLocaleString()}
</p>

                </div>
              ))}

            </div>
          )}
        </section>

      </main>

      {showForm && (
        <div className="modal">

          <div className="form-box">

            <button
              className="close"
              onClick={() => {
                setShowForm(false)
                setMessage('')
              }}
            >
              ×
            </button>

            <h2>Report an Incident</h2>

            <form onSubmit={handleSubmit}>

              <label>Incident Type</label>

              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
              >
                <option value="">Select incident type</option>
                <option value="Landslide">Landslide</option>
                <option value="Flood">Flood</option>
                <option value="Road Damage">Road Damage</option>
                <option value="Bridge Damage">Bridge Damage</option>
                <option value="House / Building Damage">
                  House / Building Damage
                </option>
                <option value="Fire">Fire</option>
                <option value="Fallen Tree">Fallen Tree</option>
                <option value="Water Supply">Water Supply</option>
                <option value="Electricity">Electricity</option>
                <option value="Other">Other</option>
              </select>

              <label>Ward</label>

              <select
                name="ward"
                value={form.ward}
                onChange={handleChange}
                required
              >
                <option value="">Select ward</option>
                <option value="1">Ward 1 – Aglung</option>
                <option value="2">Ward 2 – Bajhkateri</option>
                <option value="3">Ward 3 – Sirseni</option>
                <option value="4">Ward 4 – Myalpokhari</option>
                <option value="5">Ward 5 – Malagiri</option>
                <option value="6">Ward 6 – Purkot Daha</option>
                <option value="7">Ward 7 – Bhanbhane</option>
              </select>

              <label>Location</label>

              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Example: Purkot Daha, near ward office"
                required
              />
              <button
  type="button"
  onClick={getCurrentLocation}
>
  📍 Use My Current Location
</button>

{locationStatus && (
  <p className="location-status">
    {locationStatus}
  </p>
)}

              <label>Description</label>

              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Describe the incident..."
                rows="4"
                required
              />

              <label>Reporter Name (optional)</label>

              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
              />

              <label>Phone Number (optional)</label>

              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="Your phone number"
              />

              <button type="submit">
                Submit Report
              </button>

              {message && (
                <p className="message">
                  {message}
                </p>
              )}

            </form>

          </div>
        </div>
      )}

    </div>
  )
}

export default App