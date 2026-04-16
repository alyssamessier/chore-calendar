import { Box, Typography } from '@mui/material'
import RestaurantIcon from '@mui/icons-material/Restaurant'

export default function MealsTab() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 2 }}>
      <RestaurantIcon sx={{ fontSize: '3.5rem', color: '#ddd' }} />
      <Typography fontWeight={800} fontSize="1.1rem" color="#ccc" letterSpacing="0.1em" textTransform="uppercase">Meals</Typography>
      <Typography fontSize="0.8rem" color="#ddd">Coming soon</Typography>
    </Box>
  )
}