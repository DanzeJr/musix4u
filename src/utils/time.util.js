
const formatTimeSegment = (time) => {
	return ("0" + Math.floor(time)).slice(-2);
};

export const millisToFormattedTime = (millis, withHours) => {
	const totalSeconds = Math.floor(millis / 1000);
	const totalMinutes = Math.floor(totalSeconds / 60);
	const totalHours = Math.floor(totalMinutes / 60);

	const seconds = totalSeconds - totalMinutes * 60;
	const minutes = totalMinutes - totalHours * 60;

	const hourSegment = formatTimeSegment(totalHours);
	const minSegment = formatTimeSegment(minutes);
	const secSegment = formatTimeSegment(seconds);

	if (withHours) {
		return `${hourSegment}:${minSegment}:${secSegment}`;
	} else {
		return `${minSegment}:${secSegment}`;
	}
};

const secondToFormattedTime = (sec, withHours) => {
	let secSegment = Math.floor(sec % 60);
	if (secSegment < 10) secSegment = `0${secSegment}`;

	const minSegment = Math.floor(sec / 60);

	if (withHours) {
		const hourSegment = Math.floor(sec / 3600);
		return `${hourSegment}:${minSegment}:${secSegment}`;
	}
	return `${minSegment}:${secSegment}`;
}

const hasHours = (millis) => {
	return millis / 1000 / 60 / 60 >= 1;
};

/**
 * Creates a formatted time string from the progress
 *
 * @param state State
 * @returns formatted time string
 */
export const progressToFormattedTime = (state) => {
	const withHours = hasHours(state.duration);
	const formattedPosition = secondToFormattedTime(state.currentTime, withHours);
	const formattedDuration = secondToFormattedTime(state.duration, withHours);

	return `${formattedPosition} / ${formattedDuration}`;
};
