export const getTracks = (state, media) => {
	return {
		...state,
		fetching: false,
		currentPlaylist: media,
	};
};

export const addToPlaylist = (state, song) => {
	return {
		...state,
		currentPlaylist: [song, ...state.currentPlaylist],
	};
};

export const play = (state, song) => {
	if (state.currentPlaylist.length === 0) {
		return state;
	}
	if (!song && !state.currentSong.name) {
		state.currentSong = state.currentPlaylist[0];
	}
	return {
		...state,
		playing: true,
		currentSong: song ?? state.currentSong,
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
	let currentIndex = state.currentPlaylist.indexOf(state.currentSong);
	if (currentIndex < 0) {
		currentIndex = 0;
	}
	if (state.shuffle) {
		if (length === 1) {
			return seek(state, 0);
		}
		do {
			index = random(0, length - 1);
		} while (index === currentIndex);
	} else {
		if (currentIndex < length - 1) {
			index = currentIndex + 1;
		} else {
			index = 0;
		}
	}

	let song = state.currentPlaylist[index];
	return play(state, song);
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
	let currentIndex = state.currentPlaylist.indexOf(state.currentSong);
	if (currentIndex < 0) {
		currentIndex = 0;
	}
	if (state.shuffle) {
		if (length === 1) {
			return seek(state, 0);
		}
		do {
			index = random(0, length - 1);
		} while (index === currentIndex);
	} else {
		if (currentIndex > 0) {
			index = currentIndex - 1;
		} else {
			index = length - 1;
		}
	}

	let song = state.currentPlaylist[index];
	return play(state, song);
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
