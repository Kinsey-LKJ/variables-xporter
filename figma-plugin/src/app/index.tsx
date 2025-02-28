import ReactDOM from 'react-dom/client';
import App from './components/App';
import '@mantine/core/styles.css';
import '@mantine/code-highlight/styles.css';
import '@mantine/notifications/styles.css';
import { Button, Drawer, MantineProvider, Menu, MultiSelect, Select, Tabs, createTheme } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import './global.css';

const root = ReactDOM.createRoot(document.getElementById('react-page'));
const theme = createTheme({
  primaryColor: 'biloba-flower',
  autoContrast: true,
  white: '#edeeff',
  black: '#28194d',

  colors: {
    'biloba-flower': [
      '#edeeff',
      '#dfdfff',
      '#c5c5ff',
      '#aca9ff',
      '#8b7dfc',
      '#7b5ef6',
      '#6d41ea',
      '#5f33cf',
      '#4d2ca7',
      '#402b84',
      '#28194d',
    ],
    dark:[
      "#9FAAC1",
      "#7C879E",
      "#5C667B",
      "#4A5365",
      "#38404F",
      "#2E3543",
      "#252B38",
      "#1E232E",
      "#181e2c",
      "#101219"
    ]
  },
  primaryShade: 3,
  components:{
    Select: Select.extend({
      classNames:{
        input:'bg-background border-input placeholder:text-foreground-mute focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
        dropdown:"bg-background border-input",
        option:"hover:bg-accent"
      }
    }),
    MultiSelect: MultiSelect.extend({
      classNames:{
        input:'bg-background border-input focus-within:outline-none focus-within:ring-1 focus-within:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1',
        dropdown:"bg-background border-input",
        option:"hover:bg-accent",
        inputField:"placeholder:text-foreground-mute",
        pill:"bg-primary text-primary-foreground"
      }
    }),

    Menu: Menu.extend({
      classNames:{
        dropdown:"bg-background border-input",
        item:"hover:bg-accent"
      }
    }),

    Tabs: Tabs.extend({
      classNames:{
        list:"bg-background",
        tab:"hover:bg-accent",
        // list:"[--tab-border-color:rgb(var(--colors-background-muted))]"
      }
    }),

    Drawer: Drawer.extend({
      classNames:{
        content:"bg-background",
        header:"bg-background",
        close:"hover:bg-accent",
        title:"font-bold  text-xl",
      }
    })
  }
  
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
function generateColors(arg0: string): import("@mantine/core").MantineColorsTuple {
  throw new Error('Function not implemented.');
}

