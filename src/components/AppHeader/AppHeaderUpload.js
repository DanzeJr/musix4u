import React, { useContext } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import {
	CancelRounded,
	CloseRounded,
	CloudUploadRounded,
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
import { StoreContext } from './../../App';

const AppHeaderUpload = () => {
	const classes = useStyles();
	const { state, dispatch } = useContext(StoreContext);
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
			.test('fileSzie', 'File size exceed 25MB', (value) => {
				return !!value && value[0].size <= 26214400;
			})
			.test('type', 'Only support mp3, m4a or flac file type', (value) => {
				const type = value[0].type;
				return (
					!!value &&
					(type === 'audio/mpeg' ||
						type === 'audio/flac' ||
						type === 'audio/x-m4a')
				);
			}),
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
		if (!isNaN(state.currentPlaylistId) && !state.playlists.some(x => x.id == state.currentPlaylistId)) {
			showMessage("Please select Home or one of your playlists to upload song");
			return;
		}
		setOpen(true);
	};

	const handleClose = () => {
		setOpen(false);
	};

	const onSubmit = async (data) => {
		setIsSubmitting(true);
		const formData = new FormData();
		for (const key in data) {
			if (key !== 'song') {
				formData.append(key, data[key]);
			} else {
				formData.append(key, data[key][0]);
			}
		}
		if (!isNaN(state.currentPlaylistId)) {
			formData.append('playlistId', state.currentPlaylistId);
		} else if (state.currentPlaylistId === 'fav') {
			formData.append('isFavorite', true);			
		}
		const token = await state.currentUser.getIdToken(true).catch((error) => {
			showMessage(error.message);
		});
		fetch(`${process.env.REACT_APP_API_URL}api/tracks`, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: formData,
		})
			.then(async (res) => {
				if (res.status === 201) {
					setIsSubmitting(false);
					const song = await res.json();
					dispatch({ type: 'ADD_TO_PLAYLIST', song });
					showMessage(
						`Upload new song ${data.song[0].name} successfully!`,
						true
					);
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
							name='title'
							label='Title'
							fullWidth
							inputRef={register}
							error={!!errors.title}
							helperText={errors.title && errors.title.message}
						/>
						<TextField
							margin='dense'
							id='artists'
							name='artists'
							label='Artists'
							fullWidth
							inputRef={register}
							error={!!errors.artists}
							helperText={errors.artists && errors.artists.message}
						/>
						<TextField
							margin='dense'
							id='album'
							name='album'
							label='Album'
							fullWidth
							inputRef={register}
							error={!!errors.album}
							helperText={errors.album && errors.album.message}
						/>
					</DialogContent>
					<DialogActions>
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
		color: theme.palette.error.light,
		width: 65,
	},
	buttonProgress: {
		color: green[500],
		marginRight: 10,
	},
}));

export default AppHeaderUpload;
