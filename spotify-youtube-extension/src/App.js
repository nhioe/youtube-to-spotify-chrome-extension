import React from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme/theme';
import AppContent from './components/AppContent';
import { AppContainer } from './components/StyledComponents';

function App() {
  return (<ThemeProvider theme={theme}>
      <CssBaseline />
        <AppContainer>
          <AppContent />
        </AppContainer>
    </ThemeProvider>
  );
}

export default App;