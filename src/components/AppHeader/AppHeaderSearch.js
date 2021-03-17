import React from 'react';
import { fade, makeStyles } from '@material-ui/core/styles';
import { IconButton, InputBase, OutlinedInput } from '@material-ui/core';
import { Search, CloseRounded } from '@material-ui/icons';
import { useSnackbar } from 'notistack';
import { useContext } from 'react';
import { StoreContext } from '../../App';
import { useForm } from 'react-hook-form';
import queryString from 'query-string';

const AppHeaderSearch = () => {
	const classes = useStyles();

	const { state, dispatch } = useContext(StoreContext);
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	const { register, handleSubmit } = useForm({
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const showMessage = (message, success, duration) => {
		if (!success && typeof message === 'object') {
			message = 'Error occurs';
		}
		enqueueSnackbar(message, {
			anchorOrigin: {
				vertical: 'top',
				horizontal: 'center',
			},
			variant: success ? 'success' : 'error',
			autoHideDuration: duration === undefined ? 3000 : duration,
			action: (key) => (
				<IconButton onClick={() => closeSnackbar(key)}>
					<CloseRounded />
				</IconButton>
			),
		});
	};

	const onSubmit = async (data) => {
		let headers = {
			Accept: 'application/json',
		};
		if (state.currentUser?.uid) {
			const token = await state.currentUser.getIdToken(true).catch((error) => {
				showMessage(error.message);
			});
			if (!isNaN(state.currentPlaylistId)) {
				data['playlistId'] = state.currentPlaylistId;
			} else if (state.currentPlaylistId == 'fav') {
				data['favorite'] = true;
			}
			headers['Authorization'] = `Bearer ${token}`;
		}
		fetch(
			`${process.env.REACT_APP_API_URL}api/tracks?${queryString.stringify(
				data
			)}`,
			{
				method: 'GET',
				headers,
			}
		)
			.then(async (res) => {
				if (res.status === 200) {
					const media = await res.json();
					dispatch({ type: 'GET', media });
					return;
				}
				const error = await res.json();
				showMessage(error);
			})
			.catch((error) => {
				showMessage(error.message);
			});
	};

	return (
		<div className={classes.search}>
			<form onSubmit={handleSubmit(onSubmit)} noValidate>
				<IconButton className={classes.searchIcon}>
					<Search />
				</IconButton>
				<OutlinedInput
					id='title'
					name='title'
					placeholder='Search track…'
					classes={{
						root: classes.inputRoot,
						input: classes.inputInput,
					}}
					inputProps={{ 'aria-label': 'search' }}
					inputRef={register}
				/>
			</form>
		</div>
	);
};

const useStyles = makeStyles((theme) => ({
	search: {
		position: 'relative',
		borderRadius: theme.shape.borderRadius,
		backgroundColor: fade(theme.palette.common.white, 0.15),
		'&:hover': {
			backgroundColor: fade(theme.palette.common.white, 0.25),
		},
		marginLeft: 0,
		marginRight: 20,
		width: '100%',
		[theme.breakpoints.up('sm')]: {
			marginLeft: theme.spacing(1),
			width: 'auto',
		},
	},
	searchIcon: {
		padding: theme.spacing(0, 2),
		zIndex: 1999,
		height: '100%',
		position: 'absolute',
		pointerEvents: 'none',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},
	inputRoot: {
		color: 'inherit',
	},
	inputInput: {
		padding: theme.spacing(1, 1, 1, 0),
		// vertical padding + font size from searchIcon
		paddingLeft: `calc(1em + ${theme.spacing(4)}px)`,
		transition: theme.transitions.create('width'),
		width: '100%',
		[theme.breakpoints.up('sm')]: {
			width: '20ch',
			'&:focus': {
				width: '40ch',
			},
		},
	},
}));

export default AppHeaderSearch;
