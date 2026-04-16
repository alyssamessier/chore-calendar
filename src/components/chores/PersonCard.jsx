import { useState, useRef } from 'react'
import { Box, Typography, Avatar, LinearProgress, Chip, Stack, Checkbox, IconButton, TextField, Tooltip } from '@mui/material'
import EditIcon from '@mui/icons-material/Edit'
import CheckIcon from '@mui/icons-material/Check'
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
    <Box sx={{
      flex: '1 1 300px', minWidth: 280, maxWidth: 420,
      bgcolor: 'white', borderRadius: '16px',
      boxShadow: '0 2px 12px rgba(0,0,0,0.06)',
      border: '1px solid #e8e4de', overflow: 'hidden',
      transition: 'transform 0.15s, box-shadow 0.15s',
      '&:hover': { transform: 'translateY(-2px)', boxShadow: '0 6px 20px rgba(0,0,0,0.1)' }
    }}>
      {/* Colored header */}
      <Box sx={{ bgcolor: person.color, px: 3, pt: 3, pb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={2} style={{ marginBottom: '14px' }}>
          <Box sx={{ position: 'relative', cursor: 'pointer', flexShrink: 0 }} onClick={() => fileRef.current.click()}>
            <Avatar src={person.photoURL || undefined}
              sx={{ bgcolor: person.accent, width: 48, height: 48, fontSize: '1.2rem', fontWeight: 800, borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
              {!person.photoURL && person.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ position: 'absolute', top: -2, right: -2, bgcolor: person.accent, borderRadius: '6px', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
              <AddAPhotoIcon sx={{ fontSize: '0.6rem', color: 'white' }} />
            </Box>
            <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileChange} />
          </Box>

          <Box flex={1} minWidth={0}>
            {editing ? (
              <Stack direction="row" alignItems="center" spacing={1}>
                <TextField value={nameVal} onChange={e => setNameVal(e.target.value)} size="small"
                  onKeyDown={e => e.key === 'Enter' && handleNameSave()} autoFocus
                  sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px', bgcolor: 'white', fontSize: '0.95rem' } }} />
                <IconButton size="small" onClick={handleNameSave} sx={{ bgcolor: 'white', borderRadius: '8px' }}>
                  <CheckIcon fontSize="small" />
                </IconButton>
              </Stack>
            ) : (
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Typography fontWeight={800} fontSize="1.1rem" color="#1a1a1a" noWrap>{person.name}</Typography>
                <IconButton size="small" onClick={() => setEditing(true)} sx={{ opacity: 0.4, '&:hover': { opacity: 0.9 } }}>
                  <EditIcon sx={{ fontSize: '0.85rem' }} />
                </IconButton>
              </Stack>
            )}
            {uploading && <Typography variant="caption" color="text.secondary">Uploading...</Typography>}
          </Box>
        </Stack>

        <Box style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: '14px' }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Chip label={`${completedCount}/${totalCount} done`} size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: '0.72rem', height: 24 }} />
            <Chip label={`${progressTo100} pts`} size="small"
              sx={{ bgcolor: 'rgba(255,255,255,0.7)', fontWeight: 700, fontSize: '0.72rem', height: 24 }} />
          </Stack>
          {trophies > 0 && (
            <Chip icon={<EmojiEventsIcon sx={{ fontSize: '0.85rem !important', color: '#b8860b !important' }} />}
              label={'×' + trophies} size="small"
              sx={{ height: 24, fontSize: '0.75rem', fontWeight: 800, bgcolor: 'rgba(255,255,255,0.8)', color: '#b8860b', border: 'none' }}
            />
          )}
        </Box>

        <LinearProgress variant="determinate" value={progressTo100}
          sx={{ height: 6, borderRadius: 3, bgcolor: 'rgba(255,255,255,0.4)', '& .MuiLinearProgress-bar': { bgcolor: person.accent, borderRadius: 3 } }}
        />
        <Typography fontSize="0.68rem" color="text.secondary" fontWeight={600} mt={0.5}>{progressTo100} / 100</Typography>
      </Box>

      {/* Chore list */}
      <Box sx={{ px: 2.5, py: 2.5 }}>
        {assignedChores.length === 0 ? (
          <Typography color="text.secondary" fontSize="0.82rem" textAlign="center" py={2}>No chores assigned yet</Typography>
        ) : (
          assignedChores.map(chore => {
            const done = completedChores.has(chore.id)
            return (
              <Box key={chore.id} onClick={() => onToggleChore(chore.id)} sx={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                px: 1.5, py: 1.2, mb: 0.8, borderRadius: '10px', cursor: 'pointer',
                bgcolor: done ? person.color + 'aa' : 'white',
                border: '1.5px solid',
                borderColor: done ? person.accent + 'cc' : person.accent + '77',
                transition: 'all 0.12s',
                '&:hover': { bgcolor: person.color + '66' }
              }}>
                <Stack direction="row" alignItems="center" spacing={1.5} minWidth={0}>
                  <Typography fontSize="1.1rem" flexShrink={0}>{chore.emoji}</Typography>
                  <Box minWidth={0}>
                    <Typography fontWeight={600} fontSize="0.88rem" noWrap
                      sx={{ textDecoration: done ? 'line-through' : 'none', color: done ? 'text.secondary' : '#1a1a1a' }}>
                      {chore.label}
                    </Typography>
                    {chore.bucketLabel && (
                      <Typography sx={{
                        fontSize: '0.6rem', fontWeight: 700,
                        color: person.accent,
                        opacity: 0.7,
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                      }}>
                        {chore.bucketLabel}
                      </Typography>
                    )}
                  </Box>
                </Stack>
                <Stack direction="row" alignItems="center" spacing={0.5} flexShrink={0}>
                  <Typography style={{ fontSize: '10px' }} sx={{ color: '#999', letterSpacing: '0.02em' }}>★ {chore.points}</Typography>
                  <Checkbox checked={done} size="small"
                    sx={{ p: 0.3, color: '#ccc', '&.Mui-checked': { color: person.accent } }}
                    onClick={e => e.stopPropagation()} onChange={() => onToggleChore(chore.id)} />
                  <Tooltip title="Return to bucket">
                    <IconButton size="small" onClick={e => { e.stopPropagation(); onUnassignChore(chore.id) }}
                      sx={{ p: 0.2, opacity: 0.25, '&:hover': { opacity: 1, color: 'error.main' } }}>
                      <CloseIcon sx={{ fontSize: '0.78rem' }} />
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