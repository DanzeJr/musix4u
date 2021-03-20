import React, { useState } from 'react';
import {
	makeStyles,
	Button,
	TextField,
	FormControlLabel,
	Checkbox,
	Link,
	Grid,
	Dialog,
	DialogTitle,
	DialogContentText,
	DialogContent,
	DialogActions,
	CircularProgress,
} from '@material-ui/core';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';

import AuthHeader from '../AuthHeader';
import AuthContent from '../AuthContent';
import {
	FirebasePersistence,
	FirebaseAuth,
	GoogleProvider,
	FacebookProvider,
	getProviderById,
	getEmailCredential,
} from '../../../services/Firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle, faFacebook } from '@fortawesome/free-brands-svg-icons';
import { useSnackbar } from 'notistack';
import { green } from '@material-ui/core/colors';
import { IconButton } from '@material-ui/core';
import { CloseRounded } from '@material-ui/icons';

const Login = () => {
	const classes = useStyles();
	const history = useHistory();
	const params = new URLSearchParams(window.location.search);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const [login, setLogin] = useState({});
	const [open, setOpen] = useState(false);
	const { register, handleSubmit, errors, control, reset } = useForm({
		mode: 'onChange',
		reValidateMode: 'onChange',
		defaultValues: {
			email: params.get('email'),
			password: '',
			remember: false,
		},
	});

	const {
		register: registerPassword,
		handleSubmit: handleSubmitPassword,
		errors: errorsPassword,
		reset: reset2,
	} = useForm({
		mode: 'onChange',
		reValidateMode: 'onChange',
	});

	const googleProvider = GoogleProvider;
	const facebookProvider = FacebookProvider;

	const confirmPassword = () => {
		setOpen(true);
	};

	const handleClose = (cancel) => {
		if (!cancel) {
			// if there is any credential to link to email provider
			if (login.credential) {
				FirebaseAuth.signInWithEmailAndPassword(login.email, login.password)
					.then(function (result) {
						// Step 4a.
						return result.user.linkWithCredential(login.credential);
					})
					.then(function () {
						// Google account successfully linked to the existing Firebase user.
						hanldeSuccessLogin();
					})
					.catch((error) => {
						showMessage(error.message);
					});
				return;
			}
		}
		setLogin({});
		setOpen(false);
	};

	const signInWithProvider = (provider) => {
		setIsSubmitting(true);
		FirebaseAuth.signInWithPopup(provider)
			.then((res) => {
				hanldeSuccessLogin();
			})
			.catch((error) => {
				if (error.code === 'auth/account-exists-with-different-credential') {
					// Step 2.
					// User's email already exists.
					// The pending Google credential.
					const pendingCred = error.credential;
					// The provider account's email address.
					const email = error.email;
					// Get sign-in methods for this email.
					FirebaseAuth.fetchSignInMethodsForEmail(email)
						.then(function (methods) {
							// Step 3.
							// If the user has several sign-in methods,
							// the first method in the list will be the "recommended" method to use.
							if (methods[0] === 'password') {
								// Asks the user their password.
								// In real scenario, you should handle this asynchronously.
								setLogin({ email, credential: pendingCred });
								confirmPassword();
							}
							// All the other cases are external providers.
							// Construct provider object for that provider.
							const provider = getProviderById(methods[0]);
							// At this point, you should let the user know that they already has an account
							// but with a different provider, and let them validate the fact they want to
							// sign in with this provider.
							// Sign in to provider. Note: browsers usually block popup triggered asynchronously,
							// so in real scenario you should ask the user to click on a "continue" button
							// that will trigger the signInWithPopup.
							FirebaseAuth.signInWithPopup(provider)
								.then(function (result) {
									// Remember that the user may have signed in with an account that has a different email
									// address than the first one. This can happen as Firebase doesn't control the provider's
									// sign in flow and the user is free to login using whichever account they own.
									// Step 4b.
									// Link to Google credential.
									// As we have access to the pending credential, we can directly call the link method.
									result.user
										.linkWithCredential(pendingCred)
										.then(function (usercred) {
											// Google account successfully linked to the existing Firebase user.
											hanldeSuccessLogin();
										});
								})
								.catch((error) => {
									showMessage(error.message);
								});
						})
						.catch((error) => {
							showMessage(error.message);
						});
					return;
				}
				showMessage(error.message);
			});
	};

	const hanldeSuccessLogin = () => {
		if (FirebaseAuth.currentUser) {
			FirebaseAuth.currentUser
				.getIdTokenResult()
				.then((idTokenResult) => {
					// if not register on backend server
					if (!!idTokenResult.claims.userId) {
						history.push('/');
					} else {
						showMessage('Creating user...', true, null);
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
								closeSnackbar(snackBarKey);
								if (res.status === 201) {
									FirebaseAuth.currentUser.getIdToken(true);
									history.push('/');
									return;
								}
								const error = await res.json();
								showMessage(
									error.toString().length < 50
										? error.toString()
										: 'Error occurs.'
								);
							})
							.catch((error) => {
								showMessage('Error occurs.');
							});
					}
				})
				.catch((error) => {
					showMessage(error.message);
				});
		}
	};

	let snackBarKey = null;
	const showMessage = (message, success, duration, closable) => {
		if (duration !== null) {
			setIsSubmitting(false);
		}
		snackBarKey = enqueueSnackbar(message, {
			anchorOrigin: {
				vertical: 'top',
				horizontal: 'left',
			},
			variant: success ? 'success' : 'error',
			autoHideDuration: duration === undefined ? 3000 : duration,
			action: (key) =>
				closable && (
					<IconButton onClick={() => closeSnackbar(key)}>
						<CloseRounded />
					</IconButton>
				),
		});
	};

	const onSubmit = (data) => {
		setIsSubmitting(true);
		FirebaseAuth.setPersistence(
			data.remember
				? FirebasePersistence.LOCAL
				: FirebasePersistence.SESSION
		).then(() => {
			FirebaseAuth.signInWithEmailAndPassword(data.email, data.password)
				.then((data) => {
					hanldeSuccessLogin();
				})
				.catch((error) => {
					if (error.code === 'auth/wrong-password') {
						FirebaseAuth.fetchSignInMethodsForEmail(data.email)
							.then(function (methods) {
								// Step 3.
								// If the user has several sign-in methods,
								// the first method in the list will be the "recommended" method to use.
								if (methods && methods.some((x) => x === 'password')) {
									// Asks the user their password.
									// In real scenario, you should handle this asynchronously.
									showMessage(error.message);
									reset({ email: data.email });
									return;
								}

								// All the other cases are external providers.
								// Construct provider object for that provider.
								const provider = getProviderById(methods[0]);
								const credential = getEmailCredential(
									data.email,
									data.password
								);
								FirebaseAuth.signInWithPopup(provider)
									.then(function (result) {
										// Remember that the user may have signed in with an account that has a different email
										// address than the first one. This can happen as Firebase doesn't control the provider's
										// sign in flow and the user is free to login using whichever account they own.
										// Step 4b.
										// Link to Google credential.
										// As we have access to the pending credential, we can directly call the link method.
										result.user
											.linkWithCredential(credential)
											.then(function (usercred) {
												// Google account successfully linked to the existing Firebase user.
												hanldeSuccessLogin();
											})
											.catch((error) => {
												showMessage(error.message);
											});
									})
									.catch((error) => {
										showMessage(error.message);
									});
							})
							.catch((error) => {
								showMessage(error.message);
							});
						return;
					}

					showMessage(error.message);
				});
		});
	};

	const onSubmitPassword = (data) => {
		setLogin({ ...login, password: data.confirmPassword });
		handleClose(false);
		reset2();
	};

	return (
		<AuthContent>
			<AuthHeader title={'Sign In'} />
			<form
				noValidate
				onSubmit={handleSubmit(onSubmit)}
				className={classes.form}>
				<TextField
					variant='outlined'
					margin='normal'
					required
					fullWidth
					id='email'
					label='Email Address'
					name='email'
					type='email'
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
				<TextField
					variant='outlined'
					margin='normal'
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
				<FormControlLabel
					control={
						<Controller
							control={control}
							name='remember'
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
					label='Remember me'
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
					Sign In
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
				<Grid container>
					<Grid item xs>
						<Link
							color='secondary'
							component={RouterLink}
							to='/auth/recover'
							variant='body2'>
							Forgot password?
						</Link>
					</Grid>
					<Grid item>
						<Link
							color='secondary'
							component={RouterLink}
							to='/auth/signup'
							variant='body2'>
							{"Don't have an account? Sign Up"}
						</Link>
					</Grid>
				</Grid>
			</form>
			<Dialog
				open={open}
				onClose={() => handleClose(false)}
				aria-labelledby='form-dialog-title'>
				<DialogTitle id='form-dialog-title'>Enter password</DialogTitle>
				<form onSubmit={handleSubmitPassword(onSubmitPassword)} noValidate>
					<DialogContent>
						<DialogContentText>
							Please enter your password to link this account
						</DialogContentText>
						<TextField
							autoFocus
							margin='dense'
							name='confirmPassword'
							label='Password'
							type='password'
							id='confirmPassword'
							fullWidth
							inputRef={registerPassword({
								required: 'Password is required',
								minLength: {
									value: 6,
									message: 'Password must be at least 6 characters',
								},
							})}
							error={!!errorsPassword.confirmPassword}
							helperText={
								errorsPassword.confirmPassword &&
								errorsPassword.confirmPassword.message
							}
						/>
					</DialogContent>
					<DialogActions>
						<Button onClick={() => handleClose(true)} color='primary'>
							Cancel
						</Button>
						<Button type='submit' color='primary'>
							Link Account
						</Button>
					</DialogActions>
				</form>
			</Dialog>
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
		marginRight: 10,
	},
}));

export default Login;
