import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import ChoreApp from './components/ChoreApp'

const theme = createTheme({
  palette: {
    background: { default: '#f0ece8' },
    primary: { main: '#e07a5f' },
  },
  typography: {
    fontFamily: '"Nunito", "Quicksand", sans-serif',
  },
  shape: { borderRadius: 16 },
})

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ChoreApp />
    </ThemeProvider>
  )
}