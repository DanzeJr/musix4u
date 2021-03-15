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
} from '../utils/player.util';

const DEFAULT_PLAYLIST = 'home';
const DEFAULT_VOLUME = 50;

export const initialState = {
	media: [],
	playlists: [],
	currentPlaylistId: DEFAULT_PLAYLIST,
	currentPlaylist: [],
	currentSong: {
		index: 0
	},
	currentTime: 0,
	seekingTime: 0,
	duration: 0,
	repeat: 0,
	shuffle: false,
	playing: false,
	fetching: false,
	loading: true,
	volume: DEFAULT_VOLUME,
	currentUser: {},
	claims: {},
};

export const reducer = (state, action) => {
	switch (action.type) {
		case 'SET_CLAIMS': {
			return { ...state, claims: action.claims };
		}
		case 'SET_USER': {
			return { ...state, currentUser: action.user };
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
		case 'ADD_PLAYLIST':
			return {
				...state,
				playlists: [...state.playlists, action.id ],
			};
		case 'ADD_TO_PLAYLIST':
			return { ...state, currentPlaylist: [...state.currentPlaylist, action.song] };
		case 'ABORT_ADD_TO_PLAYLIST':
			return { ...state, addToPlaylistId: '' };
		case 'ADD_FAVORITE':
			return { ...state };
		case 'PLAY':
			return play(state, action.song, action.index);
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
		case 'REMOVE_FAVORITE':
			return { ...state };
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
