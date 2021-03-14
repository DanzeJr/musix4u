import React, { useContext } from 'react';

import { Link, useHistory } from 'react-router-dom';

import { makeStyles } from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Avatar from '@material-ui/core/Avatar';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Divider from '@material-ui/core/Divider';

import IconArrowDropDown from '@material-ui/icons/ArrowDropDown';
import IconProfile from '@material-ui/icons/AccountBox';
import IconAccount from '@material-ui/icons/AccountBalance';
import IconSettings from '@material-ui/icons/Settings';
import IconLogout from '@material-ui/icons/ExitToApp';
import { FirebaseAuth } from './../../services/Firebase';
import { Button } from '@material-ui/core';
import { StoreContext } from '../../App';

const AppHeaderProfile = () => {
	const classes = useStyles();
	const history = useHistory();
	const { state } = useContext(StoreContext);
	const [anchorEl, setAnchorEl] = React.useState(null);

	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const hanldeLogout = async () => {
		await FirebaseAuth.signOut();
		setAnchorEl(null);
		history.push('/auth/login');
	};

	return (
		<div>
			{!state.currentUser ? (
				<Button
					component={Link}
					to='/auth/login'
					variant='outlined'
					color='secondary'>
					Login
				</Button>
			) : (
				<div className={classes.headerProfile}>
					<IconButton
						edge='start'
						color='inherit'
						aria-label='Search'
						className={classes.profileButton}
						aria-controls='simple-menu'
						aria-haspopup='true'
						onClick={handleClick}>
						<Avatar
							className={classes.profileAvatar}
							alt={state.currentUser.displayName}
							src={state.currentUser.photoURL}
						/>
						<span className={classes.profileName}>{state.currentUser.displayName}</span>
					</IconButton>
					<Menu
						id='simple-menu'
						anchorEl={anchorEl}
						keepMounted
						open={Boolean(anchorEl)}
						onClose={handleClose}
						elevation={1}
						getContentAnchorEl={null}
						anchorOrigin={{
							vertical: 'bottom',
							horizontal: 'right',
						}}
						classes={{
							paper: classes.profileMenu,
						}}>
						<MenuItem onClick={handleClose} component={Link} to='/profile'>
							<ListItemIcon className={classes.profileMenuItemIcon}>
								<IconProfile color='secondary' />
							</ListItemIcon>
							<ListItemText primary='My Profile' />
						</MenuItem>
						<MenuItem onClick={handleClose} component={Link} to='/account'>
							<ListItemIcon className={classes.profileMenuItemIcon}>
								<IconAccount color='secondary' />
							</ListItemIcon>
							<ListItemText primary='My Accounts' />
						</MenuItem>
						<MenuItem onClick={handleClose} component={Link} to='/settings'>
							<ListItemIcon className={classes.profileMenuItemIcon}>
								<IconSettings color='secondary' />
							</ListItemIcon>
							<ListItemText primary='Settings' />
						</MenuItem>
						<Divider />
						<MenuItem onClick={hanldeLogout}>
							<ListItemIcon className={classes.profileMenuItemIcon}>
								<IconLogout color='secondary' />
							</ListItemIcon>
							<ListItemText primary='Logout' />
						</MenuItem>
					</Menu>
				</div>
			)}
		</div>
	);
};

const useStyles = makeStyles((theme) => ({
	headerProfile: {
		display: 'inline-flex',
	},
	profileButton: {
		borderRadius: 30,
		fontSize: '1rem',
		padding: 8,
	},
	profileAvatar: {
		width: 35,
		height: 35,
		marginRight: 10,
		[theme.breakpoints.down('sm')]: {
			marginRight: 0,
		},
	},
	profileName: {
		fontWeight: 500,
		marginRight: 5,
		[theme.breakpoints.down('sm')]: {
			display: 'none',
		},
	},
	profileMenu: {
		marginLeft: '-16px',
	},
	profileMenuItemIcon: {
		color: theme.palette.primary.main,
	},
}));

export default AppHeaderProfile;
