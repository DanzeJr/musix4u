
export const getTracks = (state, media) => {	
	let i = 0;
	return {
		...state,
		fetching: false,
		media: media,
		playlists: {
			...state.playlists,
			home: media.map((x) => ({ index: i++, id: x.id })),
		},
	};
};
export const play = (state, song, index) => {
	if (state.playlists[state.currentPlaylist].length === 0) {
		return state;
	}
	if (!song && !state.currentSong.id) {
		song = state.playlists[state.currentPlaylist][state.currentIndex];
		song = state.media.find((x) => x.id === song.id);
	}
	return {
		...state,
		playing: true,
		currentSong: song || state.currentSong,
		currentIndex: index !== undefined ? index : state.currentIndex,
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
	if (state.playlists[state.currentPlaylist].length === 0) {
		return state;
	}
	let index;
	const length = state.playlists[state.currentPlaylist].length;
	if (state.shuffle) {
		do {
			index = random(0, length - 1);
		} while (index === state.currentIndex);
	} else {
		if (state.currentIndex < length - 1) {
			index = state.currentIndex + 1;
		} else {
			index = 0;
		}
	}

	let song = state.playlists[state.currentPlaylist][index];
	song = state.media.find((x) => x.id === song.id);
	return play(state, song, index);
};

/**
 * Plays the previous track in the queue.
 *
 * @param state PlayerState
 * @returns PlayerState
 */
export const prev = (state) => {	
	if (state.playlists[state.currentPlaylist].length === 0) {
		return state;
	}
	let index;
	const length = state.playlists[state.currentPlaylist].length;
	if (state.shuffle) {
		do {
			index = random(0, length - 1);
		} while (index === state.currentIndex);
	} else {
		if (state.currentIndex > 0) {
			index = state.currentIndex - 1;
		} else {
			index = length - 1;
		}
	}

	let song = state.playlists[state.currentPlaylist][index];
	song = state.media.find((x) => x.id === song.id);
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
