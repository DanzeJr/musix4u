import React, { useEffect, useState } from 'react';
import { makeStyles, Button, TextField, Link, Grid, CircularProgress } from '@material-ui/core';
import { Link as RouterLink } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import AuthContent from '../AuthContent';
import AuthHeader from '../AuthHeader';
import { FirebaseAuth } from '../../../services/Firebase';
import { useSnackbar } from 'notistack';
import { green } from '@material-ui/core/colors';

const Recover = () => {
	const classes = useStyles();
	const params = new URLSearchParams(window.location.search);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const { register, handleSubmit, errors } = useForm({
		mode: 'onChange',
		reValidateMode: 'onChange',
		defaultValues: {
			email: params.email,
		},
	});

	useEffect(() => {
		if (!!params.error) {
			showMessage(params.error);
		}
	}, []);

	const showMessage = (message, success, duration, action) => {
		setIsSubmitting(false);
		enqueueSnackbar(message, {
			variant: success ? 'success' : 'error',
			autoHideDuration: duration ?? 3000,
			onClick: action ?? closeSnackbar(),
		});
	};

	const onSubmit = (data) => {
		setIsSubmitting(true);
		FirebaseAuth.sendPasswordResetEmail(data.email)
			.then(() => {
				setIsSubmitting(false);
				showMessage(
					'An email with reset password link is sent to your email.',
					true
				);
			})
			.catch((error) => {
				showMessage(error.message);
			});
	};

	return (
		<AuthContent>
			<AuthHeader title={'Recover Password'} />
			<form
				onSubmit={handleSubmit(onSubmit)}
				className={classes.form}
				noValidate>
				<TextField
					variant='outlined'
					margin='normal'
					required
					fullWidth
					id='email'
					label='Email Address'
					name='email'
					autoComplete='email'
					autoFocus
					inputRef={register({
						required: 'Email is required',
						pattern: {
							value: /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
							message: 'Not a valid email',
						},
					})}
					error={!!errors.email}
					helperText={errors.email && errors.email.message}
				/>
				<Button
					type='submit'
					fullWidth
					variant='contained'
					color='primary'
					className={classes.submit}
					disabled={isSubmitting}>
					{isSubmitting && (
						<CircularProgress size={24} className={classes.buttonProgress} />
					)}
					Request Password Reset
				</Button>
				<Grid container>
					<Grid item xs>
						<Link
							color='secondary'
							component={RouterLink}
							to='/auth/login'
							variant='body2'>
							Back to Login
						</Link>
					</Grid>
					<Grid item>
						<Link
							color='secondary'
							component={RouterLink}
							to='/auth/signup'
							variant='body2'>
							Create a new account
						</Link>
					</Grid>
				</Grid>
			</form>
		</AuthContent>
	);
};

const useStyles = makeStyles((theme) => ({
	form: {
		width: '100%', // Fix IE 11 issue.
		marginTop: theme.spacing(1),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
	buttonProgress: {
		color: green[500],
		marginRight: 10
	},
}));

export default Recover;
