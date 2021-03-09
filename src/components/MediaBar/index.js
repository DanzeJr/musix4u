import React, { useContext, useCallback } from "react";
import { makeStyles, createStyles } from "@material-ui/core";
import ProgressSlider from "../ProgressSlider";
import MediaNowPlaying from "../MediaNowPlaying";
import MediaControls from "../MediaControls";
import { StoreContext } from '../Home';

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {
			display: "flex",
			flexDirection: "column",
			width: "100%",
			height: "80px",
			position: "absolute",
			bottom: 0,
			left: 0,
			background: "#282828",
			"z-index": 99,
			overflow: "hidden",
			justifyContent: "center",
		},
		mediaContainer: {
			flexGrow: 1,
			display: "flex",
			flexDirection: "row",
			margin: "0px 10px",
			flexShrink: 1,
		},
		mediaItem: {
			flex: 1,
			width: "100%",
			maxWidth: "calc(50vw - 105px)",
			[theme.breakpoints.down("xs")]: {
				maxWidth: "calc(95vw - 210px)",
			},
		},
		end: {
			justifySelf: "flex-end",
		},
		controlsContainer: {
			width: "auto",
			minWidth: 210,
			overflow: "hidden",
		},
		verticallyCenter: {
			position: "relative",
			height: "100%",
			display: "flex",
			justifyContent: "center",
			flexDirection: "column",
		},
	})
);

const MediaBar = () => {
	const classes = useStyles();

	const { state, dispatch } = useContext(StoreContext);

	const setVolume = useCallback((e) =>
		dispatch({ type: "SET_VOLUME", volume: e.target.value })
	);

	return (
		<div className={classes.root}>
			<ProgressSlider />
			<div className={classes.mediaContainer}>
				<div className={`${classes.mediaItem} ${classes.verticallyCenter}`}>
					<MediaNowPlaying />
				</div>
				<div
					className={`${classes.controlsContainer} ${classes.verticallyCenter}`}>
					<MediaControls />
				</div>
			</div>
		</div>
	);
};

export default MediaBar;