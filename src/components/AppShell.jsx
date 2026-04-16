import { useState, useEffect, useRef } from 'react'
import { Box, Typography, IconButton, Tooltip, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Chip, Stack, Avatar, Divider } from '@mui/material'
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore'
import NavigateNextIcon from '@mui/icons-material/NavigateNext'
import TodayIcon from '@mui/icons-material/Today'
import PeopleIcon from '@mui/icons-material/People'
import DeleteIcon from '@mui/icons-material/Delete'
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import CleaningServicesIcon from '@mui/icons-material/CleaningServices'
import PetsIcon from '@mui/icons-material/Pets'
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter'
import RestaurantIcon from '@mui/icons-material/Restaurant'
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore'
import BarChartIcon from '@mui/icons-material/BarChart'
import SettingsIcon from '@mui/icons-material/Settings'
import { db } from '../firebase'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import ChoresTab from './tabs/ChoresTab'
import CalendarTab from './tabs/CalendarTab'
import PetsTab from './tabs/PetsTab'
import FitnessTab from './tabs/FitnessTab'
import MealsTab from './tabs/MealsTab'
import GroceryTab from './tabs/GroceryTab'
import StatsTab from './tabs/StatsTab'

const COLOR_PRESETS = [
  { bg: '#fde8d8', accent: '#c2622d' },
  { bg: '#d4eddd', accent: '#2a7a5e' },
  { bg: '#e4dcf9', accent: '#6b4fd8' },
  { bg: '#fddde6', accent: '#c2395d' },
  { bg: '#d6eaf8', accent: '#1a6fa0' },
  { bg: '#fef9c3', accent: '#a07c00' },
  { bg: '#d5f5e3', accent: '#1e8449' },
  { bg: '#fde8cc', accent: '#b85c00' },
  { bg: '#e8f4fb', accent: '#1a6fa0' },
  { bg: '#fce4ec', accent: '#ad1457' },
]

const DEFAULT_PEOPLE = [
  { id: 'p1', name: 'Person 1', color: '#fde8d8', accent: '#c2622d', avatar: '#c2622d' },
  { id: 'p2', name: 'Person 2', color: '#d4eddd', accent: '#2a7a5e', avatar: '#2a7a5e' },
]

const DEFAULT_BUCKETS = [
  {
    id: 'bucket_default',
    label: 'Household',
    chores: [
      { id: 'h1', label: 'Wash dishes', emoji: '🍽️', points: 15 },
      { id: 'h2', label: 'Vacuum', emoji: '🧹', points: 20 },
      { id: 'h3', label: 'Take out trash', emoji: '🗑️', points: 10 },
      { id: 'h4', label: 'Do laundry', emoji: '🧺', points: 25 },
    ]
  }
]

const NAV_ITEMS = [
  { icon: <CalendarMonthIcon />, label: 'Calendar' },
  { icon: <CleaningServicesIcon />, label: 'Chores' },
  { icon: <PetsIcon />, label: 'Pets' },
  { icon: <FitnessCenterIcon />, label: 'Fitness' },
  { icon: <RestaurantIcon />, label: 'Meals' },
  { icon: <LocalGroceryStoreIcon />, label: 'Grocery' },
  { icon: <BarChartIcon />, label: 'Stats' },
]

function getDateKey(date) {
  return date.toISOString().split('T')[0]
}

function formatDate(date) {
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
}

