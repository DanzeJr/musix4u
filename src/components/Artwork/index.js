import React from "react";
import { makeStyles, createStyles } from "@material-ui/core";

const useStyles = makeStyles((theme) =>
	createStyles({
		artwork: (props) => ({
			width: props.width,
			height: props.height,
			backgroundImage: `url(${props.url})`,
			backgroundSize: "cover!important",
		}),
	})
);

const Artwork = (props) => {
	const classes = useStyles(props);

	return <div className={classes.artwork} />;
};

export default Artwork;
