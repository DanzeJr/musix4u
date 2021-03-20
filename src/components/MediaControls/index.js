import React, { useContext } from "react";
import {
	IconButton,
	makeStyles,
	createStyles,
} from "@material-ui/core";
import PlayCircleOutlineRounded from "@material-ui/icons/PlayCircleOutlineRounded";
import PauseCircleOutlineRounded from "@material-ui/icons/PauseCircleOutlineRounded";
import SkipPreviousRounded from "@material-ui/icons/SkipPreviousRounded";
import Replay10Rounded from "@material-ui/icons/Replay10Rounded";
import Forward10Rounded from "@material-ui/icons/Forward10Rounded";
import SkipNextRounded from "@material-ui/icons/SkipNextRounded";
import { StoreContext } from '../../App';
import {
	RepeatRounded,
	RepeatOneRounded,
	ShuffleRounded,
} from "@material-ui/icons";
import clsx from "clsx";

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {
			justifyContent: "center",
			verticalAlign: "center",
			alignItems: "center",
			display: "flex",
			flexDirection: "row",
			overflow: "hidden",
		},
		icon: {
			height: "35px",
			width: "35px",
		},
		bigIcon: {
			height: "45px",
			width: "45px",
		},
		hover: {
			color: theme.palette.secondary.main,
			"&:hover": {
				backgroundColor: "#ffffff11",
			},
		},
		active: {
			color: theme.palette.secondary.main
		},
		inactive: {
			color: theme.palette.primary.main
		}
	})
);

const MediaControls = () => {
	const classes = useStyles();
	const { state, dispatch } = useContext(StoreContext);

	const play = () => {
		dispatch({
			type: "PLAY",
		});
	};

	const pause = () => {
		dispatch({
			type: "PAUSE",
		});
	};

	const next = () => {
		dispatch({
			type: "NEXT",
		});
	};

	const prev = () => {
		dispatch({
			type: "PREV",
		});
	};

	const forward = () => {
		dispatch({
			type: "SEEK",
			position: 10,
			relative: true,
		});
	};

	const back = () => {
		dispatch({
			type: "SEEK",
			position: -1 * 10,
			relative: true,
		});
	};

	const repeat = () => {
		dispatch({
			type: "REPEAT",
		});
	};

	const shuffle = () => {
		dispatch({
			type: "SHUFFLE",
		});
	};

	return (
		<div className={classes.root}>
			<IconButton
				size='small'
				onClick={shuffle}
				className={classes.hover}
				title='Shuffle'>
				<ShuffleRounded className={state.shuffle ? classes.active : classes.inactive} fontSize='large' />
			</IconButton>
			<IconButton
				size='small'
				onClick={prev}
				className={classes.hover}
				title='Previous'>
				<SkipPreviousRounded fontSize='large' />
			</IconButton>
			<IconButton
				size='small'
				onClick={back}
				className={classes.hover}
				title='Back 10'>
				<Replay10Rounded fontSize='large' />
			</IconButton>
			{state.playing ? (
				<IconButton
					size='small'
					onClick={pause}
					className={classes.hover}
					title='Pause'>
					<PauseCircleOutlineRounded className={classes.bigIcon} />
				</IconButton>
			) : (
				<IconButton
					size='small'
					onClick={play}
					className={classes.hover}
					title='Play'>
					<PlayCircleOutlineRounded className={classes.bigIcon} />
				</IconButton>
			)}
			<IconButton
				size='small'
				onClick={forward}
				className={classes.hover}
				title='Forward 10'>
				<Forward10Rounded fontSize='large' />
			</IconButton>
			<IconButton
				size='small'
				onClick={next}
				className={classes.hover}
				title='Next'>
				<SkipNextRounded fontSize='large' />
			</IconButton>
			<IconButton
				size='small'
				onClick={repeat}
				className={classes.hover}
				title='Repeat'>
				{state.repeat === 1 ? (
					<RepeatOneRounded fontSize='large' />
				) : (
					<RepeatRounded className={state.repeat !== 0 ? classes.active : classes.inactive} fontSize='large' />
				)}
			</IconButton>
		</div>
	);
};

export default MediaControls;
