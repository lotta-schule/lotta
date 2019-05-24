import { createMuiTheme } from '@material-ui/core/styles';
import { red, indigo, blue, deepOrange } from '@material-ui/core/colors';

export const theme = createMuiTheme({
    palette: {
        primary: {
            main: blue[800],
            light: blue[300],
            dark: blue[900],
            contrastText: 'white',

        },
        secondary: {
            main: deepOrange[500]
        },
        error: red,
    },
    typography: {
        fontFamily: 'Muli',
    },
    shadows: [
        'none',
        'none',
        'none',
        'none',
        'none',
        'none',
        'none',
        'none',
        'none',
        'none',
        'none',
        'none',
        'none',
        'none',
        'none',
        'none',
        'none',
        'none',
        'none',
        'none',
        'none',
        'none',
        'none',
        'none',
        'none'
    ],
    overrides: {
        MuiLink: {
            root: {
                cursor: 'pointer'
            }
        },
        MuiAppBar: {
            root: {
                boxShadow: 'initial',
                overflow: 'auto'
            }
        },
        MuiCard: {
            root: {
                marginBottom: '.5em'
            }
        },
        MuiAvatar: {
            root: {
                width: 90,
                height: 90,
            }
        }
    }
});