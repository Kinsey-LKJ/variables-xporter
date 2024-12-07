import ReactDOM from 'react-dom/client';
import App from './components/App';
import '@mantine/core/styles.css';
import '@mantine/code-highlight/styles.css';
import '@mantine/notifications/styles.css';
import { Button, MantineProvider, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import './global.css';

const root = ReactDOM.createRoot(document.getElementById('react-page'));
const theme = createTheme({
  white: '#dcd8bf',
  black: '#1a1a1a',
  primaryColor: 'gold',
  autoContrast:true,
  
  colors: {
    gold: [
      "#ffffe6",
      "#ffffd0",
      "#ffff9f",
      "#ffff69",
      "#ffff40",
      "#ffff29",
      "#ffff1d",
      "#e3e310",
      "#c9c900",
      "#adad00"
    ],
  },
  primaryShade:1,
  // components: {
  //   Button: Button.extend({
  //     defaultProps: {
  //       color: '#dcd8bf',
  //     },
  //   }),
  // },
});

root.render(
  <MantineProvider defaultColorScheme="dark" theme={theme}>
    <Notifications position="top-center" limit={2} />
    <App />
  </MantineProvider>
);
