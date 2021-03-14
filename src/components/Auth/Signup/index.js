import React, { useState } from 'react';
import { makeStyles, Grid, Link, TextField, Button, CircularProgress } from '@material-ui/core';
import { Link as RouterLink, useParams, useHistory } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { useForm } from 'react-hook-form';

import AuthContent from '../AuthContent';
import AuthHeader from '../AuthHeader';
import {
	FacebookProvider,
	FirebaseAuth,
	GoogleProvider,
} from './../../../services/Firebase';
import { useSnackbar } from 'notistack';
import { green } from '@material-ui/core/colors';

const SignUp = () => {
	const classes = useStyles();
	const history = useHistory();
	const params = new URLSearchParams(window.location.search);	
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const { register, handleSubmit, errors, watch } = useForm({
		mode: 'onChange',
		reValidateMode: 'onChange',
		defaultValues: {
			firstName: '',
			lastName: '',
			email: params.email,
			password: '',
			password2: '',
		},
	});

	const googleProvider = GoogleProvider;
	const facebookProvider = FacebookProvider;

	const signInWithProvider = (provider) => {
		FirebaseAuth.signInWithPopup(provider)
			.then((res) => {
				FirebaseAuth.currentUser
					.getIdTokenResult()
					.then((idTokenResult) => {
						// if not register on backend server
						if (!!idTokenResult.claims.userId) {
							FirebaseAuth.signOut();
							showMessage(
								'Account already exists. Try to login instead.',
								false,
								3000,
								() => {
									history.push(`/auth/login`);
									closeSnackbar();
								}
							);
							return;
						} else {
							fetch(`${process.env.REACT_APP_API_URL}api/users`, {
								method: 'POST',
								headers: {
									Accept: 'application/json',
									'Content-Type': 'application/json;charset=UTF-8',
									Authorization: `Bearer ${idTokenResult.token}`,
								},
								body: JSON.stringify({}),
							})
								.then(async (res) => {
									if (res.status === 201) {
										FirebaseAuth.signOut();
										showMessage(
											'Registration successfully. Try to login now!',
											true,
											() => history.push('/auth/login')
										);
										return;
									}

									const error = await res.json();
									showMessage(error);
								})
								.catch((error) => {
									showMessage(
										error.toString().length < 50
											? error.toString()
											: 'Error occurs'
									);
								});
						}
					})
					.catch((error) => {
						showMessage(error.message);
					});
			})
			.catch((error) => {
				if (error.code === 'auth/account-exists-with-different-credential') {
					showMessage(
						'Account already exists. Please try to login by another method.'
					);
					return;
				}
				showMessage(error.message);
			});
	};

	const showMessage = (message, success, duration, action) => {
		setIsSubmitting(false);		
		if (!success && typeof message === 'object') {
			message = 'Error occurs';
		}
		enqueueSnackbar(message, {
			variant: success ? 'success' : 'error',
			autoHideDuration: duration ?? 3000,
			onClick: action ?? closeSnackbar(),
		});
	};

	const onSubmit = (data) => {
		setIsSubmitting(true);
		fetch(`${process.env.REACT_APP_API_URL}api/users`, {
			method: 'POST',
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json;charset=UTF-8',
			},
			body: JSON.stringify({
				name: `${data.firstName} ${data.lastName}`,
				email: data.email,
				password: data.password,
			}),
		})
			.then(async (res) => {
				if (res.status === 201) {
					FirebaseAuth.signOut();
					showMessage(
						'Registration successfully. Try to login now!',
						true,
						() => history.push(`/auth/login?email=${encodeURIComponent(data.email)}`)
					);
					return;
				}
				const error = await res.json();
				showMessage(error);
			})
			.catch((error) => {
				showMessage(
					error
				);
			});
	};

	return (
		<AuthContent>
			<AuthHeader title={'Sign Up'} />
			<form
				onSubmit={handleSubmit(onSubmit)}
				className={classes.form}
				noValidate>
				<Grid container spacing={2}>
					<Grid item xs={12} sm={6}>
						<TextField
							autoComplete='fname'
							name='firstName'
							variant='outlined'
							required
							fullWidth
							id='firstName'
							label='First Name'
							autoFocus
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
					</Grid>
					<Grid item xs={12} sm={6}>
						<TextField
							variant='outlined'
							required
							fullWidth
							id='lastName'
							label='Last Name'
							name='lastName'
							autoComplete='lname'
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
					</Grid>
					<Grid item xs={12}>
						<TextField
							variant='outlined'
							required
							fullWidth
							id='email'
							label='Email Address'
							name='email'
							autoComplete='email'
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
					</Grid>
					<Grid item xs={12}>
						<TextField
							variant='outlined'
							required
							fullWidth
							name='password'
							label='Password'
							type='password'
							id='password'
							autoComplete='current-password'
							inputRef={register({
								required: 'Password is required',
								minLength: {
									value: 6,
									message: 'Password must be at least 6 characters',
								},
							})}
							error={!!errors.password}
							helperText={errors.password && errors.password.message}
						/>
					</Grid>
					<Grid item xs={12}>
						<TextField
							variant='outlined'
							required
							fullWidth
							name='password2'
							label='Confirm Password'
							type='password'
							id='password2'
							autoComplete='current-password'
							inputRef={register({
								required: 'Confirm Password is required',
								minLength: {
									value: 6,
									message: 'Password must be at least 6 characters',
								},
								validate: (value) =>
									value === watch('password') || 'Passwords mismatch',
							})}
							error={!!errors.password2}
							helperText={errors.password2 && errors.password2.message}
						/>
					</Grid>
				</Grid>
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
					Sign Up
				</Button>
				<div className={classes.providers}>
					<Button
						onClick={() => signInWithProvider(googleProvider)}
						variant='outlined'
						className={classes.google}
						startIcon={<FontAwesomeIcon size='2x' icon={faGoogle} />}>
						Google
					</Button>
					<Button
						onClick={() => signInWithProvider(facebookProvider)}
						variant='outlined'
						className={classes.facebook}
						startIcon={<FontAwesomeIcon size='2x' icon={faFacebook} />}>
						Facebook
					</Button>
				</div>
				<Grid container justify='flex-end'>
					<Grid item>
						<Link
							color='secondary'
							component={RouterLink}
							to='/auth/login'
							variant='body2'>
							Already have an account? Sign in
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
		marginTop: theme.spacing(3),
	},
	submit: {
		margin: theme.spacing(3, 0, 2),
	},
	providers: {
		display: 'flex',
		'justify-content': 'center',
		width: '100%',
	},
	google: {
		borderRadius: 20,
		color: '#DB4437',
		margin: 40,
		marginTop: 10,
		verticalAlign: 'center',
	},
	facebook: {
		borderRadius: 20,
		color: '#4267B2',
		margin: 40,
		marginTop: 10,
		verticalAlign: 'center',
	},
	buttonProgress: {
		color: green[500],
		marginRight: 10
	},
}));

export default SignUp;
