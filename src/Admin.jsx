import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

function Admin() {
  const [session, setSession] = useState(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  const [incidents, setIncidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [forwardIncident, setForwardIncident] = useState(null)

const [selectedRecipients, setSelectedRecipients] = useState([])

const [forwardRemarks, setForwardRemarks] = useState('')
const recipients = [
  {
    value: 'SUB_ENGINEER',
    label: 'Sub-Engineer'
  },
  {
    value: 'ASSISTANT_SUB_ENGINEER',
    label: 'Assistant Sub-Engineer'
  },
  {
    value: 'ENGINEER',
    label: 'Engineer'
  },
  {
    value: 'CAO',
    label: 'Chief Administrative Officer (CAO)'
  },
  {
    value: 'VICE_CHAIRPERSON',
    label: 'Vice-Chairperson'
  },
  {
    value: 'CHAIRPERSON',
    label: 'Chairperson'
  }
]

  // Check whether an admin is logged in
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession()
      setSession(data.session)
    }

    checkSession()

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Fetch incidents
  useEffect(() => {
    if (!session) return

    const fetchIncidents = async () => {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('ADMIN FETCH ERROR:', error)
        alert('Could not load incidents: ' + error.message)
        return
      }

      setIncidents(data)
      setLoading(false)
    }

    fetchIncidents()
  }, [session])

    // Update incident status
  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from('incidents')
      .update({ status: newStatus })
      .eq('id', id)

    if (error) {
      console.error('STATUS UPDATE ERROR:', error)
      alert('Could not update status: ' + error.message)
      return
    }

    setIncidents((current) =>
      current.map((incident) =>
        incident.id === id
          ? { ...incident, status: newStatus }
          : incident
      )
    )
  }

  // Update incident severity
  const updateSeverity = async (id, newSeverity) => {
    const { error } = await supabase
      .from('incidents')
      .update({ severity: newSeverity })
      .eq('id', id)

    if (error) {
      console.error('SEVERITY UPDATE ERROR:', error)
      alert('Could not update severity: ' + error.message)
      return
    }

    setIncidents((current) =>
      current.map((incident) =>
        incident.id === id
          ? { ...incident, severity: newSeverity }
          : incident
      )
    )
  }

  // Forward incident to selected recipients
  const submitForward = async () => {
    if (!forwardIncident) return

    if (selectedRecipients.length === 0) {
      alert('Please select at least one recipient.')
      return
    }

    const assignments = selectedRecipients.map((recipient) => ({
  incident_id: forwardIncident.id,
  assigned_to: recipient,
  assigned_by: session.user.id,
  assignment_status: 'PENDING',
  remarks: forwardRemarks || null
}))

    const { error } = await supabase
      .from('incident_assignments')
      .insert(assignments)

    if (error) {
      console.error('FORWARD ERROR:', error)
      alert('Could not forward incident: ' + error.message)
      return
    }

    const { error: statusError } = await supabase
      .from('incidents')
      .update({ status: 'ASSIGNED' })
      .eq('id', forwardIncident.id)

    if (statusError) {
      console.error('STATUS UPDATE ERROR:', statusError)
      alert('Incident forwarded, but status could not be updated.')
      return
    }

    setIncidents((current) =>
      current.map((incident) =>
        incident.id === forwardIncident.id
          ? { ...incident, status: 'ASSIGNED' }
          : incident
      )
    )

    alert('Incident forwarded successfully.')

    setForwardIncident(null)
    setSelectedRecipients([])
    setForwardRemarks('')
  }

  // Login screen
  if (!session) {
    return (
      <div
        style={{
          padding: '40px',
          maxWidth: '400px',
          margin: '80px auto'
        }}
      >
        <h1>Madane Rural Municipality</h1>
        <h2>Admin Login</h2>

        <form
          onSubmit={async (e) => {
            e.preventDefault()
            setLoginError('')

            const { error } = await supabase.auth.signInWithPassword({
              email,
              password
            })

            if (error) {
              setLoginError(error.message)
            }
          }}
        >
          <label>Email</label>

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{
              display: 'block',
              width: '100%',
              padding: '10px',
              margin: '8px 0 15px'
            }}
          />

          <label>Password</label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{
              display: 'block',
              width: '100%',
              padding: '10px',
              margin: '8px 0 15px'
            }}
          />

          <button type="submit">
            Login
          </button>

          {loginError && (
            <p style={{ color: 'red' }}>
              {loginError}
            </p>
          )}
        </form>
      </div>
    )
  }

  // Admin dashboard
  return (
    <div style={{ padding: '30px' }}>
      <h1>Madane Rural Municipality</h1>
      <h2>Admin Dashboard</h2>

      <p>Municipal Incident Management System</p>

      <button
        onClick={async () => {
          await supabase.auth.signOut()
        }}
      >
        Logout
      </button>

      <hr />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(5, 1fr)',
          gap: '15px',
          margin: '25px 0'
        }}
      >
        <div>
          <strong>Total</strong>
          <br />
          {incidents.length}
        </div>

        <div>
          <strong>NEW</strong>
          <br />
          {incidents.filter((i) => i.status === 'NEW').length}
        </div>

        <div>
          <strong>VERIFIED</strong>
          <br />
          {incidents.filter((i) => i.status === 'VERIFIED').length}
        </div>

        <div>
          <strong>IN PROGRESS</strong>
          <br />
          {incidents.filter((i) => i.status === 'IN PROGRESS').length}
        </div>

        <div>
          <strong>RESOLVED</strong>
          <br />
          {incidents.filter((i) => i.status === 'RESOLVED').length}
        </div>
      </div>

      <h3>Reported Incidents</h3>

      {loading ? (
        <p>Loading incidents...</p>
      ) : incidents.length === 0 ? (
        <p>No incidents found.</p>
      ) : (
        <table
          border="1"
          cellPadding="10"
          style={{
            width: '100%',
            borderCollapse: 'collapse'
          }}
        >
          <thead>
            <tr>
              <th>Type</th>
              <th>Ward</th>
              <th>Location</th>
              <th>Description</th>
              <th>Severity</th>
<th>Status</th>
<th>Action</th>
<th>Reported</th>
            </tr>
          </thead>

          <tbody>
            {incidents.map((incident) => (
              <tr key={incident.id}>
                <td>{incident.incident_type}</td>
                <td>{incident.ward}</td>
                <td>{incident.location}</td>
                <td>{incident.description}</td>

               <td>
  <select
    value={incident.severity || ''}
    onChange={(e) =>
      updateSeverity(incident.id, e.target.value)
    }
  >
    <option value="">Not set</option>
    <option value="LOW">LOW</option>
    <option value="MEDIUM">MEDIUM</option>
    <option value="HIGH">HIGH</option>
    <option value="CRITICAL">CRITICAL</option>
  </select>
</td>
<td>
 <button
  onClick={() => {
    setForwardIncident(incident)
    setSelectedRecipients([])
    setForwardRemarks('')
  }}
>
  Forward
</button>
</td>
                <td>
                    
                  <select
                    value={incident.status || 'NEW'}
                    onChange={(e) =>
                      updateStatus(incident.id, e.target.value)
                    }
                  >
                    <option value="NEW">NEW</option>
                    <option value="VERIFIED">VERIFIED</option>
                    <option value="ASSIGNED">ASSIGNED</option>
                    <option value="IN PROGRESS">IN PROGRESS</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                </td>

                <td>
                  {new Date(incident.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    {forwardIncident && (
  <div
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}
  >
    <div
      style={{
        background: 'white',
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '25px',
        borderRadius: '10px'
      }}
    >
      <h2>Forward Incident</h2>

      <hr />

      <h3>Incident Details</h3>

      <p>
        <strong>Type:</strong>{' '}
        {forwardIncident.incident_type}
      </p>

      <p>
        <strong>Ward:</strong>{' '}
        {forwardIncident.ward}
      </p>

      <p>
        <strong>Location:</strong>{' '}
        {forwardIncident.location}
      </p>

      <p>
        <strong>Severity:</strong>{' '}
        {forwardIncident.severity || 'Not set'}
      </p>

      <p>
        <strong>Description:</strong>{' '}
        {forwardIncident.description}
      </p>

      <hr />

      <h3>Forward To</h3>

      {recipients.map((recipient) => (
        <label
          key={recipient.value}
          style={{
            display: 'block',
            marginBottom: '10px'
          }}
        >
          <input
            type="checkbox"
            checked={selectedRecipients.includes(
              recipient.value
            )}
            onChange={(e) => {
              if (e.target.checked) {
                setSelectedRecipients((current) => [
                  ...current,
                  recipient.value
                ])
              } else {
                setSelectedRecipients((current) =>
                  current.filter(
                    (value) => value !== recipient.value
                  )
                )
              }
            }}
          />

          {' '}

          {recipient.label}
        </label>
      ))}

      <h3>Remarks</h3>

      <textarea
        value={forwardRemarks}
        onChange={(e) =>
          setForwardRemarks(e.target.value)
        }
        placeholder="Enter instructions or remarks..."
        rows="4"
        style={{
          width: '100%',
          padding: '10px',
          marginBottom: '15px'
        }}
      />

      <div>
        <button onClick={submitForward}>
  Forward Incident
</button>

        <button
          onClick={() => setForwardIncident(null)}
          style={{ marginLeft: '10px' }}
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  )
}

export default Admin