import React, { useContext, useState } from 'react';
import {
	makeStyles,
	createStyles,
	withStyles,
	Slider,
	Tooltip,
	IconButton,
} from '@material-ui/core';
import { StoreContext } from '../../App';
import {
	CloudDownloadRounded,
	VolumeUpRounded,
	VolumeDownRounded,
	VolumeOffRounded,
} from '@material-ui/icons';

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {
			display: 'flex',
			flexDirection: 'row-reverse',
			alignItems: 'flex-end',
		},
		accessories: {
			justifyContent: 'center',
			verticalAlign: 'center',
			alignItems: 'center',
			display: 'flex',
			flexDirection: 'row',
			overflow: 'hidden',
		},
		verticallyCenter: {
			position: 'relative',
			height: '100%',
			display: 'flex',
			justifyContent: 'center',
			flexDirection: 'column',
		},
		hover: {
			'&:hover': {
				backgroundColor: '#ffffff11',
			},
		},
	})
);

const iOSBoxShadow =
	'0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.13),0 0 0 1px rgba(0,0,0,0.02)';

const PrettoSlider = withStyles({
	root: {
		color: '#52af77',
		height: 8,
		width: '100px',
		zIndex: 99,
		marginTop: '5px',
		marginRight: '50px',
	},
	thumb: {
		height: 18,
		width: 18,
		backgroundColor: '#fff',
		boxShadow: iOSBoxShadow,
		marginTop: -8,
		marginLeft: -10,
		'&:focus, &:hover, &$active': {
			boxShadow:
				'0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,0.3),0 0 0 1px rgba(0,0,0,0.02)',
			// Reset on touch devices, it doesn't add specificity
			'@media (hover: none)': {
				boxShadow: iOSBoxShadow,
			},
		},
	},
	active: {},
	valueLabel: {
		left: 'calc(-50% + 2px)',
		top: -22,
		'& *': {
			background: 'transparent',
			color: '#000',
		},
	},
	track: {
		height: 2,
	},
	rail: {
		height: 2,
		opacity: 0.5,
		backgroundColor: '#bfbfbf',
	},
	mark: {
		backgroundColor: '#bfbfbf',
		height: 8,
		width: 1,
		marginTop: -3,
	},
	markActive: {
		opacity: 1,
		backgroundColor: 'currentColor',
	},
})(Slider);

const MediaAccessories = () => {
	const classes = useStyles();
	const { state, dispatch } = useContext(StoreContext);
	const [volume, setVolume] = useState(state.volume);
	const song = state.currentSong;

	const changeVolume = (event, newValue) => {
		setVolume(newValue);
		dispatch({
			type: 'SET_VOLUME',
			volume: newValue,
		});
	};

	return (
		<div className={`${classes.root} ${classes.verticallyCenter}`}>
			<div className={classes.accessories}>
				<IconButton
					color='secondary'
					size='small'
					onClick={() => changeVolume(null, state.volume === 0 ? 100 : 0)}
					className={classes.hover}
					style={{ marginRight: '19px', marginLeft: '20px' }}
					title='Volume'>
					{state.volume === 0 ? (
						<VolumeOffRounded />
					) : state.volume > 50 ? (
						<VolumeUpRounded />
					) : (
						<VolumeDownRounded />
					)}
				</IconButton>
				<PrettoSlider
					className={classes.autoHide}
					valueLabelDisplay='auto'
					aria-label='pretto slider'
					defaultValue={20}
					value={volume}
					onChange={changeVolume}
				/>
				{song.id ? (
					<Tooltip title='Download this song' placement='top'>
						<a href={song.url} target='_blank' rel='noopener noreferrer'>
							<IconButton
								color='secondary'
								className={classes.hover}
								title='Download this song'>
								<CloudDownloadRounded />
							</IconButton>
						</a>
					</Tooltip>
				) : (
					<div></div>
				)}
			</div>
		</div>
	);
};

export default MediaAccessories;
