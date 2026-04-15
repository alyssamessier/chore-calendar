import { useState, useEffect, useRef } from 'react'
import { Box, Typography, IconButton, Tooltip, Fab, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, FormControl, InputLabel, Chip, Stack, Avatar, Divider } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import TodayIcon from '@mui/icons-material/Today'
import PeopleIcon from '@mui/icons-material/People'
import DeleteIcon from '@mui/icons-material/Delete'
import { db } from '../firebase'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import PersonCard from './PersonCard'
import HouseholdChores from './HouseholdChores'

const COLOR_PRESETS = [
  { bg: '#f3d5b5', accent: '#e07a5f' },
  { bg: '#c9e4de', accent: '#3d9970' },
  { bg: '#d4c5f9', accent: '#7c3aed' },
  { bg: '#ffd6e0', accent: '#e91e8c' },
  { bg: '#c5dff8', accent: '#1565c0' },
  { bg: '#fff3b0', accent: '#f59e0b' },
  { bg: '#d5f5e3', accent: '#27ae60' },
  { bg: '#fde8d8', accent: '#e67e22' },
  { bg: '#eaf4fb', accent: '#2980b9' },
  { bg: '#f9ebea', accent: '#c0392b' },
]

const DEFAULT_PEOPLE = [
  { id: 'p1', name: 'Person 1', color: '#f3d5b5', accent: '#e07a5f', avatar: '#e07a5f' },
  { id: 'p2', name: 'Person 2', color: '#c9e4de', accent: '#3d9970', avatar: '#3d9970' },
]

const DEFAULT_HOUSEHOLD_CHORES = [
  { id: 'h1', label: 'Wash dishes', emoji: '🍽️', points: 15 },
  { id: 'h2', label: 'Vacuum', emoji: '🧹', points: 20 },
  { id: 'h3', label: 'Take out trash', emoji: '🗑️', points: 10 },
  { id: 'h4', label: 'Do laundry', emoji: '🧺', points: 25 },
]

const EMOJI_OPTIONS = [
  { label: 'Broom', emoji: '🧹' },
  { label: 'Dishes', emoji: '🍽️' },
  { label: 'Trash', emoji: '🗑️' },
  { label: 'Laundry', emoji: '🧺' },
  { label: 'Sponge', emoji: '🧽' },
  { label: 'Bucket', emoji: '🪣' },
  { label: 'Toilet', emoji: '🚽' },
  { label: 'Bath', emoji: '🛁' },
  { label: 'Bed', emoji: '🛏️' },
  { label: 'Cooking', emoji: '🍳' },
  { label: 'Groceries', emoji: '🛒' },
  { label: 'Plants', emoji: '🪴' },
  { label: 'Pets', emoji: '🐾' },
  { label: 'Car', emoji: '🚗' },
  { label: 'Recycling', emoji: '♻️' },
  { label: 'Mail', emoji: '📬' },
  { label: 'Tools', emoji: '🔧' },
  { label: 'Snow', emoji: '❄️' },
  { label: 'Lawn', emoji: '🌿' },
  { label: 'Windows', emoji: '🪟' },
]

