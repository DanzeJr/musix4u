import {
	play,
	pause,
	next,
	prev,
	seek,
	setCurrentTime,
	repeat,
	shuffle,
	getTracks,
	addToPlaylist,
} from '../utils/player.util';

const DEFAULT_PLAYLIST = 'home';
const DEFAULT_VOLUME = 50;

export const initialState = {
	sharedPlaylists: [],
	playlists: [],
	currentPlaylistId: DEFAULT_PLAYLIST,
	currentPlaylist: [],
	currentSong: {},
	currentTime: 0,
	seekingTime: 0,
	duration: 0,
	repeat: 0,
	shuffle: false,
	playing: false,
	fetching: false,
	loading: true,
	volume: DEFAULT_VOLUME,
	currentUser: null,
	claims: {},
};

export const reducer = (state, action) => {
	switch (action.type) {
		case 'RESET': {
			return {
				...state,
				playlists: [],
				currentPlaylist: [],
				currentSong: {},
				currentPlaylistId: DEFAULT_PLAYLIST,
				playing: false,
				currentTime: 0,
			};
		}
		case 'SET_CLAIMS': {
			return { ...state, claims: action.claims };
		}
		case 'SET_USER': {
			return {
				...state,
				currentUser: action.user,
				displayName: action.user?.displayName,
			};
		}
		case 'LOAD': {
			return { ...state, loading: action.loading ?? true };
		}
		case 'FETCH': {
			return { ...state, fetching: action.loading ?? true };
		}
		case 'GET': {
			return getTracks(state, action.media);
		}
		case 'SET_PLAYLISTS': {
			return { ...state, playlists: action.playlists };
		}
		case 'SET_SHARED_PLAYLISTS': {
			return { ...state, sharedPlaylists: action.playlists };
		}
		case 'SET_CURRENT_PLAYLIST': {
			return { ...state, currentPlaylistId: action.id };
		}
		case 'ADD_PLAYLIST': {
			if (action.playlist.isPublic) {
				state.sharedPlaylists.push(action.playlist);
			}
			return {
				...state,
				playlists: [...state.playlists, action.playlist],
				sharedPlaylists: [...state.sharedPlaylists],
			};
		}

		case 'UPDATE_PLAYLIST': {
			let index = state.playlists.findIndex((x) => x.id == action.playlist.id);
			state.playlists[index] = action.playlist;
			index = state.sharedPlaylists.findIndex(
				(x) => x.id == action.playlist.id
			);
			if (index >= 0) {
				if (action.playlist.isPublic) {
					state.sharedPlaylists[index] = action.playlist;
				} else {
					state.sharedPlaylists = state.sharedPlaylists.filter(
						(x) => x.id != action.playlist.id
					);
				}
			} else if (action.playlist.isPublic) {
				state.sharedPlaylists.push(action.playlist)
			}
			return {
				...state,
				playlists: [...state.playlists],
				sharedPlaylists: [...state.sharedPlaylists],
			};
		}
		case 'DELETE_PLAYLIST': {
			state.playlists = state.playlists.filter((x) => x.id != action.id);
			state.sharedPlaylists = state.sharedPlaylists.filter(
				(x) => x.id != action.id
			);
			return {
				...state,
				playlists: [...state.playlists],
				sharedPlaylists: [...state.sharedPlaylists],
			};
		}
		case 'ADD_TO_PLAYLIST': {
			return addToPlaylist(state, action.song);
		}
		case 'ADD_FAV': {
			const song = state.currentPlaylist.find((x) => x.id === action.song.id);
			song.isFavorite = true;
			return { ...state };
		}
		case 'REMOVE_FAV': {
			if (state.currentPlaylistId === 'fav') {
				state.currentPlaylist = state.currentPlaylist.filter(
					(x) => x.id !== action.id
				);
				return { ...state, currentPlaylist: state.currentPlaylist };
			}
			const song = state.currentPlaylist.find((x) => x.id === action.id);
			song.isFavorite = false;

			return { ...state };
		}
		case 'UPDATE_TRACK': {
			const index = state.currentPlaylist.findIndex(
				(x) => x.id == action.song.id
			);
			state.currentPlaylist[index] = action.song;
			if (state.currentSong?.id === action.song.id) {
				state.currentSong.title = action.song.title;
			}
			return {
				...state,
				currentPlaylist: [...state.currentPlaylist],
				currentSong: { ...state.currentSong },
			};
		}
		case 'REMOVE_TRACK': {
			state.currentPlaylist = state.currentPlaylist.filter(
				(x) => x.id !== action.id
			);
			return { ...state };
		}
		case 'UPDATE_USER': {
			return { ...state, displayName: action.user.name };
		}
		case 'PLAY':
			return play(state, action.song);
		case 'PAUSE':
			return pause(state);
		case 'NEXT':
			return next(state);
		case 'PREV':
			return prev(state);
		case 'SEEK': {
			return seek(state, action.position, action.relative);
		}
		case 'REPEAT': {
			return repeat(state);
		}
		case 'SHUFFLE': {
			return shuffle(state);
		}
		case 'SAVE_TO_PLAYLIST':
			return { ...state, addToPlaylistId: '' };
		case 'SET_CURRENT_TIME': {
			return setCurrentTime(state, action.time);
		}
		case 'SET_DURATION':
			return { ...state, duration: action.duration };
		case 'SET_PLAYLIST':
			return { ...state, currentPlaylist: action.playlist };
		case 'SET_VOLUME':
			return { ...state, volume: parseFloat(action.volume) };
		default: {
			return state;
		}
	}
};
