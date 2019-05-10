import { createMuiTheme } from '@material-ui/core/styles';
import { red, indigo, cyan } from '@material-ui/core/colors';

// All the following keys are optional.
// We try our best to provide a great default value.
export const theme = createMuiTheme({
    palette: {
        primary: {
            main: indigo[600],
            light: indigo[300],
            dark: indigo[900],
            contrastText: 'white',
        },
        secondary: {
            main: cyan[700]
        },
        error: red,
    },
    typography: {
        useNextVariants: true,
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
                boxShadow: 'initial'
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