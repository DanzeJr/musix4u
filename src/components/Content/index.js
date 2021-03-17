import React, { useContext, useState } from 'react';
import * as yup from 'yup';
import queryString from 'query-string';
import { StoreContext } from '../../App';
import { millisToFormattedTime } from '../../utils/time.util';
import { useLoading, Audio, Bars } from '@agney/react-loading';
import {
	withStyles,
	TableCell,
	TableRow,
	TableContainer,
	Paper,
	Table,
	TableHead,
	TableBody,
	IconButton,
	Menu,
	MenuItem,
	Checkbox,
	FormControlLabel,
	DialogActions,
	Dialog,
	DialogContent,
	ListItemIcon,
	ListItemText,
} from '@material-ui/core';
import {
	makeStyles,
	Hidden,
	Button,
	CircularProgress,
	TextField,
} from '@material-ui/core';
import {
	Add,
	FavoriteBorder,
	Pause,
	PlayArrow,
	CloseRounded,
	SatelliteSharp,
	FavoriteRounded,
	MoreVertRounded,
	MoreHorizRounded,
	EditRounded,
	CancelRounded,
	DeleteRounded,
	DeleteForeverRounded,
	Delete,
} from '@material-ui/icons';
import { useParams } from 'react-router';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';
import { green } from '@material-ui/core/colors';
import { yupResolver } from '@hookform/resolvers/yup';

const StyledTableCell = withStyles((theme) => ({
	head: {
		backgroundColor: theme.palette.common.black,
		color: theme.palette.common.white,
	},
	body: {
		fontSize: 14,
	},
}))(TableCell);

const StyledTableRow = withStyles((theme) => ({
	root: {
		cursor: 'pointer',
		backgroundColor: theme.palette.primary.dark,
		'&:hover': {
			backgroundColor: theme.palette.primary.light,
		},
	},
}))(TableRow);

const useStyles = makeStyles((theme) => ({
	root: {
		width: '100%',
		height: '88%',
		backgroundColor: theme.palette.primary.dark,
	},
	tableContainer: {
		borderRadius: 0,
	},
	table: {
		minWidth: 700,
	},
}));

const useChildStyle = makeStyles((theme) => ({
	button: {
		marginRight: 10,
		color: theme.palette.secondary.main,
	},
	headerUpload: {
		marginRight: 23,
		// position: 'relative',
		// position: 'absolute'
	},
	titleContainer: {
		display: 'flex',
		'justify-content': 'space-between',
		width: '100%',
	},
	cancel: {
		color: theme.palette.error.light,
		width: 65,
	},
	buttonProgress: {
		color: green[500],
		marginRight: 10,
	},
}));

