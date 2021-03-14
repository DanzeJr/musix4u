import React from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import { Cancel, CancelRounded, CloudUploadRounded } from '@material-ui/icons';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import { useSnackbar } from 'notistack';
import { Controller, useForm } from 'react-hook-form';
import { green } from '@material-ui/core/colors';
import {
	Checkbox,
	CircularProgress,
	FormControlLabel,
	Grid,
} from '@material-ui/core';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';

const AppHeaderUpload = () => {
	const classes = useStyles();
	const [open, setOpen] = React.useState(false);
	const [isSubmitting, setIsSubmitting] = React.useState(false);
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const schema = yup.object().shape({
		song: yup
			.mixed()
			.required('Please choose a song')
			.test('single', 'Please select only one file', (value) => {
				return !!value && value.length === 1;
			})
			.test('fileSzie', 'File size exceed 10MB', (value) => {
				return !!value && value[0].size <= 10 * 1280 * 1280;
			})
			.test('type', 'Only support mp3, m4a or flac file type', (value) => {
				const type = value[0].type;
				return (
					!!value &&
					(type === 'audio/mp3' ||
						type === 'audio/flac' ||
						type === 'audio/x-m4a')
				);
			}),
	});
	const { register, handleSubmit, errors, control, reset } = useForm({
		mode: 'onChange',
		reValidateMode: 'onChange',
		resolver: yupResolver(schema),
	});

	const showMessage = (message, success, duration, action) => {
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
			autoHideDuration: duration ?? 3000,
			onClick: action ?? closeSnackbar(),
		});
	};

	const handleClickOpen = () => {
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const onSubmit = (data, e) => {
		setIsSubmitting(true);
		const formData = new FormData(e.target);
		fetch(`${process.env.REACT_APP_API_URL}api/tracks`, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
			},
			body: formData,
		})
			.then(async (res) => {
				if (res.status === 201) {
					setIsSubmitting(false);
					showMessage(`Upload new song ${data.song[0].name} successfully!`);
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

	return (
		<div className={classes.headerUpload}>
			<IconButton
				edge='start'
				color='inherit'
				aria-label='Upload'
				className={classes.button}
				aria-controls='HeaderUpload'
				title='Upload song'
				size='medium'
				onClick={handleClickOpen}>
				<CloudUploadRounded />
			</IconButton>
			<Dialog
				open={open}
				onClose={handleClose}
				aria-labelledby='form-dialog-title'
				disableBackdropClick
				disableEscapeKeyDown>
				<div className={classes.titleContainer}>
					<h2 style={{ marginLeft: 20 }}>Upload song</h2>
					<IconButton
						edge='start'
						color='inherit'
						aria-label='Cancel'
						className={classes.cancel}
						title='Cancel Upload'
						onClick={handleClose}>
						<CancelRounded fontSize='large' />
					</IconButton>
				</div>
				<form onSubmit={handleSubmit(onSubmit)} noValidate>
					<DialogContent>
						<TextField
							id='song'
							name='song'
							variant='outlined'
							fullWidth
							type='file'
							inputRef={register}
							error={!!errors.song}
							helperText={errors.song && errors.song.message}
						/>
						<TextField
							margin='dense'
							id='title'
							label='Title'
							fullWidth
							inputRef={register}
							error={!!errors.title}
							helperText={errors.title && errors.title.message}
						/>
						<TextField
							margin='dense'
							id='artists'
							label='Artists'
							fullWidth
							inputRef={register}
							error={!!errors.artists}
							helperText={errors.artists && errors.artists.message}
						/>
						<TextField
							margin='dense'
							id='album'
							label='Album'
							fullWidth
							inputRef={register}
							error={!!errors.album}
							helperText={errors.album && errors.album.message}
						/>
						<TextField
							margin='dense'
							id='year'
							label='Year'
							fullWidth
							inputRef={register}
							error={!!errors.year}
							helperText={errors.year && errors.year.message}
						/>
					</DialogContent>
					<DialogActions>
						<div>
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
								label='Public song'
							/>
						</div>
						<Button
							type='submit'
							variant='contained'
							className={classes.facebook}
							startIcon={
								isSubmitting ? (
									<CircularProgress
										size={24}
										className={classes.buttonProgress}
									/>
								) : (
									<CloudUploadRounded />
								)
							}
							disabled={isSubmitting}>
							Upload
						</Button>
					</DialogActions>
				</form>
			</Dialog>
		</div>
	);
};

// const HeaderNotificationsContent = () => {
//   const classes = useStyles()

//   return <List className={classes.notifications}></List>
// }

const useStyles = makeStyles((theme) => ({
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
		color: theme.palette.error.main,
		width: 65,
	},
	buttonProgress: {
		color: green[500],
		marginRight: 10,
	},
}));

export default AppHeaderUpload;
