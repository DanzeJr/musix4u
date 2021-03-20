import { unstable_createMuiStrictModeTheme as createMuiTheme, responsiveFontSizes } from '@material-ui/core/styles';

const darkGray = '#222930';
const darkerGray = '#000000';

const baseTheme = responsiveFontSizes(createMuiTheme({
	props: {
		MuiPaper: {
			elevation: 0,
		},
		MuiAppBar: {
			elevation: 1,
		},
		MuiButton: {
			// elevation: 0,
		},
		MuiMenu: {
			elevation: 1,
		},
		MuiCard: {
			elevation: 0,
		},
	},
	
	overrides: {
		MuiButton: {
			root: {
				minWidth: 0,
			},
			contained: {
				boxShadow: 'none',
				'&:active': {
					boxShadow: 'none',
				},
				'&:focus': {
					boxShadow: 'none',
				},
			},
			containedSecondary: {
				color: '#fff',
				'&:hover': {
					backgroundColor: 'rgb(118, 195, 21)',
				},
			},
		},
		MuiButtonGroup: {
			root: {
				boxShadow: 'none',
			},
			contained: {
				boxShadow: 'none',
				'&:active': {
					boxShadow: 'none',
				},
				'&:focus': {
					boxShadow: 'none',
				},
			},
		},
		MuiListItemIcon: {
			root: {
				minWidth: 40,
			},
		},
		MuiCardContent: {
			root: {
				'&:last-child': {
					paddingBottom: 16,
				},
			},
		},
		MuiLinearProgress: {
			root: {
				background: '#f3f3f3 !important',
			},
		},
		'MuiInputLabel': {
			root: {
				'&$focused:not($error)': {
					color: '#ffffff'
				}
			}
		},
		MuiOutlinedInput: {
			root: {
				'&:hover:not($disabled):not($focused):not($error) $notchedOutline': {
					borderColor: '#ffffff',
					// Reset on touch devices, it doesn't add specificity
					'@media (hover: none)': {
						borderColor: 'rgba(0, 0, 0, 0.23)',
					},
				},
				'&$focused $notchedOutline': {
					borderColor: '#ffffff'
				},
			},
		},
	},
	palette: {
		type: 'dark',
		primary: {
			main: darkerGray,
			light: darkGray
		},
		secondary: {
			main: '#ffffff',
		}
	},
	typography: {
		fontFamily: 'Signika',
		h1: {
			fontSize: '2rem',
		},
		h2: {
			fontSize: '1.8rem',
		},
		h3: {
			fontSize: '1.6rem',
		},
		h4: {
			fontSize: '1.4rem',
		},
		h5: {
			fontSize: '1.2rem',
		},
		h6: {
			fontSize: '1rem',
		},
	},
}));

const adminTheme = {
	header: {
		background: '#fff',
	},
	sidebar: {
		width: 255,
		widthCollapsed: baseTheme.spacing(7),
		background: '#4a4d5a;',
		color: '#fff',
	},
};

const theme = { ...baseTheme, ...adminTheme };

export default theme;
