
export const play = (state, song, index) => {
	if (!song && !state.currentSong.id) {
		return state;
	}
	return {
		...state,
		playing: true,
		currentSong: song || state.currentSong,
		currentIndex: index !== undefined ? index : state.currentIndex
	};
};

export const pause = (state) => {	
	return { ...state, playing: false };
};

const isCurTrack = (state, id) => {
	return state.currentSong.id == id
};

const isTrackInNext = (state, id) => {
	return state.playlists[state.currentPlaylist][state.currentIndex + 1].id == id
};

const isTrackInPrev = (state, id) => {
	return state.playlists[state.currentPlaylist][state.currentIndex - 1].id == id
};

/**
 * Plays the next track in the queue.
 *
 * @param state PlayerState
 * @returns PlayerState
 */
export const next = (state) => {
	let index;	
	const length = state.playlists[state.currentPlaylist].length;
	if (state.currentIndex < length - 1) {
		index = state.currentIndex + 1;
	} else {
		index = 0;
	}
	
	let song = state.playlists[state.currentPlaylist][index];
	song = state.media.find(x => x.id == song.id);
	return play(state, song, index);
};

/**
 * Plays the previous track in the queue.
 *
 * @param state PlayerState
 * @returns PlayerState
 */
export const prev = (state) => {
	let index;
	if (state.currentIndex > 0) {
		index = state.currentIndex - 1;
	} else {
		const length = state.playlists[state.currentPlaylist].length;
		index =length - 1;
	}
	
	let song = state.playlists[state.currentPlaylist][index];
	song = state.media.find(x => x.id == song.id);
	return play(state, song, index);
};

/**
 * Seeks to the requested position if within bounds of the track's duration.
 *
 * @param state State
 * @param position number (in seconds) to seek to
 * @param relative boolean whether position is relative or absolute
 * @returns State
 */
export const seek = (
	state,
	position,
	relative
) => {
	if (position && state.currentSong.id) {
		const seekingTime = relative ? state.currentTime + position : position;
		if (seekingTime < 0) {
			return prev({ ...state, seekingTime: 0 });
		}
		if (seekingTime > state.duration) {
			return next({ ...state, seekingTime: 0 });
		}
		return { ...state, seekingTime }
	} else {
		return state;
	}
};
