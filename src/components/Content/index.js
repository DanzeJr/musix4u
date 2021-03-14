import React, { useCallback, useContext, useState } from 'react';
import { StoreContext } from '../../App';

import Modal from '../Modal';
import Toast from '../Toast';
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
	const { state, dispatch } = useContext(StoreContext);

	const [toast, setToast] = useState('');
	const [playlistSelect, setPlayListSelect] = useState('');
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

	const currentPlaylist = state.currentPlaylist;

	const playlists = Object.keys(state.playlists).filter(
		(list) => !['home', 'favorites'].includes(list)
	);
	const songs = Array.from(state.playlists[currentPlaylist]);

	const handleSelect = useCallback((e) => {
		setPlayListSelect(e.target.value);
	});

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
							{songs.map(({ index, id }) => {
								const song = state.media.find((x) => x.id == id);
								const isFavorite = state.playlists.favorites.some(
									(x) => x.id == id
								);

								return (
									<StyledTableRow
										key={id}
										onMouseEnter={() => setPlayVisibleId(id)}
										onMouseLeave={() => setPlayVisibleId('')}
										onClick={() => playOrPause(song, index)}>
										<StyledTableCell component='th' scope='row'>
											<PlayPause
												playing={state.playing}
												song={song}
												index={index}
												isCurrentSong={state.currentSong.id === id}
												visible={playVisibleId === id}
											/>

											<span style={{ marginRight: 10 }} />

											<Favorite isFavorite={isFavorite} songId={id} />

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

			<Modal
				show={state.addToPlaylistId}
				close={() => {
					dispatch({ type: 'ABORT_ADD_TO_PLAYLIST' });
				}}>
				<div style={{ textAlign: 'center' }}>
					<div style={{ fontSize: 18, marginBottom: 20 }}>Add To Playlist</div>

					{playlists.length < 1 ? (
						<div>
							<p>
								You don't have any custom playlists yet. Start by creating one
								in the sidebar menu!
							</p>

							<div style={{ marginTop: 15 }}>
								<button>Ok</button>
							</div>
						</div>
					) : (
						<>
							<select
								value={playlistSelect}
								onChange={handleSelect}
								style={{
									fontSize: 16,
									textTransform: 'capitalize',
									width: 115,
									height: 25,
								}}>
								<option value=''>Choose</option>

								{playlists.map((list) => (
									<option
										key={list}
										value={list}
										disabled={state.playlists[list].has(state.addToPlaylistId)}>
										{list}
									</option>
								))}
							</select>

							<div style={{ marginTop: 20 }}>
								<button
									onClick={() => {
										if (playlistSelect === '') return;

										dispatch({
											type: 'SAVE_TO_PLAYLIST',
											playlist: playlistSelect,
										});

										setToast('Successfully added to your playlist.');

										setPlayListSelect('');
									}}>
									Save
								</button>
							</div>
						</>
					)}
				</div>
			</Modal>

			<Toast toast={toast} close={() => setToast('')} />
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

const PlayPause = ({ playing, song, index, isCurrentSong, visible }) => {
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
				onClick={() => dispatch({ type: 'PLAY', song, index })}>
				<PlayArrow />
			</IconButton>
		);
	}
};

export default Content;
