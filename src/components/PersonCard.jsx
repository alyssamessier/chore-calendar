import { useState, useRef } from 'react'
import { Box, Typography, Avatar, LinearProgress, Chip, Stack, Checkbox, IconButton, TextField, Tooltip } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
import StarIcon from '@mui/icons-material/Star'
import CloseIcon from '@mui/icons-material/Close'
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents'
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto'

export default function PersonCard({ person, assignedChores = [], completedChores = new Set(), rawPoints = 0, completedCount = 0, totalCount = 0, onToggleChore, onUnassignChore, onNameChange, onPhotoUpload }) {
  const [editing, setEditing] = useState(false)
  const [nameVal, setNameVal] = useState(person.name)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef()

  const handleNameSave = () => {
    onNameChange(nameVal)
    setEditing(false)
  }

  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    await onPhotoUpload(person.id, file)
    setUploading(false)
  }

  const trophies = Math.floor(rawPoints / 100)
  const progressTo100 = rawPoints % 100

  return (
    <Box sx={{ flex: '1 1 300px', minWidth: 280, maxWidth: 400, bgcolor: 'white', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.07)', overflow: 'hidden', transition: 'transform 0.2s', '&:hover': { transform: 'translateY(-2px)' } }}>
      <Box sx={{ bgcolor: person.color, px: 3, pt: 3, pb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2} mb={1.5}>
          <Box sx={{ position: 'relative', cursor: 'pointer' }} onClick={() => fileRef.current.click()}>
            <Avatar src={person.photoURL || undefined} sx={{ bgcolor: person.avatar, width: 52, height: 52, fontSize: '1.4rem', fontWeight: 800 }}>
              {!person.photoURL && person.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ position: 'absolute', bottom: -4, right: -4, bgcolor: person.accent, borderRadius: '50%', width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }}>
  		<AddAPhotoIcon sx={{ fontSize: '0.85rem', color: 'white' }} />
	    </Box>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
          </Box>

          <Box flex={1}>
            {editing ? (
              <Stack direction="row" alignItems="center" spacing={1}>
                <TextField value={nameVal} onChange={e => setNameVal(e.target.value)} size="small" onKeyDown={e => e.key === 'Enter' && handleNameSave()} sx={{ bgcolor: 'white', borderRadius: 2 }} autoFocus />
                <IconButton size="small" onClick={handleNameSave} sx={{ bgcolor: 'white' }}><CheckIcon fontSize="small" /></IconButton>
              </Stack>
            ) : (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography variant="h6" fontWeight={800} color="#2d2d2d">{person.name}</Typography>
                <Tooltip title="Edit name">
                  <IconButton size="small" onClick={() => setEditing(true)} sx={{ opacity: 0.5, '&:hover': { opacity: 1 } }}><EditIcon fontSize="small" /></IconButton>
                </Tooltip>
              </Stack>
            )}
            {uploading && <Typography variant="caption" color="text.secondary">Uploading...</Typography>}
          </Box>
        </Stack>

        <Stack direction="row" spacing={1} mb={1.5} flexWrap="wrap" gap={0.5}>
          <Chip icon={<CheckIcon sx={{ fontSize: '0.9rem !important' }} />} label={completedCount + '/' + totalCount + ' today'} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.7)', fontWeight: 700 }} />
          <Chip icon={<StarIcon sx={{ fontSize: '0.9rem !important', color: '#f59e0b' }} />} label={progressTo100 + ' pts'} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.7)', fontWeight: 700 }} />
          {trophies > 0 && (
            <Chip icon={<EmojiEventsIcon sx={{ fontSize: '0.9rem !important', color: '#f59e0b' }} />} label={'x' + trophies} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.7)', fontWeight: 700 }} />
          )}
        </Stack>

        <Box>
          <Typography variant="caption" fontWeight={700} color="text.secondary" display="block" mb={0.5}>
            Progress: {progressTo100} / 100
          </Typography>
          <LinearProgress variant="determinate" value={progressTo100} sx={{ height: 8, borderRadius: 4, bgcolor: 'rgba(255,255,255,0.4)', '& .MuiLinearProgress-bar': { bgcolor: person.accent, borderRadius: 4 } }} />
        </Box>
      </Box>

      <Box sx={{ px: 2, py: 1.5 }}>
        {assignedChores.length === 0 ? (
          <Typography color="text.secondary" fontWeight={600} textAlign="center" py={2} fontSize="0.85rem">
            No chores assigned yet
          </Typography>
        ) : (
          assignedChores.map(chore => {
            const done = completedChores.has(chore.id)
            return (
              <Box key={chore.id} onClick={() => onToggleChore(chore.id)} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 1.5, py: 1, mb: 0.5, borderRadius: 3, cursor: 'pointer', bgcolor: done ? person.color + '99' : '#f8f8f8', border: '1.5px dashed', borderColor: person.accent + '66', '&:hover': { bgcolor: person.color + '66' } }}>
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Typography fontSize="1.3rem">{chore.emoji}</Typography>
                  <Typography fontWeight={600} fontSize="0.9rem" sx={{ textDecoration: done ? 'line-through' : 'none', color: done ? 'text.secondary' : 'text.primary' }}>{chore.label}</Typography>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.5}>
                  <Chip icon={<StarIcon sx={{ fontSize: '0.75rem !important', color: '#f59e0b' }} />} label={chore.points} size="small" sx={{ height: 22, fontSize: '0.7rem', fontWeight: 700, bgcolor: 'transparent' }} />
                  <Checkbox checked={done} size="small" sx={{ p: 0.5, color: person.accent, '&.Mui-checked': { color: person.accent } }} onClick={e => e.stopPropagation()} onChange={() => onToggleChore(chore.id)} />
                  <Tooltip title="Return to bucket">
                    <IconButton size="small" onClick={e => { e.stopPropagation(); onUnassignChore(chore.id) }} sx={{ p: 0.3, opacity: 0.4, '&:hover': { opacity: 1, color: 'error.main' } }}>
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Box>
            )
          })
        )}
      </Box>
    </Box>
  )
}