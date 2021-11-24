import { createTheme } from '@material-ui/core';
import { deepOrange } from '@material-ui/core/colors';

const primaryColor = '#333';
const secondaryColor = deepOrange[500];
const errorColor = '#ff0000';
const disabledColor = 'rgba(0, 0, 0, 0.38)';

export const theme = createTheme({
    palette: {
        primary: {
            main: primaryColor,
            contrastText: '#fff',
        },
        secondary: {
            main: deepOrange[500],
        },
        action: {
            active: 'rgba(0, 0, 0, 0.54)',
            hover: 'rgba(0, 0, 0, 0.08)',
            hoverOpacity: 0.08,
            selected: 'rgba(0, 0, 0, 0.14)',
            disabled: 'rgba(0, 0, 0, 0.26)',
            disabledBackground: 'rgba(0, 0, 0, 0.12)',
        },
        error: {
            main: errorColor,
        },
        text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.54)',
            disabled: disabledColor,
            hint: disabledColor,
        },
        background: {
            default: '#cacdd7',
        },
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
        'none',
    ],
    zIndex: {
        appBar: 2000,
        drawer: 3000,
        modal: 4000,
        snackbar: 5000,
        tooltip: 6000,
    },
    overrides: {
        MuiLink: {
            root: {
                cursor: 'pointer',
                textDecoration: 'none',
            },
        },
        MuiAppBar: {
            root: {
                boxShadow: 'initial',
                overflow: 'auto',
            },
        },
        MuiCard: {
            root: {
                marginBottom: '.5em',
            },
        },
        MuiAvatar: {
            root: {
                width: 90,
                height: 90,
            },
        },
        MuiDrawer: {
            paper: {
                width: '80vw',
                paddingLeft: '0.5em',
            },
        },
        MuiPaper: {
            rounded: {
                borderRadius: 0,
            },
        },
        MuiOutlinedInput: {
            root: {
                position: 'relative',
                '&:hover $notchedOutline': {
                    borderColor: secondaryColor,
                },
                // Reset on touch devices, it doesn't add specificity
                '@media (hover: none)': {
                    '&:hover $notchedOutline': {
                        borderColor: 'rgba(0, 0, 0, 0.23)',
                    },
                },
                '&$focused $notchedOutline': {
                    borderColor: secondaryColor,
                    borderWidth: 2,
                },
                '&$error $notchedOutline': {
                    borderColor: errorColor,
                },
                '&$disabled $notchedOutline': {
                    borderColor: disabledColor,
                },
            },
        },
        ...({
            MuiPickersCalendarHeader: {
                switchHeader: {
                    color: '#333',
                },
            },
            LottaArticlePreview: {
                title: {
                    fontFamily: "'Schoolbell', cursive",
                },
            },
        } as any),
    },
});

theme.typography.h4 = {
    ...theme.typography.h4,
    [theme.breakpoints.down('md')]: {
        fontSize: '1.6rem',
    },
};
theme.typography.h5 = {
    ...theme.typography.h5,
    [theme.breakpoints.down('md')]: {
        fontSize: '1.4rem',
    },
};

(theme.overrides as any).MuiContainer = {
    root: {
        [theme.breakpoints.down('md')]: {
            padding: theme.spacing(0),
        },
    },
};
