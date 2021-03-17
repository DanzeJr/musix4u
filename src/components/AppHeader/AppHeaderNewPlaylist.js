import React, { useContext } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import {
	Add,
	CancelRounded,
	CloseRounded,
	PlaylistAdd,
} from '@material-ui/icons';
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
import { StoreContext } from '../../App';

const AppHeaderNewPlaylist = () => {
	const classes = useStyles();
	const { state, dispatch } = useContext(StoreContext);
	const [open, setOpen] = React.useState(false);
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const schema = yup.object().shape({
		name: yup
			.mixed()
			.required('Please enter playlist name')
			.test(
				'maxLength',
				'Must be less than or equal to 50 characters',
				(value) => {
					return value && value.toString().length <= 50;
				}
			),
	});
	const { register, handleSubmit, errors, reset, control } = useForm({
		mode: 'onChange',
		reValidateMode: 'onChange',
		resolver: yupResolver(schema),
		defaultValues: {
			isPublic: true,
		},
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
	};

	const handleClose = () => {
		setOpen(false);
	};

	const onSubmit = async (data) => {
		setIsSubmitting(true);
		const token = await state.currentUser.getIdToken(true).catch((error) => {
			showMessage(error.message);
		});
		fetch(`${process.env.REACT_APP_API_URL}api/playlists`, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json;charset=UTF-8',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify(data),
		})
			.then(async (res) => {
				if (res.status === 201) {
					setIsSubmitting(false);
					const playlist = await res.json();
					dispatch({ type: 'ADD_PLAYLIST', playlist });
					showMessage(`Add new playlist ${data.name} successfully!`, true);
					reset();
					handleClose();
					return;
				}
				const error = await res.json();
				showMessage(error);
			})
			.catch((error) => {
				showMessage(error.message);
			});
	};

	return (
		<div className={classes.root}>
			<Button
				edge='start'
				color='inherit'
				variant='outlined'
				aria-label='New Playlist'
				className={classes.button}
				aria-controls='NewPlaylist'
				title='New playlist'
				size='medium'
				startIcon={<Add />}
				onClick={handleClickOpen}>
				<span className={classes.buttonText}>New Playlist</span>
			</Button>
			<Dialog
				open={open}
				onClose={handleClose}
				aria-labelledby='form-dialog-title'
				disableBackdropClick
				disableEscapeKeyDown>
				<div className={classes.titleContainer}>
					<h2 style={{ marginLeft: 20 }}>New Playlist</h2>
					<IconButton
						edge='start'
						color='inherit'
						aria-label='Cancel'
						className={classes.cancel}
						title='Cancel'
						onClick={handleClose}>
						<CancelRounded fontSize='large' />
					</IconButton>
				</div>
				<form onSubmit={handleSubmit(onSubmit)} noValidate>
					<DialogContent>
						<TextField
							margin='dense'
							id='name'
							name='name'
							label='Name'
							variant='outlined'
							fullWidth
							inputRef={register}
							error={!!errors.name}
							helperText={errors.name && errors.name.message}
						/>
						<FormControlLabel
							control={
								<Controller
									control={control}
									name='isPublic'
									render={(
										{ onChange, onBlur, value, name, ref },
										{ invalid, isTouched, isDirty }
									) => (
										<Checkbox
											onBlur={onBlur}
											onChange={(e) => onChange(e.target.checked)}
											checked={value}
											inputRef={ref}
										/>
									)}
								/>
							}
							label='Public Playlist'
						/>
					</DialogContent>
					<DialogActions>
						<Button
							type='submit'
							variant='contained'
							startIcon={
								isSubmitting ? (
									<CircularProgress
										size={24}
										className={classes.buttonProgress}
									/>
								) : (
									<PlaylistAdd />
								)
							}
							disabled={isSubmitting}>
							Add
						</Button>
					</DialogActions>
				</form>
			</Dialog>
		</div>
	);
};

const useStyles = makeStyles((theme) => ({
	root: {
		marginRight: 23,
		minWidth: '40%',
	},
	button: {
		margin: theme.spacing(1),
		[theme.breakpoints.down('sm')]: {
			minWidth: 32,
			paddingLeft: 8,
			paddingRight: 8,
			'& .MuiButton-startIcon': {
				margin: 0,
			},
		},
	},
	buttonText: {
		[theme.breakpoints.down('sm')]: {
			display: 'none',
		},
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

export default AppHeaderNewPlaylist;
