import React, { useContext, useEffect, useState } from 'react';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';

import NavList from './NavList';
import {
	LibraryMusic,
	People,
	PlaylistPlay,
	CloseRounded,
} from '@material-ui/icons';
import IconButton from '@material-ui/core/IconButton';
import { StoreContext } from '../../../App';
import { useSnackbar } from 'notistack';
import queryString from 'query-string';

const SidebarNav = (props) => {
	const { isCollapsed } = props;
	const { state, dispatch } = useContext(StoreContext);
	const [items, setItems] = useState([
		{
			name: 'Home',
			link: '/',
			Icon: LibraryMusic,
		},
		{
			name: 'Community',
			Icon: People,
		},
	]);
	const classes = useStyles();
	const { enqueueSnackbar, closeSnackbar } = useSnackbar();

	const showMessage = (message, success, duration) => {
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

	const getPlaylists = async (filter, isShared) => {
		let headers = {
			Accept: 'application/json',
		};
		if (state.currentUser?.uid) {
			const token = await state.currentUser.getIdToken(true).catch((error) => {
				showMessage(error.message);
			});
			headers['Authorization'] = `Bearer ${token}`;
		}
		fetch(
			`${process.env.REACT_APP_API_URL}api/playlists?${queryString.stringify(
				filter
			)}`,
			{
				method: 'GET',
				headers,
			}
		)
			.then(async (res) => {
				if (res.status === 200) {
					const playlists = await res.json();
					if (isShared) {
						dispatch({ type: 'SET_SHARED_PLAYLISTS', playlists });
					} else {
						dispatch({ type: 'SET_PLAYLISTS', playlists });
					}
					return;
				}
				const error = await res.json();
				showMessage(error);
			})
			.catch((error) => {
				showMessage(error.message);
			});
	};

	useEffect(() => {
		if (!!state.currentUser?.uid) {
			getPlaylists();
		}
		getPlaylists(undefined, true);
	}, [state.currentUser]);

	useEffect(() => {
		const playlists = state.playlists.map((x) => ({
			name: x.name,
			link: `/playlists/${x.id}`,
		}));
		if (!!state.currentUser?.uid) {
			items[2] = {
				name: 'My Playlist',
				Icon: PlaylistPlay,
			};

			items[2].items = [
				{
					name: 'Favorite',
					link: '/playlists/fav',
				},
				...playlists,
			];
		}
		setItems([...items]);
	}, [state.playlists]);

	useEffect(() => {
		const playlists = state.sharedPlaylists.map((x) => ({
			name: x.name,
			link: `/playlists/${x.id}`,
		}));
		items[1].items = [...playlists];
		setItems([...items]);
	}, [state.sharedPlaylists]);

	return (
		<div>
			<List className={classes.navList} disablePadding>
				<NavList isCollapsed={isCollapsed} items={items} />
			</List>
		</div>
	);
};

const useStyles = makeStyles((theme) =>
	createStyles({
		navList: {
			width: theme.sidebar.width,
			fontSize: '1.1em',
			fontWeight: 400,
			lineHeight: 1.5,
			letterSpacing: '0.00938em',
		},
		navListHeader: {
			textAlign: 'center',
			color: 'rgba(255,255,255,0.5)',
		},
		iconFeatures: {
			color: '#95de3c',
		},
		iconDocs: {
			color: '#f8cda9',
		},
		iconSupporters: {
			color: '#e3b546',
		},
		iconDiscuss: {
			color: '#ccc',
		},
	})
);

export default SidebarNav;
