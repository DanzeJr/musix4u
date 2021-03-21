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
import IconProfile from '@material-ui/icons/AccountBox';
import IconAccount from '@material-ui/icons/AccountBalance';
import IconSettings from '@material-ui/icons/Settings';
import IconLogout from '@material-ui/icons/ExitToApp';
import { FirebaseAuth } from './../../services/Firebase';
import { Button, Grid } from '@material-ui/core';
import { StoreContext } from '../../App';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import { useSnackbar } from 'notistack';
import { useForm, Controller } from 'react-hook-form';
import { green } from '@material-ui/core/colors';
import {
	Checkbox,
	CircularProgress,
	FormControlLabel,
} from '@material-ui/core';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
	CancelRounded,
	CloseRounded,
	CloudUploadRounded,
	Edit,
} from '@material-ui/icons';

const AppHeaderProfile = () => {
	const classes = useStyles();
	const history = useHistory();
	const { state, dispatch } = useContext(StoreContext);
	const [anchorEl, setAnchorEl] = React.useState(null);

	const [open, setOpen] = React.useState(false);
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const { register, handleSubmit, errors, reset } = useForm({
		mode: 'onChange',
		reValidateMode: 'onChange'
	});

	const showMessage = (message, success, duration) => {
		setIsSubmitting(false);
		if (!success && typeof message === 'object') {
			message = 'Error occurs';
		}
		enqueueSnackbar(message, {
			anchorOrigin: {
				vertical: 'top',
				horizontal: 'center',
			},
			variant: success ? 'success' : 'error',
			autoHideDuration: duration === undefined ? 3000 : duration,
			action: (key) => (
				<IconButton onClick={() => closeSnackbar(key)}>
					<CloseRounded />
				</IconButton>
			),
		});
	};

	const handleClickOpen = () => {
		setOpen(true);
		handleClose();
	};

	const handleCloseDialog = () => {
		setOpen(false);
	};

	const onSubmit = async (data) => {
		setIsSubmitting(true);
		const token = await state.currentUser.getIdToken(true).catch((error) => {
			showMessage(error.message);
		});
		fetch(`${process.env.REACT_APP_API_URL}api/users/${state.claims.userId}`, {
			method: 'PUT',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json;charset=UTF-8',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ name: `${data.firstName} ${data.lastName}` }),
		})
			.then(async (res) => {
				if (res.status === 200) {
					setIsSubmitting(false);
					const user = await res.json();
					dispatch({ type: 'UPDATE_USER', user });
					showMessage(`Update profile successfully!`, true);
					setOpen(false);
					reset();
					return;
				}
				const error = await res.json();
				showMessage(error);
			})
			.catch((error) => {
				showMessage(error.message);
			});
	};

	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const hanldeLogout = async () => {
		await FirebaseAuth.signOut();
		dispatch({ type: 'RESET' });
		setAnchorEl(null);
		history.push('/auth/login');
	};

	return (
		<div>
			{!state.currentUser?.uid ? (
				<Button
					component={Link}
					to='/auth/login'
					variant='outlined'
					onClick={() => dispatch({ type: 'RESET' })}
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
							alt={state.displayName}
							src={state.currentUser.photoURL ?? '/avatar.jpg'}
						/>
						<span className={classes.profileName}>
							{state.displayName}
						</span>
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
						<MenuItem onClick={handleClickOpen}>
							<ListItemIcon className={classes.profileMenuItemIcon}>
								<IconProfile />
							</ListItemIcon>
							<ListItemText primary='Edit Profile' />
						</MenuItem>
						<Divider />
						<MenuItem onClick={hanldeLogout}>
							<ListItemIcon className={classes.profileMenuItemIcon}>
								<IconLogout />
							</ListItemIcon>
							<ListItemText primary='Logout' />
						</MenuItem>
					</Menu>
					<Dialog
						open={open}
						onClose={handleCloseDialog}
						aria-labelledby='form-dialog-title'
						disableBackdropClick
						disableEscapeKeyDown>
						<div className={classes.titleContainer}>
							<h2 style={{ marginLeft: 20 }}>Edit Profile</h2>
							<IconButton
								edge='start'
								color='inherit'
								aria-label='Cancel'
								className={classes.cancel}
								title='Cancel Upload'
								onClick={handleCloseDialog}>
								<CancelRounded fontSize='large' />
							</IconButton>
						</div>
						<form onSubmit={handleSubmit(onSubmit)} noValidate>
							<DialogContent>
								<TextField
									name='firstName'
									variant='outlined'
									margin='dense'
									required
									fullWidth
									id='firstName'
									label='First Name'
									autoFocus
									defaultValue={state.displayName?.split(' ')[0]}
									inputRef={register({
										required: 'First Name is required',
										minLength: {
											value: 2,
											message: 'At least 2 characters',
										},
									})}
									error={!!errors.firstName}
									helperText={errors.firstName && errors.firstName.message}
								/>
								<TextField
									variant='outlined'
									margin='dense'
									required
									fullWidth
									style={{marginTop: 15}}
									id='lastName'
									label='Last Name'
									name='lastName'
									defaultValue={state.displayName.toString().replace(state.displayName.split(' ')[0] + ' ', '')}
									inputRef={register({
										required: 'Last Name is required',
										minLength: {
											value: 2,
											message: 'At least 2 characters',
										},
									})}
									error={!!errors.lastName}
									helperText={errors.lastName && errors.lastName.message}
								/>
							</DialogContent>
							<DialogActions>
								<Button
									type='submit'
									fullWidth
									style={{marginTop: 20}}
									variant='contained'
									disabled={isSubmitting}>
									{isSubmitting && (
										<CircularProgress
											size={24}
											className={classes.buttonProgress}
										/>
									)}
									Update Profile
								</Button>
							</DialogActions>
						</form>
					</Dialog>
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
		color: theme.palette.secondary.main,
	},
	headerUpload: {
		marginRight: 23,
		// position: 'relative',
		// position: 'absolute'
	},
	titleContainer: {
		display: 'flex',
		'justify-content': 'space-between',
		width: '100%',
	},
	cancel: {
		color: theme.palette.error.light,
		width: 65,
	},
	buttonProgress: {
		color: green[500],
		marginRight: 10,
	},
}));

export default AppHeaderProfile;