export default function AppShell() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [people, setPeople] = useState(DEFAULT_PEOPLE)
  const [buckets, setBuckets] = useState(DEFAULT_BUCKETS)
  const [rawPoints, setRawPoints] = useState({})
  const [completions, setCompletions] = useState({})
  const [assignments, setAssignments] = useState({})
  const [loaded, setLoaded] = useState(false)
  const [activeNav, setActiveNav] = useState(1)
  const isSaving = useRef(false)
  const [peopleOpen, setPeopleOpen] = useState(false)
  const [newPersonName, setNewPersonName] = useState('')
  const [newPersonColor, setNewPersonColor] = useState(COLOR_PRESETS[2])

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'app', 'state'), (snap) => {
      if (isSaving.current) return
      if (snap.exists()) {
        const data = snap.data()
        if (data.people) setPeople(data.people)
        if (data.buckets) setBuckets(data.buckets)
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
      buckets: overrides.buckets !== undefined ? overrides.buckets : buckets,
      rawPoints: overrides.rawPoints !== undefined ? overrides.rawPoints : rawPoints,
      assignments: overrides.assignments !== undefined ? overrides.assignments : assignments,
      completions: currentCompletions,
    })
    setTimeout(() => { isSaving.current = false }, 2000)
  }

  const dateKey = getDateKey(currentDate)
  const getDayData = () => completions[dateKey] || { chores: new Set() }
  const getDayAssignments = () => assignments[dateKey] || {}

  const assignChore = async (choreId, personId, bucketId) => {
    const day = assignments[dateKey] || {}
    let newDay
    if (personId === null) { newDay = { ...day }; delete newDay[choreId] }
    else newDay = { ...day, [choreId]: personId }
    const newAssignments = { ...assignments, [dateKey]: newDay }
    setAssignments(newAssignments)
    const compDay = completions[dateKey] || { chores: new Set() }
    const chores = new Set(compDay.chores)
    chores.delete(choreId)
    const newCompletions = { ...completions, [dateKey]: { chores } }
    setCompletions(newCompletions)
    const serializableCompletions = {}
    for (const dk in newCompletions) serializableCompletions[dk] = [...(newCompletions[dk].chores || [])]
    await saveAll({ assignments: newAssignments, completions: serializableCompletions })
  }

  const toggleChore = async (choreId, personId) => {
    const day = getDayData()
    const wasCompleted = day.chores.has(choreId)
    const chore = buckets.flatMap(b => b.chores).find(c => c.id === choreId)
    if (!chore) return
    const chores = new Set(day.chores)
    wasCompleted ? chores.delete(choreId) : chores.add(choreId)
    const newCompletions = { ...completions, [dateKey]: { chores } }
    setCompletions(newCompletions)
    const serializableCompletions = {}
    for (const dk in newCompletions) serializableCompletions[dk] = [...(newCompletions[dk].chores || [])]
    const current = rawPoints[personId] || 0
    const newVal = Math.max(0, current + (wasCompleted ? -chore.points : chore.points))
    const newRawPoints = { ...rawPoints, [personId]: newVal }
    setRawPoints(newRawPoints)
    await saveAll({ completions: serializableCompletions, rawPoints: newRawPoints })
  }

  const unassignChore = async (choreId, personId) => {
    const day = getDayData()
    const wasCompleted = day.chores.has(choreId)
    const chore = buckets.flatMap(b => b.chores).find(c => c.id === choreId)
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
    for (const dk in newCompletions) serializableCompletions[dk] = [...(newCompletions[dk].chores || [])]
    let newRawPoints = rawPoints
    if (wasCompleted && chore) {
      newRawPoints = { ...rawPoints, [personId]: Math.max(0, (rawPoints[personId] || 0) - chore.points) }
      setRawPoints(newRawPoints)
    }
    await saveAll({ assignments: newAssignments, completions: serializableCompletions, rawPoints: newRawPoints })
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
      for (const choreId in day) { if (day[choreId] === personId) delete day[choreId] }
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

  if (!loaded) return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#f5f3ef' }}>
      <Typography fontWeight={700} color="text.secondary">Loading...</Typography>
    </Box>
  )

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f3ef', display: 'flex' }}>

      {/* Left sidebar */}
      <Box sx={{
        width: 72, flexShrink: 0, bgcolor: 'white', borderRight: '1px solid #e8e4de',
        display: 'flex', flexDirection: 'column', alignItems: 'center', py: 2,
        position: 'sticky', top: 0, height: '100vh', zIndex: 20,
      }}>
        <Box sx={{ mb: 3, width: 40, height: 40, borderRadius: '12px', bgcolor: '#c2622d', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography sx={{ color: 'white', fontWeight: 800, fontSize: '1rem', fontFamily: '"Raleway", sans-serif' }}>H</Typography>
        </Box>
        <Divider sx={{ width: '60%', mb: 2 }} />
        <Stack spacing={0.5} alignItems="center" flex={1}>
          {NAV_ITEMS.map((item, i) => (
            <Tooltip key={i} title={item.label} placement="right">
              <Box onClick={() => setActiveNav(i)} sx={{
                width: 48, height: 48, borderRadius: '12px',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                bgcolor: activeNav === i ? '#fde8d8' : 'transparent',
                color: activeNav === i ? '#c2622d' : '#999',
                transition: 'all 0.15s',
                '&:hover': { bgcolor: activeNav === i ? '#fde8d8' : '#f5f3ef', color: activeNav === i ? '#c2622d' : '#555' }
              }}>
                <Box sx={{ fontSize: '1.25rem', display: 'flex', '& svg': { fontSize: '1.25rem' } }}>{item.icon}</Box>
                <Typography sx={{ fontSize: '0.55rem', fontWeight: 700, mt: 0.3, letterSpacing: '0.02em' }}>{item.label}</Typography>
              </Box>
            </Tooltip>
          ))}
        </Stack>
        <Tooltip title="Settings" placement="right">
          <Box sx={{
            width: 48, height: 48, borderRadius: '12px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#bbb',
            '&:hover': { bgcolor: '#f5f3ef', color: '#555' }
          }}>
            <SettingsIcon sx={{ fontSize: '1.25rem' }} />
            <Typography sx={{ fontSize: '0.55rem', fontWeight: 700, mt: 0.3 }}>Settings</Typography>
          </Box>
        </Tooltip>
      </Box>

      {/* Main area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

        {/* Header */}
        <Box sx={{
          width: '100%', bgcolor: '#ebebeb', borderBottom: '1px solid #d8d5d0',
          position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 1px 6px rgba(0,0,0,0.06)',
        }}>
          <Box sx={{ px: 4, py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Typography sx={{ fontFamily: '"Raleway", sans-serif', fontSize: '1.2rem', fontWeight: 800, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#1a1a1a' }}>
                {NAV_ITEMS[activeNav]?.label || 'Chores'}
              </Typography>
              {activeNav === 1 && (
                <Tooltip title="Manage people">
                  <IconButton onClick={() => setPeopleOpen(true)} size="small" sx={{ color: 'text.secondary', borderRadius: '8px' }}>
                    <PeopleIcon sx={{ fontSize: '1.1rem' }} />
                  </IconButton>
                </Tooltip>
              )}
            </Stack>
            {activeNav === 1 && (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <IconButton size="small" onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() - 1); setCurrentDate(d) }}>
                  <NavigateBeforeIcon fontSize="small" />
                </IconButton>
                <Chip icon={<TodayIcon sx={{ fontSize: '0.85rem !important' }} />} label={formatDate(currentDate)}
                  onClick={() => setCurrentDate(new Date())}
                  sx={{ fontWeight: 700, fontSize: '0.82rem', bgcolor: '#fde8d8', border: 'none', cursor: 'pointer', borderRadius: '10px' }}
                />
                <IconButton size="small" onClick={() => { const d = new Date(currentDate); d.setDate(d.getDate() + 1); setCurrentDate(d) }}>
                  <NavigateNextIcon fontSize="small" />
                </IconButton>
              </Stack>
            )}
          </Box>
        </Box>

        {/* Tab content */}
        <Box sx={{ px: 4, py: 4, flex: 1 }}>
          {activeNav === 0 && <CalendarTab />}
          {activeNav === 1 && (
            <ChoresTab
              people={people}
              buckets={buckets}
              setBuckets={setBuckets}
              dayData={dayData}
              dayAssign={dayAssign}
              rawPoints={rawPoints}
              assignChore={assignChore}
              toggleChore={toggleChore}
              unassignChore={unassignChore}
              updatePersonName={updatePersonName}
              handlePhotoUpload={handlePhotoUpload}
              saveAll={saveAll}
            />
          )}
          {activeNav === 2 && <PetsTab />}
          {activeNav === 3 && <FitnessTab />}
          {activeNav === 4 && <MealsTab />}
          {activeNav === 5 && <GroceryTab />}
          {activeNav === 6 && <StatsTab />}
        </Box>
      </Box>

      {/* Manage People Dialog */}
      <Dialog open={peopleOpen} onClose={() => setPeopleOpen(false)} PaperProps={{ sx: { borderRadius: '16px', p: 1, minWidth: 380 } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1rem' }}>Manage People</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {people.map(person => (
            <Box key={person.id} sx={{ bgcolor: person.color, borderRadius: '12px', p: 2 }}>
              <Stack direction="row" alignItems="center" spacing={1.5} mb={1.5}>
                <Avatar src={person.photoURL || undefined} sx={{ bgcolor: person.accent, width: 34, height: 34, fontSize: '0.9rem', fontWeight: 800, borderRadius: '8px' }}>
                  {!person.photoURL && person.name.charAt(0).toUpperCase()}
                </Avatar>
                <Typography fontWeight={700} flex={1} fontSize="0.95rem">{person.name}</Typography>
                <Tooltip title="Delete person">
                  <IconButton size="small" onClick={() => handleDeletePerson(person.id)} sx={{ color: 'error.main', opacity: 0.5, '&:hover': { opacity: 1 } }}>
                    <DeleteIcon sx={{ fontSize: '0.9rem' }} />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.8}>Card color:</Typography>
              <Stack direction="row" flexWrap="wrap" gap={0.8}>
                {COLOR_PRESETS.map((preset, i) => (
                  <Box key={i} onClick={() => handleChangePersonColor(person.id, preset)} sx={{
                    width: 26, height: 26, borderRadius: '6px', bgcolor: preset.bg,
                    border: `2.5px solid ${person.color === preset.bg ? preset.accent : 'transparent'}`,
                    cursor: 'pointer', transition: 'all 0.12s', '&:hover': { transform: 'scale(1.15)' }
                  }} />
                ))}
              </Stack>
            </Box>
          ))}
          <Divider />
          <Typography fontWeight={800} fontSize="0.9rem">Add New Person</Typography>
          <TextField label="Name" value={newPersonName} onChange={e => setNewPersonName(e.target.value)} fullWidth size="small" onKeyDown={e => e.key === 'Enter' && handleAddPerson()} />
          <Box>
            <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.8}>Pick a color:</Typography>
            <Stack direction="row" flexWrap="wrap" gap={0.8}>
              {COLOR_PRESETS.map((preset, i) => (
                <Box key={i} onClick={() => setNewPersonColor(preset)} sx={{
                  width: 26, height: 26, borderRadius: '6px', bgcolor: preset.bg,
                  border: `2.5px solid ${newPersonColor === preset ? preset.accent : 'transparent'}`,
                  cursor: 'pointer', transition: 'all 0.12s', '&:hover': { transform: 'scale(1.15)' }
                }} />
              ))}
            </Stack>
          </Box>
          <Button variant="contained" onClick={handleAddPerson} disabled={!newPersonName.trim()}
            sx={{ borderRadius: '8px', bgcolor: '#c2622d', '&:hover': { bgcolor: '#a85225' } }}>
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