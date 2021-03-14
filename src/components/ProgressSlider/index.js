import { useContext } from "react";
import { StoreContext } from '../../App';
import { Slider, withStyles } from '@material-ui/core';

const PlaySlider = withStyles({
	root: {
		color: "hsla(125, 70%, 40%, 1)",
		padding: 0,
		margin: 0,
		paddingBottom: 8,
	},
	thumb: {
		display: "none",
	},
	track: {
		height: 8,
	},
	rail: {
		height: 8,
		color: "hsla(125, 70%, 40%, 1)",
	},
})(Slider);

const ProgressSlider = () => {	
	const { state, dispatch } = useContext(StoreContext);

	return (
		<PlaySlider
			aria-label='Progress Slider'
			defaultValue={0}
			disabled={state.currentTime === 0}
			min={0}
			max={state.duration === 0 ? 1 : state.duration}
			value={state.currentTime}
			onChangeCommitted={(event, value) =>
				dispatch({
					type: "SEEK",
					position: value,
				})
			}
		/>
	);
};

export default ProgressSlider;
