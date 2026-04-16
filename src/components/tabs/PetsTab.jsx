import { Box, Typography } from '@mui/material'
import PetsIcon from '@mui/icons-material/Pets'

export default function PetsTab() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 2 }}>
      <PetsIcon sx={{ fontSize: '3.5rem', color: '#ddd' }} />
      <Typography fontWeight={800} fontSize="1.1rem" color="#ccc" letterSpacing="0.1em" textTransform="uppercase">Pets</Typography>
      <Typography fontSize="0.8rem" color="#ddd">Coming soon</Typography>
    </Box>
  )
}