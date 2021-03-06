import React from "react";
import { makeStyles, createStyles, Hidden } from "@material-ui/core";
import ProgressSlider from "../ProgressSlider";
import MediaNowPlaying from "../MediaNowPlaying";
import MediaControls from "../MediaControls";
import MediaAccessories from "../MediaAccessories";

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
			background: theme.palette.primary.light,
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
				<Hidden xsDown>
					<div
						className={`${classes.end} ${classes.mediaItem} ${classes.verticallyCenter}`}>
						<MediaAccessories />
					</div>
				</Hidden>
			</div>
		</div>
	);
};

export default MediaBar;
