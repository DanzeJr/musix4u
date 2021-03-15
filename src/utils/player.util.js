
export const getTracks = (state, media) => {
	return {
		...state,
		fetching: false,
		currentPlaylist: media.map((song, index) => ({ ...song, index }))
	};
};
export const play = (state, song) => {
	if (state.currentPlaylist.length === 0) {
		return state;
	}
	if (!song) {
		song =state.currentPlaylist[state.currentSong.index];
	}
	return {
		...state,
		playing: true,
		currentSong: song || state.currentSong
	};
};

export const pause = (state) => {
	return { ...state, playing: false };
};

export const setCurrentTime = (state, time) => {
	return { ...state, currentTime: time };
};

export const repeat = (state) => {
	let repeat = state.repeat + 1;
	if (repeat > 2) {
		repeat = 0;
	}
	return { ...state, repeat };
};

export const shuffle = (state) => {
	const shuffle = !state.shuffle;
	return { ...state, shuffle };
};

const random = (lower, upper) => {
	return Math.floor(Math.random() * ++upper) + lower;
};

/**
 * Plays the next track in the queue.
 *
 * @param state PlayerState
 * @returns PlayerState
 */
export const next = (state) => {	
	const length = state.currentPlaylist.length;
	if (length === 0) {
		return state;
	}
	let index;
	if (state.shuffle) {
		do {
			index = random(0, length - 1);
		} while (index === state.currentSong.index);
	} else {
		if (state.currentSong.index < length - 1) {
			index = state.currentSong.index + 1;
		} else {
			index = 0;
		}
	}

	let song =state.currentPlaylist[index];
	return play(state, song, index);
};

/**
 * Plays the previous track in the queue.
 *
 * @param state PlayerState
 * @returns PlayerState
 */
export const prev = (state) => {	
	const length = state.currentPlaylist.length;
	if (length === 0) {
		return state;
	}
	let index;
	if (state.shuffle) {
		do {
			index = random(0, length - 1);
		} while (index === state.currentSong.index);
	} else {
		if (state.currentSong.index > 0) {
			index = state.currentSong.index - 1;
		} else {
			index = length - 1;
		}
	}

	let song =state.currentPlaylist[index];
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
export const seek = (state, position, relative) => {
	if (state.currentSong.id) {
		const seekingTime = relative ? state.currentTime + position : position;
		if (seekingTime < 0) {
			return prev(state);
		}
		if (seekingTime > state.duration) {
			return next(state);
		}
		return { ...state, seekingTime };
	} else {
		return state;
	}
};
