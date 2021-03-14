import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';

import IconMenu from '@material-ui/icons/Menu';

import HeaderSearch from './AppHeaderSearch';
import HeaderNotifications from './AppHeaderNotifications';
import HeaderProfile from './AppHeaderProfile';

const AppHeader = ({ onToggleClick }) => {
	const classes = useStyles();

	return (
		<AppBar position='static' className={classes.header}>
			<Toolbar className={classes.toolbar}>
				<IconButton
					edge='start'
					color='inherit'
					aria-label='Toggle sidebar'
					onClick={onToggleClick}>
					<IconMenu />
				</IconButton>
				<HeaderSearch />
				<div className={classes.actions}>
					<HeaderNotifications />
					<HeaderProfile />
				</div>
			</Toolbar>
		</AppBar>
	);
};

const useStyles = makeStyles((theme) => ({
	header: {
		backgroundColor: theme.palette.primary.light,
		boxShadow: 'none',
	},
	toolbar: {},
	menuButton: {},
	actions: {
		marginLeft: 'auto',
		alignItems: 'center',
		display: 'flex',
	},
	notificationsButton: {
		marginRight: 23,
	},
	title: {
		flexGrow: 1,
	},
}));

export default AppHeader;
