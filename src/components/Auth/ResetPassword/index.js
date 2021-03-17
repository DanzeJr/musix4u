import React from 'react';
import {
	makeStyles,
	Button,
	TextField,
	Link,
	Grid,
	CircularProgress,
	IconButton,
} from '@material-ui/core';
import { Link as RouterLink, useHistory } from 'react-router-dom';
import { useForm } from 'react-hook-form';

import AuthContent from '../AuthContent';
import AuthHeader from '../AuthHeader';
import { useSnackbar } from 'notistack';
import { useEffect, useState } from 'react';
import { FirebaseAuth } from '../../../services/Firebase';
import { useLoading, Puff } from '@agney/react-loading';
import { green } from '@material-ui/core/colors';
import { CloseRounded } from '@material-ui/icons';

const ResetPassword = () => {
	const classes = useStyles();
	const history = useHistory();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const queryParams = new URLSearchParams(window.location.search);
	const [email, setEmail] = useState('');
	const [code, setCode] = useState(undefined);
	const [error, setError] = useState(undefined);
	const { containerProps, indicatorEl } = useLoading({
		loading: true,
		loaderProps: {
			marginTop: 20,
			marginBottom: 20,
		},
		indicator: <Puff width='30' />,
	});
	const loader = <section {...containerProps}>{indicatorEl}</section>;
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();
	const {
		register,
		handleSubmit,
		errors,
		watch,
		reset,
	} = useForm({
		mode: 'onChange',
		reValidateMode: 'onChange',
		defaultValues: {
			password: '',
			password2: '',
		},
	});

	useEffect(() => {
		const oobCode = queryParams.get('oobCode');
		if (!oobCode) {
			history.push(`/auth/recover`);
		}
		FirebaseAuth.verifyPasswordResetCode(oobCode)
			.then((email) => {
				setEmail(email);
				setCode(oobCode);
			})
			.catch((error) => {
				setError(error.message);
			});
	}, []);

	const showMessage = (message, success, duration) => {
		setIsSubmitting(false);
		const key = enqueueSnackbar(message, {
			anchorOrigin: {
				vertical: 'top',
				horizontal: 'left',
			},
			variant: success ? 'success' : 'error',
			autoHideDuration: duration === undefined ? 3000 : duration,
			action: (key) => (
				<IconButton onClick={() => closeSnackbar(key)}>
					<CloseRounded />
				</IconButton>
			),
		});

		return key;
	};

	const onSubmit = (data) => {
		setIsSubmitting(true);
		FirebaseAuth.confirmPasswordReset(code, data.password)
			.then(() => {
				setIsSubmitting(false);
				reset();
				showMessage(
					'Update password successfully! Login now!',
					true,
					null,
					() => {
						closeSnackbar();
						history.push(`/auth/login?email=${encodeURIComponent(email)}`);
					}
				);
			})
			.catch((error) => {
				showMessage(error.message);
			});
	};

	return (
		<AuthContent>
			<AuthHeader title={'Reset Password'} />
			{error ? (
				<span className={classes.error}>{error}</span>
			) : !code ? (
				loader
			) : (
				<form
					onSubmit={handleSubmit(onSubmit)}
					className={classes.form}
					noValidate>
					<TextField
						variant='outlined'
						margin='normal'
						required
						fullWidth
						name='password'
						label='New Password'
						type='password'
						id='password'
						inputRef={register({
							required: 'Password is required',
							minLength: {
								value: 6,
								message: 'Password must be at least 6 characters',
							},
						})}
					/>
					<TextField
						variant='outlined'
						margin='normal'
						required
						fullWidth
						name='password2'
						label='Confirm New Password'
						type='password'
						id='password2'
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
						Reset Password
					</Button>
				</form>
			)}
			<Grid container>
				<Grid item xs>
					<Link
						color='secondary'
						component={RouterLink}
						to={`/auth/login?email=${encodeURIComponent(email ?? '')}`}
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
	error: {
		marginTop: 20,
		marginBottom: 20,
		color: theme.palette.error.main,
	},
	buttonProgress: {
		color: green[500],
		position: 'absolute',
		top: '50%',
		left: '50%',
		marginTop: -12,
		marginLeft: -12,
	},
}));

export default ResetPassword;
