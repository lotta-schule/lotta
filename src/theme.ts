import { createMuiTheme } from '@material-ui/core/styles';
import { blue, red } from '@material-ui/core/colors';

// All the following keys are optional.
// We try our best to provide a great default value.
export const theme = createMuiTheme({
    palette: {
        primary: red,
        secondary: blue,
        error: red,
    },
    typography: {
        useNextVariants: true,
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