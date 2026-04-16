import { useState } from 'react'
import { Box, Typography, Fab, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Select, MenuItem, FormControl, InputLabel, Stack, Tooltip } from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import PersonCard from '../chores/PersonCard'
import HouseholdChores from '../chores/HouseholdChores'

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

export default function ChoresTab({ people, buckets, setBuckets, dayData, dayAssign, rawPoints, assignChore, toggleChore, unassignChore, updatePersonName, handlePhotoUpload, saveAll }) {

  const [addChoreOpen, setAddChoreOpen] = useState(false)
  const [addBucketOpen, setAddBucketOpen] = useState(false)
  const [newChore, setNewChore] = useState({ label: '', emoji: '🧹', points: 10, bucketId: '' })
  const [newBucketLabel, setNewBucketLabel] = useState('')

  const getPersonChores = (personId) => {
    return buckets.flatMap(b =>
      b.chores
        .filter(c => dayAssign[c.id] === personId)
        .map(c => ({ ...c, bucketLabel: b.label }))
    )
  }

  const getPersonCompleted = (personId) => {
    return buckets.flatMap(b => b.chores).filter(c => dayAssign[c.id] === personId && dayData.chores.has(c.id)).length
  }

  const getUnassignedChores = (bucketId) => {
    const bucket = buckets.find(b => b.id === bucketId)
    if (!bucket) return []
    return bucket.chores.filter(c => !dayAssign[c.id])
  }

  const handleAddChore = async () => {
    if (!newChore.label.trim() || !newChore.bucketId) return
    const id = 'chore_' + Date.now()
    const chore = { id, label: newChore.label, emoji: newChore.emoji, points: Number(newChore.points) }
    const newBuckets = buckets.map(b =>
      b.id === newChore.bucketId ? { ...b, chores: [...b.chores, chore] } : b
    )
    setBuckets(newBuckets)
    await saveAll({ buckets: newBuckets })
    setNewChore({ label: '', emoji: '🧹', points: 10, bucketId: newChore.bucketId })
    setAddChoreOpen(false)
  }

  const handleAddBucket = async () => {
    if (!newBucketLabel.trim()) return
    const id = 'bucket_' + Date.now()
    const newBuckets = [...buckets, { id, label: newBucketLabel.trim(), chores: [] }]
    setBuckets(newBuckets)
    await saveAll({ buckets: newBuckets })
    setNewBucketLabel('')
    setAddBucketOpen(false)
  }

  const handleDeleteChore = async (bucketId, choreId) => {
    const newBuckets = buckets.map(b =>
      b.id === bucketId ? { ...b, chores: b.chores.filter(c => c.id !== choreId) } : b
    )
    setBuckets(newBuckets)
    await saveAll({ buckets: newBuckets })
  }

  const handleDeleteBucket = async (bucketId) => {
    const newBuckets = buckets.filter(b => b.id !== bucketId)
    setBuckets(newBuckets)
    await saveAll({ buckets: newBuckets })
  }

  return (
    <>
      {/* Person cards */}
      <Box sx={{ display: 'flex', gap: 3, mb: 5, flexWrap: 'wrap' }}>
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

      {/* Buckets heading */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontFamily: '"Raleway", sans-serif', fontWeight: 800, fontSize: '1rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: '#666' }}>
            Buckets
          </Typography>
          <Typography style={{ fontSize: '10px' }} color="#ccc" fontWeight={400} letterSpacing="0.02em">Assign to someone's card</Typography>
        </Box>
        <Button size="small" onClick={() => setAddBucketOpen(true)}
          sx={{ fontSize: '0.72rem', fontWeight: 700, borderRadius: '8px', color: '#5b8fa8', border: '1.5px solid #5b8fa8', px: 1.5, '&:hover': { bgcolor: '#dde8f0' } }}>
          + New Bucket
        </Button>
      </Box>

      {/* Buckets side by side */}
      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'flex-start' }}>
        {buckets.map(bucket => (
          <Box key={bucket.id} sx={{ flex: '1 1 340px', minWidth: 300 }}>
            <HouseholdChores
              bucket={{ ...bucket, chores: getUnassignedChores(bucket.id) }}
              people={people}
              onAssign={assignChore}
              onDeleteChore={handleDeleteChore}
              onDeleteBucket={handleDeleteBucket}
            />
          </Box>
        ))}
      </Box>

      {/* FAB */}
      <Tooltip title="Add chore">
        <Fab size="medium"
          sx={{ position: 'fixed', bottom: 28, right: 28, bgcolor: '#c2622d', color: 'white', borderRadius: '14px', boxShadow: '0 4px 16px rgba(194,98,45,0.4)', '&:hover': { bgcolor: '#a85225' } }}
          onClick={() => setAddChoreOpen(true)}>
          <AddIcon />
        </Fab>
      </Tooltip>

      {/* Add Chore Dialog */}
      <Dialog open={addChoreOpen} onClose={() => setAddChoreOpen(false)} PaperProps={{ sx: { borderRadius: '16px', p: 1, minWidth: 320 } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1rem' }}>Add New Chore</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Chore name" value={newChore.label} onChange={e => setNewChore(p => ({ ...p, label: e.target.value }))} fullWidth size="small" />
          <FormControl fullWidth size="small">
            <InputLabel>Emoji</InputLabel>
            <Select value={newChore.emoji} label="Emoji" onChange={e => setNewChore(p => ({ ...p, emoji: e.target.value }))}>
              {EMOJI_OPTIONS.map(({ label, emoji }) => (
                <MenuItem key={emoji} value={emoji}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography fontSize="1.1rem">{emoji}</Typography>
                    <Typography fontSize="0.85rem">{label}</Typography>
                  </Stack>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField label="Points" type="number" value={newChore.points} onChange={e => setNewChore(p => ({ ...p, points: e.target.value }))} fullWidth size="small" />
          <FormControl fullWidth size="small">
            <InputLabel>Bucket</InputLabel>
            <Select value={newChore.bucketId} label="Bucket" onChange={e => setNewChore(p => ({ ...p, bucketId: e.target.value }))}>
              {buckets.map(b => (
                <MenuItem key={b.id} value={b.id}>{b.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddChoreOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddChore} disabled={!newChore.label.trim() || !newChore.bucketId}
            sx={{ bgcolor: '#c2622d', '&:hover': { bgcolor: '#a85225' }, borderRadius: '8px' }}>Add</Button>
        </DialogActions>
      </Dialog>

      {/* Add Bucket Dialog */}
      <Dialog open={addBucketOpen} onClose={() => setAddBucketOpen(false)} PaperProps={{ sx: { borderRadius: '16px', p: 1, minWidth: 320 } }}>
        <DialogTitle sx={{ fontWeight: 800, fontSize: '1rem' }}>New Bucket</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          <TextField label="Bucket name" value={newBucketLabel} onChange={e => setNewBucketLabel(e.target.value)} fullWidth size="small" onKeyDown={e => e.key === 'Enter' && handleAddBucket()} autoFocus />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddBucketOpen(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddBucket} disabled={!newBucketLabel.trim()}
            sx={{ bgcolor: '#c2622d', '&:hover': { bgcolor: '#a85225' }, borderRadius: '8px' }}>Create</Button>
        </DialogActions>
      </Dialog>
    </>
  )
}