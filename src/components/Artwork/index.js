import React from 'react';
import { makeStyles, Avatar } from '@material-ui/core';
import clsx from 'clsx';
import { useContext } from 'react';
import { StoreContext } from '../../App';

const useStyles = makeStyles((theme) => ({
	'@keyframes infinite-spin': {
		from: {
			transform: 'rotate(0deg)',
		},
		to: {
			transform: 'rotate(360deg)',
		},
	},
	spin: {
		animation: '$infinite-spin 20s infinite linear',
	},
	large: {
		width: theme.spacing(8),
		height: theme.spacing(8),
	},
}));
const Artwork = (props) => {
	const classes = useStyles(props);
	const { state } = useContext(StoreContext);

	return (
		<Avatar
			src={
				props.url ?? '/vinyl.jpg'
			}
			className={clsx(classes.large, classes.spin)}
			style={{ animationPlayState: state.playing ? 'running' : 'paused' }}
		/>
	);
};

export default Artwork;
