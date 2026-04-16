import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import AppShell from './components/AppShell'

const theme = createTheme({
  palette: {
    background: { default: '#f5f3ef' },
    primary: { main: '#5b5bd6' },
  },
  typography: {
    fontFamily: '"Raleway", sans-serif',
  },
  shape: { borderRadius: 12 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none', fontWeight: 700, borderRadius: 8 }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8 }
      }
    }
  }
})

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppShell />
  </ThemeProvider>
  )
}