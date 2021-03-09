import React, { useContext } from "react";
import { makeStyles, createStyles, Typography } from "@material-ui/core";
import Artwork from "../Artwork";
import { StoreContext } from "../Home";
import ProgressTime from "../ProgressTime";

const useStyles = makeStyles((theme) =>
	createStyles({
		root: {
			display: "flex",
			flexDirection: "row",
		},
		infoContainer: {
			flexGrow: 1,
			display: "flex",
			flexDirection: "column",
			marginLeft: "10px",
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

const MediaNowPlaying = () => {
	const classes = useStyles();
	const { state, dispatch } = useContext(StoreContext);
	const song = state.currentSong;

	return (
		<div className={classes.root}>
			<div className={classes.verticallyCenter}>
				<Artwork height={60} width={60} url={song.coverUrl} />
			</div>
			<div className={classes.infoContainer}>
				<Typography align='left' color='textPrimary' noWrap={true}>
					{song.title ? song.title : "--"}
				</Typography>
				<Typography align='left' color='textSecondary' noWrap={true}>
					{song.performers ? song.performers : "--"}
				</Typography>
				<Typography align='left' color='textPrimary' noWrap={true}>
					<ProgressTime />
				</Typography>
			</div>
		</div>
	);
};

export default MediaNowPlaying;
