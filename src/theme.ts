import { createMuiTheme } from '@material-ui/core/styles';
import { deepOrange } from '@material-ui/core/colors';

const palette = {
    primary: {
        main: '#d1d0d0',
        light: '#999',
        dark: '#3b3b3b',
        contrastText: '#ffffff',

    },
    secondary: {
        main: deepOrange[500],
        light: '#fff2ed',
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
        light: '#e57373',
        main: '#ff0000',
        dark: '#d32f2f',
        contrastText: '#fff',
    },
    text: {
        primary: 'rgba(0, 0, 0, 0.87)',
        secondary: 'rgba(0, 0, 0, 0.54)',
        disabled: 'rgba(0, 0, 0, 0.38)',
        hint: 'rgba(0, 0, 0, 0.38)',
    }
};

export const theme = createMuiTheme({
    palette,
    typography: {
        fontFamily: 'Muli'
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
                cursor: 'pointer',
                color: palette.primary.dark,
                textDecoration: 'none',
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
        },
        MuiDrawer: {
            paper: {
                width: '80vw',
                paddingLeft: '0.5em',
            }
        },
        MuiPaper: {
            rounded: {
                borderRadius: 0,
            }
        },
        MuiOutlinedInput: {
            root: {
                position: 'relative',
                '&:hover $notchedOutline': {
                    borderColor: palette.secondary.main,
                },
                // Reset on touch devices, it doesn't add specificity
                '@media (hover: none)': {
                    '&:hover $notchedOutline': {
                        borderColor: 'rgba(0, 0, 0, 0.23)',
                    },
                },
                '&$focused $notchedOutline': {
                    borderColor: palette.secondary.main,
                    borderWidth: 2,
                },
                '&$error $notchedOutline': {
                    borderColor: palette.error.main,
                },
                '&$disabled $notchedOutline': {
                    borderColor: palette.action.disabled,
                },
            },
        },
        ...{
            MuiPickersCalendarHeader: {
                switchHeader: {
                    color: '#333'
                },
            },
            LottaArticlePreview: {
                title: {
                    fontFamily: '\'Schoolbell\', cursive'
                }
            }
        } as any
    },
});

theme.typography.h4 = {
    ...theme.typography.h4,
    [theme.breakpoints.down('md')]: {
        fontSize: '1.6rem'
    }
};
theme.typography.h5 = {
    ...theme.typography.h5,
    [theme.breakpoints.down('md')]: {
        fontSize: '1.4rem'
    }
};

(theme.overrides as any).MuiContainer = {
    root: {
        [theme.breakpoints.down('md')]: {
            padding: theme.spacing(0),
        }
    }
}