const Content = () => {
	const classes = useStyles();
	const history = useHistory();
	const { id } = useParams();
	const { state, dispatch } = useContext(StoreContext);
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const [playVisibleId, setPlayVisibleId] = useState(false);
	const { containerProps, indicatorEl } = useLoading({
		loading: true,
		loaderProps: {
			style: {
				position: 'absolute',
				top: '50%',
				left: '50%',
				transform: 'translate(-50%, -50%)',
			},
		},
		indicator: <Bars width='50' />,
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

	const getTracks = async (filter) => {
		dispatch({ type: 'FETCH' });
		let headers = {
			Accept: 'application/json',
		};
		if (state.currentUser?.uid) {
			const token = await state.currentUser.getIdToken(true).catch((error) => {
				showMessage(error.message);
			});
			headers['Authorization'] = `Bearer ${token}`;
		}
		console.log('start fetch');
		fetch(
			`${process.env.REACT_APP_API_URL}api/tracks?${queryString.stringify(
				filter
			)}`,
			{
				method: 'GET',
				headers,
			}
		)
			.then(async (res) => {
				if (res.status === 200) {
					let data = await res.json();
					dispatch({ type: 'GET', media: data });
					return;
				}
				const error = await res.json();
				showMessage(error);
			})
			.catch((error) => {
				showMessage(error.message);
			});
	};

	useEffect(() => {
		let filter = {};
		if (!!id) {
			if (id === 'fav') {
				filter = { favorite: true };
				dispatch({ type: 'SET_CURRENT_PLAYLIST', id: 'fav' });
			} else if (
				state.playlists.some((x) => x.id == id) ||
				state.sharedPlaylists.some((x) => x.id == id)
			) {
				filter = { playlistId: id };
				dispatch({ type: 'SET_CURRENT_PLAYLIST', id });
			} else {
				history.push('/');
				dispatch({ type: 'SET_CURRENT_PLAYLIST', id: 'home' });
				return;
			}
		}
		getTracks(filter);
	}, [history.location, state.currentUser]);

	const playOrPause = (song) => {
		if (state.currentSong.id === song.id && state.playing) {
			dispatch({ type: 'PAUSE' });
		} else {
			dispatch({ type: 'PLAY', song });
		}
	};

	const loader = <section {...containerProps}>{indicatorEl}</section>;

	return (
		<div className={classes.root}>
			{state.fetching ? (
				loader
			) : state.currentPlaylist.length <= 0 ? (
				<p style={{ position: 'fixed', top: '50%', left: '50%' }}>
					No track is found!
				</p>
			) : (
				<TableContainer component={Paper} className={classes.tableContainer}>
					<Table className={classes.table} aria-label='Playlist'>
						<TableHead>
							<TableRow>
								<StyledTableCell align='left'>
									{!isNaN(state.currentPlaylistId) &&
									state.playlists.some(
										(x) => x.id == state.currentPlaylistId
									) ? (
										<PlaylistOption />
									) : (
										<h4>Total: {state.currentPlaylist.length}</h4>
									)}
								</StyledTableCell>
								<StyledTableCell align='left'>Title</StyledTableCell>
								<StyledTableCell align='left'>Artists</StyledTableCell>
								<Hidden smDown implementation='js'>
									<StyledTableCell align='left'>Album</StyledTableCell>
								</Hidden>
								<StyledTableCell align='left'>Length</StyledTableCell>
								<StyledTableCell align='left'></StyledTableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{state.currentPlaylist.map((song) => {
								return (
									<StyledTableRow
										key={song.id}
										onMouseEnter={() => setPlayVisibleId(song.id)}
										onMouseLeave={() => setPlayVisibleId('')}
										onClick={() => playOrPause(song)}>
										<StyledTableCell component='th' scope='row'>
											<PlayPause
												playing={state.playing}
												song={song}
												isCurrentSong={state.currentSong.id === song.id}
												visible={playVisibleId === song.id}
											/>
											{!!state.currentUser?.uid && (
												<>
													<AddToPlaylist song={song} />
													<Favorite song={song} />
												</>
											)}
										</StyledTableCell>
										<StyledTableCell align='left'>{song.title}</StyledTableCell>
										<StyledTableCell align='left'>
											{song.performers}
										</StyledTableCell>
										<Hidden smDown implementation='js'>
											<StyledTableCell align='left'>
												{song.album}
											</StyledTableCell>
										</Hidden>
										<StyledTableCell align='left'>
											{millisToFormattedTime(song.duration)}
										</StyledTableCell>
										<StyledTableCell>
											{(!isNaN(state.currentPlaylistId) ||
												state.currentPlaylistId == 'fav' ||
												state.claims.userId == song.uploaderId) && (
												<TrackOption song={song} />
											)}
										</StyledTableCell>
									</StyledTableRow>
								);
							})}
						</TableBody>
					</Table>
				</TableContainer>
			)}
		</div>
	);
};

const AddToPlaylist = ({ song }) => {
	const classes = useChildStyle();
	const { state, dispatch } = useContext(StoreContext);
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const [anchorEl, setAnchorEl] = React.useState(null);

	const handleClick = (event) => {
		event.stopPropagation();
		if (state.playlists.length === 0) {
			return;
		}
		setAnchorEl(event.currentTarget);
	};

	const handleClose = (e, playlist) => {
		e.stopPropagation();
		if (!!playlist?.name) {
			addToPlaylist(playlist);
		}
		setAnchorEl(null);
	};

	const showMessage = (message, success, duration) => {
		setIsSubmitting(false);
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

	const addToPlaylist = async (playlist) => {
		const token = await state.currentUser.getIdToken(true).catch((error) => {
			showMessage(error.message);
		});
		fetch(
			`${process.env.REACT_APP_API_URL}api/playlists/${playlist.id}/tracks`,
			{
				method: 'POST',
				headers: {
					Accept: 'application/json',
					'Content-Type': 'application/json;charset=UTF-8',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ trackId: song.id }),
			}
		)
			.then(async (res) => {
				if (res.status === 201) {
					setIsSubmitting(false);
					showMessage(`New track added to ${playlist.name}!`, true);
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
		<>
			<IconButton
				aria-controls='simple-menu'
				aria-haspopup='true'
				className={classes.button}
				size='small'
				onClick={handleClick}
				disabled={isSubmitting}>
				<Add />
			</IconButton>
			<Menu
				id='simple-menu'
				anchorEl={anchorEl}
				keepMounted
				open={Boolean(anchorEl)}
				onClose={handleClose}>
				{state.playlists.map((playlist) => {
					return (
						playlist.id != state.currentPlaylistId && (
							<MenuItem
								key={playlist.id}
								onClick={(e) => handleClose(e, playlist)}>
								{playlist.name}
							</MenuItem>
						)
					);
				})}
			</Menu>
		</>
	);
};

const PlaylistOption = () => {
	const history = useHistory();
	const classes = useChildStyle();
	const { state, dispatch } = useContext(StoreContext);
	const [open, setOpen] = React.useState(false);
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const [anchorEl, setAnchorEl] = React.useState(null);

	let playlist = state.playlists.find((x) => x.id == state.currentPlaylistId);
	const schema = yup.object().shape({
		name: yup
			.mixed()
			.required('Please enter playlist name')
			.test(
				'maxLength',
				'Must be less than or equal to 50 characters',
				(value) => {
					return value && value.toString().length <= 50;
				}
			),
	});

	const { register, handleSubmit, errors, reset, control } = useForm({
		mode: 'onChange',
		reValidateMode: 'onChange',
		resolver: yupResolver(schema),
		defaultValues: {
			name: playlist.name,
			isPublic: playlist.isPublic,
		},
	});

	const handleClick = (event) => {
		event.stopPropagation();
		setAnchorEl(event.currentTarget);
	};

	const handleClose = async (e, mode) => {
		e.stopPropagation();
		if (mode === 0) {
			setOpen(true);
		} else if (mode == 1) {
			const token = await state.currentUser.getIdToken(true).catch((error) => {
				showMessage(error.message);
			});
			fetch(
				`${process.env.REACT_APP_API_URL}api/playlists/${state.currentPlaylistId}`,
				{
					method: 'DELETE',
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json;charset=UTF-8',
						Authorization: `Bearer ${token}`,
					},
				}
			)
				.then(async (res) => {
					if (res.status === 200) {
						dispatch({ type: 'DELETE_PLAYLIST', id: playlist.id });
						showMessage(`Remove ${playlist.name} successfully!`, true);
						history.push('/');
						return;
					}
					const error = await res.json();
					showMessage(error);
				})
				.catch((error) => {
					showMessage(error.message);
				});
		}
		setAnchorEl(null);
	};

	const showMessage = (message, success, duration) => {
		setIsSubmitting(false);
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
		setIsSubmitting(true);
		const token = await state.currentUser.getIdToken(true).catch((error) => {
			showMessage(error.message);
		});
		fetch(`${process.env.REACT_APP_API_URL}api/playlists/${playlist.id}`, {
			method: 'PUT',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json;charset=UTF-8',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(data),
		})
			.then(async (res) => {
				if (res.status === 200) {
					setIsSubmitting(false);
					const playlist = await res.json();
					dispatch({ type: 'UPDATE_PLAYLIST', playlist });
					showMessage(`Updated playlist ${playlist.name}!`, true);
					setOpen(false);
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
		<>
			<span>Total: {state.currentPlaylist.length}</span>
			<IconButton
				aria-controls='simple-menu'
				aria-haspopup='true'
				className={classes.button}
				size='small'
				onClick={handleClick}
				disabled={isSubmitting}>
				<MoreVertRounded />
			</IconButton>
			<Menu
				id='simple-menu'
				anchorEl={anchorEl}
				keepMounted
				open={Boolean(anchorEl)}
				onClose={handleClose}>
				<MenuItem key={0} onClick={(e) => handleClose(e, 0)}>
					<ListItemIcon>
						<EditRounded fontSize='small' />
					</ListItemIcon>
					<ListItemText primary='Edit playlist' />
				</MenuItem>
				<MenuItem key={1} onClick={(e) => handleClose(e, 1)}>
					<ListItemIcon>
						<DeleteForeverRounded fontSize='small' color='error' />
					</ListItemIcon>
					<ListItemText
						primary='Delete playlist'
					/>
				</MenuItem>
			</Menu>
			<Dialog
				onClick={(e) => e.stopPropagation()}
				open={open}
				onClose={() => setOpen(false)}
				aria-labelledby='form-dialog-title'
				disableBackdropClick
				disableEscapeKeyDown>
				<div className={classes.titleContainer}>
					<h2 style={{ marginLeft: 20 }}>Edit Playlist</h2>
					<IconButton
						edge='start'
						color='inherit'
						aria-label='Cancel'
						className={classes.cancel}
						title='Cancel Edit'
						onClick={(e) => {
							e.stopPropagation();
							setOpen(false);
						}}>
						<CancelRounded fontSize='large' />
					</IconButton>
				</div>
				<form onSubmit={handleSubmit(onSubmit)} noValidate>
					<DialogContent>
						<TextField
							margin='dense'
							id='name'
							name='name'
							label='Name'
							variant='outlined'
							fullWidth
							inputRef={register}
							error={!!errors.name}
							helperText={errors.name && errors.name.message}
						/>
						<FormControlLabel
							control={
								<Controller
									control={control}
									name='isPublic'
									render={(
										{ onChange, onBlur, value, name, ref },
										{ invalid, isTouched, isDirty }
									) => (
										<Checkbox
											onBlur={onBlur}
											onChange={(e) => onChange(e.target.checked)}
											checked={value}
											inputRef={ref}
										/>
									)}
								/>
							}
							label='Public Playlist'
						/>
					</DialogContent>
					<DialogActions>
						<Button
							type='submit'
							variant='contained'
							onClick={(e) => e.stopPropagation()}
							startIcon={
								isSubmitting ? (
									<CircularProgress
										size={24}
										className={classes.buttonProgress}
									/>
								) : (
									<EditRounded />
								)
							}
							disabled={isSubmitting}>
							Update
						</Button>
					</DialogActions>
				</form>
			</Dialog>
		</>
	);
};

const TrackOption = ({ song }) => {
	const classes = useChildStyle();
	const { state, dispatch } = useContext(StoreContext);
	const [open, setOpen] = React.useState(false);
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const [anchorEl, setAnchorEl] = React.useState(null);

	const { register, handleSubmit, errors, reset, control } = useForm({
		mode: 'onChange',
		reValidateMode: 'onChange',
		defaultValues: {
			isPublic: song.isPublic,
		},
	});

	const handleClick = (event) => {
		event.stopPropagation();
		setAnchorEl(event.currentTarget);
	};

	const handleClose = async (e, mode) => {
		e.stopPropagation();
		if (mode === 0) {
			setOpen(true);
		} else if (mode === 1) {
			const token = await state.currentUser.getIdToken(true).catch((error) => {
				showMessage(error.message);
			});
			if (state.currentPlaylistId == 'fav') {
				fetch(
					`${process.env.REACT_APP_API_URL}api/tracks/${song.id}/favorites`,
					{
						method: 'DELETE',
						headers: {
							Accept: 'application/json',
							'Content-Type': 'application/json;charset=UTF-8',
							Authorization: `Bearer ${token}`,
						},
					}
				)
					.then(async (res) => {
						if (res.status === 200) {
							dispatch({ type: 'REMOVE_FAV', id: song.id });
							showMessage(`Remove ${song.title} from Favorites!`, true);
							return;
						}
						const error = await res.json();
						showMessage(error);
					})
					.catch((error) => {
						showMessage(error.message);
					});
			} else if (state.currentPlaylist == 'home') {
				fetch(`${process.env.REACT_APP_API_URL}api/tracks/${song.id}`, {
					method: 'DELETE',
					headers: {
						Accept: 'application/json',
						'Content-Type': 'application/json;charset=UTF-8',
						Authorization: `Bearer ${token}`,
					},
				})
					.then(async (res) => {
						if (res.status === 200) {
							dispatch({ type: 'REMOVE_TRACK', id: song.id });
							showMessage(`Delete ${song.title} successfully!`, true);
							return;
						}
						const error = await res.json();
						showMessage(error);
					})
					.catch((error) => {
						showMessage(error.message);
					});
			} else {
				fetch(
					`${process.env.REACT_APP_API_URL}api/playlists/${state.currentPlaylistId}/tracks/${song.id}`,
					{
						method: 'DELETE',
						headers: {
							Accept: 'application/json',
							'Content-Type': 'application/json;charset=UTF-8',
							Authorization: `Bearer ${token}`,
						},
					}
				)
					.then(async (res) => {
						if (res.status === 200) {
							dispatch({ type: 'REMOVE_TRACK', id: song.id });
							showMessage(`Remove ${song.title} successfully!`, true);
							return;
						}
						const error = await res.json();
						showMessage(error);
					})
					.catch((error) => {
						showMessage(error.message);
					});
			}
		}
		setAnchorEl(null);
	};

	const showMessage = (message, success, duration) => {
		setIsSubmitting(false);
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
		setIsSubmitting(true);
		const formData = new FormData();
		for (const key in data) {
			if (key !== 'song') {
				formData.append(key, data[key]);
			} else {
				formData.append(key, data[key][0]);
			}
		}
		const token = await state.currentUser.getIdToken(true).catch((error) => {
			showMessage(error.message);
		});
		fetch(`${process.env.REACT_APP_API_URL}api/tracks/${song.id}`, {
			method: 'PUT',
			headers: {
				Accept: 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: formData,
		})
			.then(async (res) => {
				if (res.status === 200) {
					setIsSubmitting(false);
					const song = await res.json();
					dispatch({ type: 'UPDATE_TRACK', song });
					showMessage(`Updated song ${song.title}!`, true);
					setOpen(false);
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
		<>
			<IconButton
				aria-controls='simple-menu'
				aria-haspopup='true'
				className={classes.button}
				size='small'
				onClick={handleClick}
				disabled={isSubmitting}>
				<MoreHorizRounded />
			</IconButton>
			<Menu
				id='simple-menu'
				anchorEl={anchorEl}
				keepMounted
				open={Boolean(anchorEl)}
				onClose={handleClose}>
				<MenuItem key={0} onClick={(e) => handleClose(e, 0)}>
					<ListItemIcon>
						<EditRounded fontSize='small' />
					</ListItemIcon>
					<ListItemText primary='Edit Track' />
				</MenuItem>
				<MenuItem key={1} onClick={(e) => handleClose(e, 1)}>
					<ListItemIcon>
						{state.currentPlaylistId == 'home' ? (
							<DeleteForeverRounded fontSize='small' color='error' />
						) : (
							<DeleteRounded fontSize='small' />
						)}
					</ListItemIcon>
					<ListItemText
						primary={
							state.currentPlaylistId == 'home'
								? 'Delete track'
								: 'Remove from playlist'
						}
					/>
				</MenuItem>
			</Menu>
			<Dialog
				onClick={(e) => e.stopPropagation()}
				open={open}
				onClose={() => setOpen(false)}
				aria-labelledby='form-dialog-title'
				disableBackdropClick
				disableEscapeKeyDown>
				<div className={classes.titleContainer}>
					<h2 style={{ marginLeft: 20 }}>Edit song</h2>
					<IconButton
						edge='start'
						color='inherit'
						aria-label='Cancel'
						className={classes.cancel}
						title='Cancel Edit'
						onClick={(e) => {
							e.stopPropagation();
							setOpen(false);
						}}>
						<CancelRounded fontSize='large' />
					</IconButton>
				</div>
				<form onSubmit={handleSubmit(onSubmit)} noValidate>
					<DialogContent>
						<TextField
							margin='dense'
							id='title'
							name='title'
							label='Title'
							fullWidth
							inputRef={register}
							error={!!errors.title}
							helperText={errors.title && errors.title.message}
						/>
						<TextField
							margin='dense'
							id='artists'
							name='artists'
							label='Artists'
							fullWidth
							inputRef={register}
							error={!!errors.artists}
							helperText={errors.artists && errors.artists.message}
						/>
						<TextField
							margin='dense'
							id='album'
							name='album'
							label='Album'
							fullWidth
							inputRef={register}
							error={!!errors.album}
							helperText={errors.album && errors.album.message}
						/>
					</DialogContent>
					<DialogActions>
						<FormControlLabel
							control={
								<Controller
									control={control}
									name='isPublic'
									render={(
										{ onChange, onBlur, value, name, ref },
										{ invalid, isTouched, isDirty }
									) => (
										<Checkbox
											onBlur={onBlur}
											onChange={(e) => onChange(e.target.checked)}
											checked={value}
											inputRef={ref}
										/>
									)}
								/>
							}
							label='Public song'
						/>
						<Button
							type='submit'
							variant='contained'
							onClick={(e) => e.stopPropagation()}
							startIcon={
								isSubmitting ? (
									<CircularProgress
										size={24}
										className={classes.buttonProgress}
									/>
								) : (
									<EditRounded />
								)
							}
							disabled={isSubmitting}>
							Update
						</Button>
					</DialogActions>
				</form>
			</Dialog>
		</>
	);
};

const Favorite = ({ song }) => {
	const classes = useChildStyle();
	const { state, dispatch } = useContext(StoreContext);
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const [isSubmitting, setIsSubmitting] = React.useState(false);

	const showMessage = (message, success, duration) => {
		setIsSubmitting(false);
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

	const toggleFav = async (e) => {
		e.stopPropagation();
		const token = await state.currentUser.getIdToken(true).catch((error) => {
			showMessage(error.message);
		});
		let method = 'POST';
		if (!!song?.isFavorite) {
			method = 'DELETE';
		}
		fetch(`${process.env.REACT_APP_API_URL}api/tracks/${song.id}/favorites`, {
			method,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json;charset=UTF-8',
				Authorization: `Bearer ${token}`,
			},
		})
			.then(async (res) => {
				if (res.status === 200) {
					dispatch({ type: 'REMOVE_FAV', id: song.id });
					showMessage(`Remove ${song.title} from Favorites!`, true);
					return;
				}
				if (res.status === 201) {
					dispatch({ type: 'ADD_FAV', song });
					showMessage(`Added new track to Favorites!`, true);
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
		<IconButton
			className={classes.button}
			size='small'
			onClick={toggleFav}
			disabled={isSubmitting}>
			{!!song?.isFavorite ? <FavoriteRounded /> : <FavoriteBorder />}
		</IconButton>
	);
};

const PlayPause = ({ playing, song, isCurrentSong, visible }) => {
	const classes = useChildStyle();
	const { dispatch } = useContext(StoreContext);
	const style = { visibility: isCurrentSong || visible ? 'visible' : 'hidden' };
	const { containerProps, indicatorEl } = useLoading({
		loading: true,
		loaderProps: {
			style: {
				marginBottom: 4,
			},
		},
		indicator: <Audio width='24' height='20' />,
	});

	if (isCurrentSong && playing) {
		return visible ? (
			<IconButton
				className={classes.button}
				size='small'
				style={style}
				onClick={() => dispatch({ type: 'PAUSE' })}>
				<Pause />
			</IconButton>
		) : (
			<IconButton
				className={classes.button}
				size='small'
				style={style}
				{...containerProps}>
				{indicatorEl}
			</IconButton>
		);
	} else {
		return (
			<IconButton
				className={classes.button}
				size='small'
				style={style}
				onClick={() => dispatch({ type: 'PLAY', song })}>
				<PlayArrow />
			</IconButton>
		);
	}
};

export default Content;
