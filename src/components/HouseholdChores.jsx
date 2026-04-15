import { Box, Typography, Stack, Chip, Avatar, Button, IconButton, Tooltip } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import StarIcon from '@mui/icons-material/Star'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import DeleteIcon from '@mui/icons-material/Delete'

export default function HouseholdChores({ chores, people, onAssign, onDelete }) {
  return (
    <Box sx={{ bgcolor: 'white', borderRadius: 4, boxShadow: '0 4px 20px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
      <Box sx={{ bgcolor: '#dde8f0', px: 3, pt: 3, pb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar sx={{ bgcolor: '#5b8fa8', width: 44, height: 44 }}><HomeIcon /></Avatar>
          <Box>
            <Typography variant="h6" fontWeight={800} color="#2d2d2d">Household Bucket</Typography>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>Assign chores to someone's card</Typography>
          </Box>
          <Box flex={1} />
          <Chip label={chores.length + ' available'} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.7)', fontWeight: 700 }} />
        </Stack>
      </Box>

      <Box sx={{ px: 2, py: 1.5 }}>
        {chores.length === 0 ? (
          <Typography color="text.secondary" fontWeight={600} textAlign="center" py={3}>
            🎉 All chores assigned for today!
          </Typography>
        ) : (
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
            {chores.map(chore => (
              <Box key={chore.id} sx={{
                width: { xs: '100%', sm: 'calc(50% - 6px)', md: 'calc(33% - 8px)', lg: 'calc(25% - 9px)' },
                minWidth: 180,
                bgcolor: '#f8f8f8', borderRadius: 3, p: 2,
                border: '1.5px solid #e8e8e8', position: 'relative'
              }}>
                <Tooltip title="Delete chore permanently">
                  <IconButton size="small" onClick={() => onDelete(chore.id)} sx={{ position: 'absolute', top: 6, right: 6, opacity: 0.25, '&:hover': { opacity: 1, color: 'error.main' } }}>
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>

                <Stack direction="row" alignItems="center" spacing={1} mb={1.5} pr={3}>
                  <Typography fontSize="1.4rem">{chore.emoji}</Typography>
                  <Box flex={1}>
                    <Typography fontWeight={700} fontSize="0.9rem">{chore.label}</Typography>
                    <Chip icon={<StarIcon sx={{ fontSize: '0.75rem !important', color: '#f59e0b' }} />} label={chore.points + ' pts'} size="small" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, bgcolor: 'transparent', mt: 0.3 }} />
                  </Box>
                </Stack>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {people.map(person => (
                    <Button
                      key={person.id}
                      size="small"
                      variant="outlined"
                      endIcon={<ArrowForwardIcon sx={{ fontSize: '0.7rem !important' }} />}
                      onClick={() => onAssign(chore.id, person.id)}
                      sx={{
                        fontSize: '0.68rem', fontWeight: 700, borderRadius: 2,
                        px: 1, py: 0.3, minWidth: 0,
                        borderColor: person.accent, color: person.accent,
                        '&:hover': { bgcolor: person.color, borderColor: person.accent }
                      }}
                    >
                      {person.name.length > 6 ? person.name.slice(0, 6) + '…' : person.name}
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