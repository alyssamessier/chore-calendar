import { Box, Typography } from '@mui/material'
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore'

export default function GroceryTab() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 2 }}>
      <LocalGroceryStoreIcon sx={{ fontSize: '3.5rem', color: '#ddd' }} />
      <Typography fontWeight={800} fontSize="1.1rem" color="#ccc" letterSpacing="0.1em" textTransform="uppercase">Grocery</Typography>
      <Typography fontSize="0.8rem" color="#ddd">Coming soon</Typography>
    </Box>
  )
}