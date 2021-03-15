import React, { useContext, useState } from 'react';
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
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { Add, FavoriteBorder, Pause, PlayArrow } from '@material-ui/icons';
import { useParams } from 'react-router';
import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { FirebaseAuth } from './../../services/Firebase/index';

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

const Content = () => {
	const classes = useStyles();
	const history = useHistory();
	const { id } = useParams();
	const { state, dispatch } = useContext(StoreContext);
	const [songs, setSongs] = useState([]);
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const [playVisibleId, setPlayVisibleId] = useState(false);
	const { containerProps, indicatorEl } = useLoading({
		loading: true,
		loaderProps: {
			style: {
				position: 'fixed',
				top: '50%',
				left: '50%',
				transform: 'translate(-50%, -50%)',
			},
		},
		indicator: <Bars width='50' />,
	});

	const showMessage = (message, success, duration, action) => {
		if (!success && typeof message === 'object') {
			message = 'Error occurs';
		}
		enqueueSnackbar(message, {
			anchorOrigin: {
				vertical: 'top',
				horizontal: 'center',
			},
			variant: success ? 'success' : 'error',
			autoHideDuration: duration ?? 3000,
			onClick: action ?? closeSnackbar(),
		});
	};

	const getTracks = async (filter) => {
		dispatch({ type: 'FETCH' });
		let headers  = {
			Accept: 'application/json',
		};
		if (state.currentUser?.uid) {
			const token = await state.currentUser.getIdToken(true).catch((error) => {
				showMessage(error.message);
			});
			headers['Authorization'] = `Bearer ${token}`;
		}
		let response = await fetch(
			`${process.env.REACT_APP_API_URL}api/tracks?${queryString.stringify(
				filter
			)}`,
			{
				method: 'GET',
				headers: headers
			}
		);
		let data = await response.json();
		dispatch({ type: 'GET', media: data });
	};

	useEffect(() => {
		let filter = {};
		if (!!id) {
			if (id === 'fav') {
				filter = { favorite: true };
			} else if (state.playlists.has(id)) {
				filter = { playlistId: id };
			} else {
				history.push('/');
				return;
			}
		}
		getTracks(filter);
	}, [id, state.currentUser]);

	useEffect(() => {
		setSongs(state.currentPlaylist);
	}, [state.currentPlaylist])

	const playOrPause = (song, index) => {
		if (state.currentSong.id === song.id && state.playing) {
			dispatch({ type: 'PAUSE' });
		} else {
			dispatch({ type: 'PLAY', song, index });
		}
	};

	const loader = <section {...containerProps}>{indicatorEl}</section>;

	return (
		<div className={classes.root}>
			{state.fetching ? (
				loader
			) : songs.length <= 0 ? (
				<p style={{ marginTop: 10 }}>
					Your playlist is empty. Start by adding some songs!
				</p>
			) : (
				<TableContainer component={Paper} className={classes.tableContainer}>
					<Table className={classes.table} aria-label='Tracks list'>
						<TableHead>
							<TableRow>
								<StyledTableCell></StyledTableCell>
								<StyledTableCell align='left'>Title</StyledTableCell>
								<StyledTableCell align='left'>Artist</StyledTableCell>
								<StyledTableCell align='left'>Length</StyledTableCell>
								<StyledTableCell align='left'></StyledTableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							{songs.map((song) => {

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

											<span style={{ marginRight: 10 }} />

											<Favorite isFavorite={song.isFavorite} songId={song.id} />

											<span style={{ marginRight: 10 }} />

											<AddToPlaylist id={id} />
										</StyledTableCell>
										<StyledTableCell align='left'>{song.title}</StyledTableCell>
										<StyledTableCell align='left'>
											{song.performers}
										</StyledTableCell>
										<StyledTableCell align='left'>
											{millisToFormattedTime(song.duration)}
										</StyledTableCell>
										<StyledTableCell align='left'></StyledTableCell>
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

const AddToPlaylist = ({ id }) => {
	const { dispatch } = useContext(StoreContext);

	return (
		<IconButton
			size='small'
			onClick={(e) => {
				e.stopPropagation();
				dispatch({ type: 'ADD_TO_PLAYLIST', songId: id });
			}}>
			<Add />
		</IconButton>
	);
};

const Favorite = ({ isFavorite, songId }) => {
	const { dispatch } = useContext(StoreContext);

	return isFavorite ? (
		<IconButton
			size='small'
			onClick={(e) => {
				e.stopPropagation();
				dispatch({ type: 'REMOVE_FAVORITE', songId });
			}}>
			<Favorite />
		</IconButton>
	) : (
		<IconButton
			size='small'
			onClick={(e) => {
				e.stopPropagation();
				dispatch({ type: 'ADD_FAVORITE', songId });
			}}>
			<FavoriteBorder />
		</IconButton>
	);
};

const PlayPause = ({ playing, song, isCurrentSong, visible }) => {
	const { dispatch } = useContext(StoreContext);
	const style = { visibility: isCurrentSong || visible ? 'visible' : 'hidden' };
	const { containerProps, indicatorEl } = useLoading({
		loading: true,
		indicator: <Audio width='24' height='20' />,
	});

	if (isCurrentSong && playing) {
		return visible ? (
			<IconButton
				size='small'
				style={style}
				onClick={() => dispatch({ type: 'PAUSE' })}>
				<Pause />
			</IconButton>
		) : (
			<IconButton size='small' style={style} {...containerProps}>
				{indicatorEl}
			</IconButton>
		);
	} else {
		return (
			<IconButton
				size='small'
				style={style}
				onClick={() => dispatch({ type: 'PLAY', song })}>
				<PlayArrow />
			</IconButton>
		);
	}
};

export default Content;
