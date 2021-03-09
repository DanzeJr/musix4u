import { play, pause, next, prev, seek } from "../utils/player.util";

const DEFAULT_PLAYLIST = "home";
const DEFAULT_VOLUME = 0.65;

export const initialState = {
	media: [],
	addToPlaylistId: "",
	currentPlaylist: DEFAULT_PLAYLIST,
	currentSong: {},
	currentIndex: 0,
	currentTime: 0,
	seekingTime: 0,
	duration: 0,
	playing: false,
	playlists: {
		home: [],
		favorites: [],
	},
	volume: DEFAULT_VOLUME,
};

export const reducer = (state, action) => {
	switch (action.type) {
		case "GET": {
			let i = 0;
			return {
				...state,
				media: action.media,
				playlists: {
					...state.playlists,
					home: action.media.map((x) => ({index: i++, id: x.id}))
				}
			};
		}
		case "ADD_PLAYLIST":
			return {
				...state,
				playlists: { ...state.playlists, [action.playlist]: [] },
			};
		case "ADD_TO_PLAYLIST":
			return { ...state, addToPlaylistId: action.songId };
		case "ABORT_ADD_TO_PLAYLIST":
			return { ...state, addToPlaylistId: "" };
		case "ADD_FAVORITE":
			state.playlists.favorites.add(action.songId);
			return { ...state };
		case "PLAY":
			return play(state, action.song, action.index);
		case "PAUSE":
			return pause(state);
		case "NEXT":
			return next(state);
		case "PREV":
			return prev(state);
		case "SEEK": {
			return seek(state, action.position, action.relative);
		}
		case "REMOVE_FAVORITE":
			state.playlists.favorites.delete(action.songId);
			return { ...state };
		case "SAVE_TO_PLAYLIST":
			state.playlists[action.playlist].add(state.addToPlaylistId);
			return { ...state, addToPlaylistId: "" };
		case "SET_CURRENT_TIME":
			return { ...state, currentTime: action.time };
		case "SET_DURATION":
			return { ...state, duration: action.duration };
		case "SET_PLAYLIST":
			return { ...state, currentPlaylist: action.playlist };
		case "SET_VOLUME":
			return { ...state, volume: parseFloat(action.volume) };
		default: {
			return state;
		}
	}
};
