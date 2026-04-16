import { Box, Typography, Stack, Chip, Button, IconButton, Tooltip, Avatar } from '@mui/material'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'

export default function HouseholdChores({ bucket, people, onAssign, onDeleteChore, onDeleteBucket }) {
  const chores = bucket.chores || []

  return (
    <Box sx={{ bgcolor: 'white', borderRadius: '16px', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid #e8e4de', overflow: 'hidden', mb: 3 }}>
      <Box sx={{ px: 3, py: 2.5, borderBottom: '1px solid #c8dce8', display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#dde8f0' }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar sx={{ bgcolor: '#5b8fa8', width: 44, height: 44, borderRadius: '12px', fontSize: '1.1rem' }}>
            🪣
          </Avatar>
          <Box>
            <Typography fontWeight={800} fontSize="1.1rem" color="#2d2d2d">{bucket.label}</Typography>
          </Box>
        </Stack>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Chip label={`${chores.length} available`} size="small"
            sx={{ fontWeight: 700, fontSize: '0.72rem', bgcolor: 'rgba(255,255,255,0.7)', borderRadius: '8px' }} />
          <Tooltip title="Delete bucket">
            <IconButton size="small" onClick={() => onDeleteBucket(bucket.id)}
              sx={{ opacity: 0.3, '&:hover': { opacity: 1, color: 'error.main' } }}>
              <DeleteIcon sx={{ fontSize: '1rem' }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>
      <Box sx={{ px: 2.5, py: 2 }}>
        {chores.length === 0 ? (
          <Typography color="text.secondary" fontSize="0.82rem" textAlign="center" py={3}>
            🎉 All chores assigned for today!
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {chores.map(chore => (
              <Box key={chore.id} sx={{
                width: { xs: '100%', sm: 'calc(50% - 6px)', lg: 'calc(25% - 9px)' },
                minWidth: 160, bgcolor: '#f9f8f6', borderRadius: '12px',
                border: '1px solid #ede9e3', p: 2, pb: 2.5, position: 'relative', boxSizing: 'border-box', overflow: 'hidden',
              }}>
                <Tooltip title="Delete chore">
                  <IconButton size="small" onClick={() => onDeleteChore(bucket.id, chore.id)}
                    sx={{ position: 'absolute', top: 6, right: 6, opacity: 0.2, '&:hover': { opacity: 1, color: 'error.main' } }}>
                    <DeleteIcon sx={{ fontSize: '1rem' }} />
                  </IconButton>
                </Tooltip>
                <Stack direction="row" alignItems="center" spacing={1} mb={1.5} pr={2}>
                  <Typography fontSize="1.3rem">{chore.emoji}</Typography>
                  <Box>
                    <Typography fontWeight={700} fontSize="0.88rem" color="#1a1a1a">{chore.label}</Typography>
                    <Typography fontWeight={600} sx={{ color: '#aaa', fontSize: '0.72rem' }}>★ {chore.points}</Typography>
                  </Box>
                </Stack>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 1 }}>
                  {people.map(person => (
                    <Button key={person.id} size="small" onClick={() => onAssign(chore.id, person.id, bucket.id)}
                      endIcon={<ArrowForwardIcon sx={{ fontSize: '0.65rem !important', flexShrink: 0 }} />}
                      sx={{
                        fontSize: '0.7rem', fontWeight: 700, borderRadius: '20px',
                        px: 1.2, py: 0.5, height: 26, maxWidth: '100%', minWidth: 0,
                        border: `1.5px solid ${person.accent}`, color: person.accent, bgcolor: 'transparent',
                        '& .MuiButton-endIcon': { ml: 0.5, flexShrink: 0 },
                        overflow: 'hidden',
                        '&:hover': { bgcolor: person.color }
                      }}>
                      <Box component="span" sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 80, display: 'block' }}>
                        {person.name}
                      </Box>
                    </Button>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}