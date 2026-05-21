import React, { useMemo, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { CalendarDays, Users, Plus, Trash2, Pencil, Mail, Send, Search, X, Download, Copy, Moon, Sun } from 'lucide-react'
import './styles.css'

const initialHolidays = [
  { id: 1, name: "New Year's Day", date: '2026-01-01', type: 'Regular', closed: false },
  { id: 2, name: 'Chinese New Year', date: '2026-02-17', type: 'Special non-working', closed: false },
  { id: 3, name: "Eid'l Fitr", date: '2026-03-20', type: 'Regular', closed: false },
  { id: 4, name: 'Maundy Thursday', date: '2026-04-02', type: 'Regular', closed: false },
  { id: 5, name: 'Good Friday', date: '2026-04-03', type: 'Regular', closed: false },
  { id: 6, name: 'Black Saturday', date: '2026-04-04', type: 'Special non-working', closed: false },
  { id: 7, name: 'Araw ng Kagitingan', date: '2026-04-09', type: 'Regular', closed: false },
  { id: 8, name: 'Labor Day', date: '2026-05-01', type: 'Regular', closed: false },
  { id: 9, name: 'US Memorial Holiday', date: '2026-05-25', type: 'Special non-working', closed: true },
  { id: 10, name: 'Independence Day', date: '2026-06-12', type: 'Regular', closed: false },
  { id: 11, name: 'National Heroes Day', date: '2026-08-31', type: 'Regular', closed: false },
  { id: 12, name: 'Christmas Day', date: '2026-12-25', type: 'Regular', closed: true }
]

const initialEmployees = [
  { id: 1, name: 'Jen', email: 'jen@company.com', availVL: 13, usedVL: 0, availSL: 5, usedSL: 0, unpaid: 0 },
  { id: 2, name: 'Joie', email: 'joie@company.com', availVL: 10, usedVL: 2, availSL: 5, usedSL: 5, unpaid: 2.5 },
  { id: 3, name: 'Melchor', email: 'melchor@company.com', availVL: 10, usedVL: 0, availSL: 5, usedSL: 0, unpaid: 8 },
  { id: 4, name: 'Jeremy', email: 'jeremy@company.com', availVL: 10, usedVL: 3, availSL: 5, usedSL: 0, unpaid: 1.5 },
  { id: 5, name: 'Krizsha', email: 'krizsha@company.com', availVL: 13, usedVL: 0, availSL: 5, usedSL: 0, unpaid: 12 },
  { id: 6, name: 'Jayson', email: 'jayson@company.com', availVL: 10, usedVL: 3, availSL: 5, usedSL: 4, unpaid: 0 },
  { id: 7, name: 'Bradford', email: 'bradford@company.com', availVL: 10, usedVL: 1, availSL: 5, usedSL: 1, unpaid: 2.5 },
  { id: 8, name: 'Jace', email: 'jace@company.com', availVL: 0, usedVL: 0, availSL: 0, usedSL: 0, unpaid: 4.5 }
]

function load(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch {
    return fallback
  }
}

function persist(key, value) {
  localStorage.setItem(key, JSON.stringify(value))
}

function dateLabel(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function dayLabel(value) {
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { weekday: 'short' })
}

function downloadJson(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}

function StatCard({ label, value }) {
  return <div className="stat-card"><div className="stat-label">{label}</div><div className="stat-value">{value}</div></div>
}

function Pill({ children, variant = 'blue' }) {
  return <span className={`pill pill-${variant}`}>{children}</span>
}

function EmptyState({ text }) {
  return <div className="empty-state">{text}</div>
}

function App() {
  const [tab, setTab] = useState('holidays')
  const [theme, setTheme] = useState(() => load('theme', 'dark'))
  const [holidays, setHolidays] = useState(() => load('holidays', initialHolidays))
  const [employees, setEmployees] = useState(() => load('employees', initialEmployees))
  const [holidaySearch, setHolidaySearch] = useState('')
  const [employeeSearch, setEmployeeSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('All types')
  const [emailOpen, setEmailOpen] = useState(false)
  const [editingHoliday, setEditingHoliday] = useState(null)
  const [editingEmployee, setEditingEmployee] = useState(null)
  const [holidayForm, setHolidayForm] = useState({ name: '', date: '2026-01-01', type: 'Regular', closed: false })
  const [employeeForm, setEmployeeForm] = useState({ name: '', email: '', availVL: 10, usedVL: 0, availSL: 5, usedSL: 0, unpaid: 0 })
  const [selectedHolidayId, setSelectedHolidayId] = useState(1)
  const [emailSubject, setEmailSubject] = useState('Holiday announcement')
  const [emailBody, setEmailBody] = useState('Hi team,\n\nPlease be advised of the upcoming holiday. Kindly plan schedules and leave requests accordingly.\n\nThank you.')
  const [toast, setToast] = useState('')

  const stats = useMemo(() => {
    const closed = holidays.filter(h => h.closed).length
    const regular = holidays.filter(h => h.type === 'Regular').length
    const special = holidays.filter(h => h.type === 'Special non-working').length
    const unpaid = employees.reduce((sum, e) => sum + Number(e.unpaid || 0), 0)
    const avgVL = employees.length ? employees.reduce((s, e) => s + (Number(e.availVL) - Number(e.usedVL)), 0) / employees.length : 0
    const avgSL = employees.length ? employees.reduce((s, e) => s + (Number(e.availSL) - Number(e.usedSL)), 0) / employees.length : 0
    return { closed, regular, special, unpaid, avgVL, avgSL }
  }, [holidays, employees])

  const selectedHoliday = holidays.find(h => h.id === Number(selectedHolidayId)) || holidays[0]
  const filteredHolidays = holidays.filter(h => h.name.toLowerCase().includes(holidaySearch.toLowerCase()) && (typeFilter === 'All types' || h.type === typeFilter))
  const filteredEmployees = employees.filter(e => e.name.toLowerCase().includes(employeeSearch.toLowerCase()) || e.email.toLowerCase().includes(employeeSearch.toLowerCase()))

  function showToast(message) {
    setToast(message)
    setTimeout(() => setToast(''), 2200)
  }

  function setThemeAndSave(value) {
    setTheme(value)
    persist('theme', value)
  }

  function saveHoliday(event) {
    event.preventDefault()
    const item = { ...holidayForm, id: editingHoliday?.id || Date.now() }
    const next = editingHoliday ? holidays.map(h => h.id === editingHoliday.id ? item : h) : [...holidays, item]
    setHolidays(next)
    persist('holidays', next)
    setEditingHoliday(null)
    setHolidayForm({ name: '', date: '2026-01-01', type: 'Regular', closed: false })
  }

  function saveEmployee(event) {
    event.preventDefault()
    const item = {
      ...employeeForm,
      id: editingEmployee?.id || Date.now(),
      availVL: Number(employeeForm.availVL), usedVL: Number(employeeForm.usedVL), availSL: Number(employeeForm.availSL), usedSL: Number(employeeForm.usedSL), unpaid: Number(employeeForm.unpaid)
    }
    const next = editingEmployee ? employees.map(e => e.id === editingEmployee.id ? item : e) : [...employees, item]
    setEmployees(next)
    persist('employees', next)
    setEditingEmployee(null)
    setEmployeeForm({ name: '', email: '', availVL: 10, usedVL: 0, availSL: 5, usedSL: 0, unpaid: 0 })
  }

  function removeHoliday(id) {
    const next = holidays.filter(h => h.id !== id)
    setHolidays(next)
    persist('holidays', next)
  }

  function removeEmployee(id) {
    const next = employees.filter(e => e.id !== id)
    setEmployees(next)
    persist('employees', next)
  }

  function openHolidayEditor(item) {
    setEditingHoliday(item || null)
    setHolidayForm(item || { name: '', date: '2026-01-01', type: 'Regular', closed: false })
  }

  function openEmployeeEditor(item) {
    setEditingEmployee(item || null)
    setEmployeeForm(item || { name: '', email: '', availVL: 10, usedVL: 0, availSL: 5, usedSL: 0, unpaid: 0 })
  }

  const recipients = employees.map(e => e.email).filter(Boolean).join(',')
  const emailText = `${emailBody}\n\nHoliday: ${selectedHoliday?.name || ''} (${selectedHoliday ? dateLabel(selectedHoliday.date) : ''}, ${selectedHoliday ? dayLabel(selectedHoliday.date) : ''})`

  function openMailApp() {
    window.location.href = `mailto:${recipients}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailText)}`
  }

  async function copyEmailDraft() {
    await navigator.clipboard.writeText(`To: ${recipients}\nSubject: ${emailSubject}\n\n${emailText}`)
    showToast('Email draft copied')
  }

  return <div className={`app ${theme}`}>
    <main className="shell">
      <header className="header">
        <div>
          <h1>HR Holiday & Leave Manager</h1>
          <p>Manage holidays, leave balances, unpaid leave, and employee announcements.</p>
          <div className="tabs">
            <button className={tab === 'holidays' ? 'active' : ''} onClick={() => setTab('holidays')}><CalendarDays size={16}/> Holidays 2026</button>
            <button className={tab === 'leave' ? 'active' : ''} onClick={() => setTab('leave')}><Users size={16}/> Leave monitor</button>
          </div>
        </div>
        <div className="header-actions">
          <button className="ghost" onClick={() => setThemeAndSave(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={16}/> : <Moon size={16}/>} Theme</button>
          <button className="primary" onClick={() => setEmailOpen(true)}><Mail size={16}/> Email employees</button>
        </div>
      </header>

      {tab === 'holidays' && <section className="fade-in">
        <div className="stats-grid">
          <StatCard label="Total holidays" value={holidays.length}/>
          <StatCard label="Regular holidays" value={stats.regular}/>
          <StatCard label="Special non-working" value={stats.special}/>
          <StatCard label="Office closed days" value={stats.closed}/>
        </div>
        <div className="toolbar">
          <label className="search"><Search size={17}/><input value={holidaySearch} onChange={e => setHolidaySearch(e.target.value)} placeholder="Search holidays..."/></label>
          <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}><option>All types</option><option>Regular</option><option>Special non-working</option></select>
          <button className="secondary" onClick={() => openHolidayEditor()}><Plus size={16}/> Add holiday</button>
          <button className="secondary" onClick={() => downloadJson('holidays.json', holidays)}><Download size={16}/> Export</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Holiday</th><th>Date</th><th>Day</th><th>Type</th><th>Closed</th><th></th></tr></thead>
            <tbody>{filteredHolidays.map(h => <tr key={h.id}><td>{h.name}</td><td>{dateLabel(h.date)}</td><td className="muted">{dayLabel(h.date)}</td><td><Pill variant={h.type === 'Regular' ? 'blue' : 'amber'}>{h.type}</Pill></td><td>{h.closed ? <Pill variant="green">Closed</Pill> : '-'}</td><td className="row-actions"><button onClick={() => openHolidayEditor(h)}><Pencil size={15}/></button><button onClick={() => removeHoliday(h.id)}><Trash2 size={15}/></button></td></tr>)}</tbody>
          </table>
          {!filteredHolidays.length && <EmptyState text="No holidays found."/>}
        </div>
      </section>}

      {tab === 'leave' && <section className="fade-in">
        <div className="stats-grid">
          <StatCard label="Employees (2026)" value={employees.length}/>
          <StatCard label="Avg remaining VL" value={stats.avgVL.toFixed(1)}/>
          <StatCard label="Avg remaining SL" value={stats.avgSL.toFixed(1)}/>
          <StatCard label="Total unpaid leaves" value={stats.unpaid}/>
        </div>
        <div className="toolbar">
          <label className="search"><Search size={17}/><input value={employeeSearch} onChange={e => setEmployeeSearch(e.target.value)} placeholder="Search employee..."/></label>
          <button className="secondary" onClick={() => openEmployeeEditor()}><Plus size={16}/> Add record</button>
          <button className="secondary" onClick={() => downloadJson('employees.json', employees)}><Download size={16}/> Export</button>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Employee</th><th>Email</th><th>Avail VL</th><th>Used VL</th><th>Rem VL</th><th>Avail SL</th><th>Used SL</th><th>Rem SL</th><th>Unpaid</th><th></th></tr></thead>
            <tbody>{filteredEmployees.map(e => <tr key={e.id}><td>{e.name}</td><td className="muted">{e.email}</td><td>{e.availVL}</td><td><Pill variant="mint">{e.usedVL}</Pill></td><td>{e.availVL - e.usedVL}</td><td>{e.availSL}</td><td><Pill variant="rose">{e.usedSL}</Pill></td><td>{e.availSL - e.usedSL}</td><td>{e.unpaid ? <Pill variant="rose">{e.unpaid}</Pill> : '-'}</td><td className="row-actions"><button onClick={() => openEmployeeEditor(e)}><Pencil size={15}/></button><button onClick={() => removeEmployee(e.id)}><Trash2 size={15}/></button></td></tr>)}</tbody>
          </table>
          {!filteredEmployees.length && <EmptyState text="No employees found."/>}
        </div>
      </section>}
    </main>

    {(editingHoliday || holidayForm.name || holidayForm.date !== '2026-01-01') && <div className="modal"><form className="dialog" onSubmit={saveHoliday}><div className="modal-head"><h2>{editingHoliday ? 'Edit holiday' : 'Add holiday'}</h2><button type="button" onClick={() => { setEditingHoliday(null); setHolidayForm({ name: '', date: '2026-01-01', type: 'Regular', closed: false }) }}><X size={18}/></button></div><label>Name<input required value={holidayForm.name} onChange={e => setHolidayForm({...holidayForm, name: e.target.value})}/></label><label>Date<input type="date" required value={holidayForm.date} onChange={e => setHolidayForm({...holidayForm, date: e.target.value})}/></label><label>Type<select value={holidayForm.type} onChange={e => setHolidayForm({...holidayForm, type: e.target.value})}><option>Regular</option><option>Special non-working</option></select></label><label className="check"><input type="checkbox" checked={holidayForm.closed} onChange={e => setHolidayForm({...holidayForm, closed: e.target.checked})}/> Office closed</label><button className="primary full" type="submit">Save holiday</button></form></div>}

    {(editingEmployee || employeeForm.name || employeeForm.email) && <div className="modal"><form className="dialog wide" onSubmit={saveEmployee}><div className="modal-head"><h2>{editingEmployee ? 'Edit employee' : 'Add employee'}</h2><button type="button" onClick={() => { setEditingEmployee(null); setEmployeeForm({ name: '', email: '', availVL: 10, usedVL: 0, availSL: 5, usedSL: 0, unpaid: 0 }) }}><X size={18}/></button></div><div className="form-grid"><label>Name<input required value={employeeForm.name} onChange={e => setEmployeeForm({...employeeForm, name: e.target.value})}/></label><label>Email<input type="email" value={employeeForm.email} onChange={e => setEmployeeForm({...employeeForm, email: e.target.value})}/></label><label>Avail VL<input type="number" value={employeeForm.availVL} onChange={e => setEmployeeForm({...employeeForm, availVL: e.target.value})}/></label><label>Used VL<input type="number" value={employeeForm.usedVL} onChange={e => setEmployeeForm({...employeeForm, usedVL: e.target.value})}/></label><label>Avail SL<input type="number" value={employeeForm.availSL} onChange={e => setEmployeeForm({...employeeForm, availSL: e.target.value})}/></label><label>Used SL<input type="number" value={employeeForm.usedSL} onChange={e => setEmployeeForm({...employeeForm, usedSL: e.target.value})}/></label><label>Unpaid<input type="number" step="0.5" value={employeeForm.unpaid} onChange={e => setEmployeeForm({...employeeForm, unpaid: e.target.value})}/></label></div><button className="primary full" type="submit">Save employee</button></form></div>}

    {emailOpen && <div className="modal"><div className="dialog wide"><div className="modal-head"><h2>Email employees</h2><button onClick={() => setEmailOpen(false)}><X size={18}/></button></div><label>Holiday<select value={selectedHolidayId} onChange={e => setSelectedHolidayId(e.target.value)}>{holidays.map(h => <option value={h.id} key={h.id}>{h.name} — {dateLabel(h.date)}</option>)}</select></label><label>Subject<input value={emailSubject} onChange={e => setEmailSubject(e.target.value)}/></label><label>Message<textarea rows="8" value={emailBody} onChange={e => setEmailBody(e.target.value)}/></label><div className="recipients">Recipients: {employees.map(e => e.email).filter(Boolean).join(', ')}</div><div className="modal-actions"><button className="secondary" onClick={copyEmailDraft}><Copy size={16}/> Copy Email Draft</button><button className="primary" onClick={openMailApp}><Send size={16}/> Open Email App</button></div></div></div>}

    {toast && <div className="toast">{toast}</div>}
  </div>
}

createRoot(document.getElementById('root')).render(<App />)