function getDateKey(date) {
  return date.toISOString().split('T')[0]
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

export default function ChoreApp() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [people, setPeople] = useState(DEFAULT_PEOPLE)
  const [householdChores, setHouseholdChores] = useState(DEFAULT_HOUSEHOLD_CHORES)
  const [rawPoints, setRawPoints] = useState({})
  const [completions, setCompletions] = useState({})
  const [assignments, setAssignments] = useState({})
  const [loaded, setLoaded] = useState(false)
  const isSaving = useRef(false)
  const [addChoreOpen, setAddChoreOpen] = useState(false)
  const [newChore, setNewChore] = useState({ label: '', emoji: '🧹', points: 10 })
  const [peopleOpen, setPeopleOpen] = useState(false)
  const [newPersonName, setNewPersonName] = useState('')
  const [newPersonColor, setNewPersonColor] = useState(COLOR_PRESETS[2])

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'app', 'state'), (snap) => {
      if (isSaving.current) return
      if (snap.exists()) {
        const data = snap.data()
        if (data.people) setPeople(data.people)
        if (data.householdChores) setHouseholdChores(data.householdChores)
        if (data.rawPoints) setRawPoints(data.rawPoints)
        if (data.assignments) setAssignments(data.assignments)
        else setAssignments({})
        if (data.completions) {
          const restored = {}
          for (const dk in data.completions) {
            restored[dk] = { chores: new Set(data.completions[dk] || []) }
          }
          setCompletions(restored)
        }
      }
      setLoaded(true)
    })
    return () => unsub()
  }, [])

  const saveAll = async (overrides = {}) => {
    isSaving.current = true
    const ref = doc(db, 'app', 'state')
    const currentCompletions = overrides.completions !== undefined ? overrides.completions : (() => {
      const s = {}
      for (const dk in completions) {
        s[dk] = [...(completions[dk].chores || [])]
      }
      return s
    })()
    await setDoc(ref, {
      people: overrides.people !== undefined ? overrides.people : people,
      householdChores: overrides.householdChores !== undefined ? overrides.householdChores : householdChores,
      rawPoints: overrides.rawPoints !== undefined ? overrides.rawPoints : rawPoints,
      assignments: overrides.assignments !== undefined ? overrides.assignments : assignments,
      completions: currentCompletions,
    })
    setTimeout(() => { isSaving.current = false }, 2000)
  }

  const dateKey = getDateKey(currentDate)
  const getDayData = () => completions[dateKey] || { chores: new Set() }
  const getDayAssignments = () => assignments[dateKey] || {}

  const assignChore = async (choreId, personId) => {
    const day = assignments[dateKey] || {}
    let newDay
    if (personId === null) {
      newDay = { ...day }
      delete newDay[choreId]
    } else {
      newDay = { ...day, [choreId]: personId }
    }
    const newAssignments = { ...assignments, [dateKey]: newDay }
    setAssignments(newAssignments)

    const compDay = completions[dateKey] || { chores: new Set() }
    const chores = new Set(compDay.chores)
    chores.delete(choreId)
    const newCompletions = { ...completions, [dateKey]: { chores } }
    setCompletions(newCompletions)
    const serializableCompletions = {}
    for (const dk in newCompletions) {
      serializableCompletions[dk] = [...(newCompletions[dk].chores || [])]
    }

    await saveAll({ assignments: newAssignments, completions: serializableCompletions })
  }

  const toggleChore = async (choreId, personId) => {
    const day = getDayData()
    const wasCompleted = day.chores.has(choreId)
    const chore = householdChores.find(c => c.id === choreId)
    if (!chore) return

    const chores = new Set(day.chores)
    wasCompleted ? chores.delete(choreId) : chores.add(choreId)
    const newCompletions = { ...completions, [dateKey]: { chores } }
    setCompletions(newCompletions)
    const serializableCompletions = {}
    for (const dk in newCompletions) {
      serializableCompletions[dk] = [...(newCompletions[dk].chores || [])]
    }

    const current = rawPoints[personId] || 0
    const newVal = Math.max(0, current + (wasCompleted ? -chore.points : chore.points))
    const newRawPoints = { ...rawPoints, [personId]: newVal }
    setRawPoints(newRawPoints)

    await saveAll({ completions: serializableCompletions, rawPoints: newRawPoints })
  }

  const unassignChore = async (choreId, personId) => {
    const day = getDayData()
    const wasCompleted = day.chores.has(choreId)
    const chore = householdChores.find(c => c.id === choreId)

    const day2 = assignments[dateKey] || {}
    const newDay = { ...day2 }
    delete newDay[choreId]
    const newAssignments = { ...assignments, [dateKey]: newDay }
    setAssignments(newAssignments)

    const compDay = completions[dateKey] || { chores: new Set() }
    const chores = new Set(compDay.chores)
    chores.delete(choreId)
    const newCompletions = { ...completions, [dateKey]: { chores } }
    setCompletions(newCompletions)
    const serializableCompletions = {}
    for (const dk in newCompletions) {
      serializableCompletions[dk] = [...(newCompletions[dk].chores || [])]
    }

    let newRawPoints = rawPoints
    if (wasCompleted && chore) {
      newRawPoints = { ...rawPoints, [personId]: Math.max(0, (rawPoints[personId] || 0) - chore.points) }
      setRawPoints(newRawPoints)
    }

    await saveAll({
      assignments: newAssignments,
      completions: serializableCompletions,
      rawPoints: newRawPoints
    })
  }

  const handleAddChore = async () => {
    if (!newChore.label.trim()) return
    const id = 'chore_' + Date.now()
    const newChores = [...householdChores, { id, label: newChore.label, emoji: newChore.emoji, points: Number(newChore.points) }]
    setHouseholdChores(newChores)
    await saveAll({ householdChores: newChores })
    setNewChore({ label: '', emoji: '🧹', points: 10 })
    setAddChoreOpen(false)
  }

  const handleAddPerson = async () => {
    if (!newPersonName.trim()) return
    const id = 'p_' + Date.now()
    const newPeople = [...people, { id, name: newPersonName.trim(), color: newPersonColor.bg, accent: newPersonColor.accent, avatar: newPersonColor.accent }]
    setPeople(newPeople)
    await saveAll({ people: newPeople })
    setNewPersonName('')
    setNewPersonColor(COLOR_PRESETS[2])
  }

  const handleDeletePerson = async (personId) => {
    const newPeople = people.filter(p => p.id !== personId)
    setPeople(newPeople)
    const newAssignments = {}
    for (const dk in assignments) {
      const day = { ...assignments[dk] }
      for (const choreId in day) {
        if (day[choreId] === personId) delete day[choreId]
      }
      newAssignments[dk] = day
    }
    setAssignments(newAssignments)
    const newRawPoints = { ...rawPoints }
    delete newRawPoints[personId]
    setRawPoints(newRawPoints)
    await saveAll({ people: newPeople, assignments: newAssignments, rawPoints: newRawPoints })
  }

  const handleChangePersonColor = async (personId, preset) => {
    const newPeople = people.map(p => p.id === personId ? { ...p, color: preset.bg, accent: preset.accent, avatar: preset.accent } : p)
    setPeople(newPeople)
    await saveAll({ people: newPeople })
  }

  const updatePersonName = async (id, name) => {
    const newPeople = people.map(p => p.id === id ? { ...p, name } : p)
    setPeople(newPeople)
    await saveAll({ people: newPeople })
  }

  const handlePhotoUpload = async (personId, file) => {
    const reader = new FileReader()
    reader.onload = async (e) => {
      const base64 = e.target.result
      const newPeople = people.map(p => p.id === personId ? { ...p, photoURL: base64 } : p)
      setPeople(newPeople)
      await saveAll({ people: newPeople })
    }
    reader.readAsDataURL(file)
  }

  const dayData = getDayData()
  const dayAssign = getDayAssignments()
  const unassignedChores = householdChores.filter(c => !dayAssign[c.id])
  const getPersonChores = (personId) => householdChores.filter(c => dayAssign[c.id] === personId)
  const getPersonCompleted = (personId) => householdChores.filter(c => dayAssign[c.id] === personId && dayData.chores.has(c.id)).length

  if (!loaded) return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f0ece8' }}>
      <Typography fontWeight={700} color="text.secondary">Loading...</Typography>
    </Box>
  )

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f0ece8' }}>
      <Box sx={{ px: 4, py: 2.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: 'white', boxShadow: '0 2px 12px rgba(0,0,0,0.07)', position: 'sticky', top: 0, zIndex: 10 }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="h5" color="#3a3a3a" sx={{ fontFamily: '"Raleway", sans-serif', fontSize: '1.6rem', fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase' }}>Chores</Typography>
          <Tooltip title="Manage people">
            <IconButton onClick={() => setPeopleOpen(true)} size="small" sx={{ ml: 1, color: 'text.secondary' }}>
              <PeopleIcon />
            </IconButton>
          </Tooltip>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          <IconButton onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() - 1); setCurrentDate(d) }}>
            <NavigateBeforeIcon />
          </IconButton>
          <Chip icon={<TodayIcon />} label={formatDate(currentDate)} onClick={() => setCurrentDate(new Date())} sx={{ fontWeight: 700, fontSize: '0.9rem', bgcolor: '#f3d5b5', cursor: 'pointer' }} />
          <IconButton onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() + 1); setCurrentDate(d) }}>
            <NavigateNextIcon />
          </IconButton>
        </Stack>
      </Box>

      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', gap: 3, mb: 4, flexWrap: 'wrap' }}>
          {people.map(person => (
            <PersonCard
              key={person.id}
              person={person}
              assignedChores={getPersonChores(person.id)}
              completedChores={dayData.chores}
              rawPoints={rawPoints[person.id] || 0}
              completedCount={getPersonCompleted(person.id)}
              totalCount={getPersonChores(person.id).length}
              onToggleChore={(choreId) => toggleChore(choreId, person.id)}
              onUnassignChore={(choreId) => unassignChore(choreId, person.id)}
              onNameChange={(name) => updatePersonName(person.id, name)}
              onPhotoUpload={handlePhotoUpload}
            />
          ))}
        </Box>

        <HouseholdChores
          chores={unassignedChores}
          people={people}
          onAssign={assignChore}
          onDelete={async (choreId) => {
            const newChores = householdChores.filter(c => c.id !== choreId)
            setHouseholdChores(newChores)
            await saveAll({ householdChores: newChores })
          }}
        />
      </Box>

      <Tooltip title="Add chore to bucket">
        <Fab color="primary" sx={{ position: 'fixed', bottom: 32, right: 32 }} onClick={() => setAddChoreOpen(true)}>
          <AddIcon />
        </Fab>
      </Tooltip>

      <Dialog open={addChoreOpen} onClose={() => setAddChoreOpen(false)} PaperProps={{ sx: { borderRadius: 4, p: 1 } }}>
        <DialogTitle fontWeight={800}>Add New Chore</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1, minWidth: 320 }}>
          <TextField label="Chore name" value={newChore.label} onChange={e => setNewChore(p => ({ ...p, label: e.target.value }))} fullWidth />
          <FormControl fullWidth>
            <InputLabel>Emoji</InputLabel>
            <Select value={newChore.emoji} label="Emoji" onChange={e => setNewChore(p => ({ ...p, emoji: e.target.value }))}>
              {EMOJI_OPTIONS.map(({ label, emoji }) => (
                <MenuItem key={emoji} value={emoji}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography fontSize="1.2rem">{emoji}</Typography>
                    <Typography fontSize="0.85rem">{label}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Points" type="number" value={newChore.points} onChange={e => setNewChore(p => ({ ...p, points: e.target.value }))} fullWidth />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddChoreOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddChore} disabled={!newChore.label.trim()}>Add</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={peopleOpen} onClose={() => setPeopleOpen(false)} PaperProps={{ sx: { borderRadius: 4, p: 1, minWidth: 380 } }}>
        <DialogTitle fontWeight={800}>Manage People</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {people.map(person => (
            <Box key={person.id} sx={{ bgcolor: '#f8f8f8', borderRadius: 3, p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1.5} mb={1.5}>
                <Avatar src={person.photoURL || undefined} sx={{ bgcolor: person.avatar, width: 36, height: 36, fontSize: '1rem', fontWeight: 800 }}>
                  {!person.photoURL && person.name.charAt(0).toUpperCase()}
                </Avatar>
                <Typography fontWeight={700} flex={1}>{person.name}</Typography>
                <Tooltip title="Delete person">
                  <IconButton size="small" onClick={() => handleDeletePerson(person.id)} sx={{ color: 'error.main', opacity: 0.6, '&:hover': { opacity: 1 } }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.8}>Card color:</Typography>
              <Stack direction="row" flexWrap="wrap" gap={0.8}>
                {COLOR_PRESETS.map((preset, i) => (
                  <Box key={i} onClick={() => handleChangePersonColor(person.id, preset)} sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: preset.bg, border: '3px solid', borderColor: person.color === preset.bg ? preset.accent : 'transparent', cursor: 'pointer', boxShadow: person.color === preset.bg ? '0 0 0 2px ' + preset.accent + '44' : 'none', transition: 'all 0.15s', '&:hover': { transform: 'scale(1.2)' } }} />
                ))}
              </Stack>
            </Box>
          ))}

          <Divider />

          <Typography fontWeight={800} fontSize="0.95rem">Add New Person</Typography>
          <TextField label="Name" value={newPersonName} onChange={e => setNewPersonName(e.target.value)} fullWidth size="small" onKeyDown={e => e.key === 'Enter' && handleAddPerson()} />
          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.8}>Pick a color:</Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.8}>
              {COLOR_PRESETS.map((preset, i) => (
                <Box key={i} onClick={() => setNewPersonColor(preset)} sx={{ width: 28, height: 28, borderRadius: '50%', bgcolor: preset.bg, border: '3px solid', borderColor: newPersonColor === preset ? preset.accent : 'transparent', cursor: 'pointer', transition: 'all 0.15s', '&:hover': { transform: 'scale(1.2)' } }} />
              ))}
            </Stack>
          </Box>
          <Button variant="contained" onClick={handleAddPerson} disabled={!newPersonName.trim()} sx={{ borderRadius: 3 }}>
            Add Person
          </Button>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setPeopleOpen(false)}>Done</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}