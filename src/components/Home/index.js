import React, {
	useEffect,
	useRef,
	useState,
} from 'react';

import Content from '../Content';
import MediaBar from '../MediaBar';
import AppHeader from '../AppHeader';
import AppSidebar from '../AppSidebar';
import { Drawer, makeStyles, useMediaQuery, useTheme } from '@material-ui/core';
import { Hidden } from '@material-ui/core';
import clsx from 'clsx';
import { useContext } from 'react';
import { StoreContext } from './../../App';

const Home = () => {
	const { state, dispatch } = useContext(StoreContext);

	const audioRef = useRef();

	useEffect(() => {
		if (state.playing) {
			audioRef.current.play();
		} else audioRef.current.pause();
	}, [state.playing, state.currentSong, state.seekingTime]);

	useEffect(() => {
		if (audioRef.current.ended) {
			if (state.repeat === 0) {
				dispatch({ type: 'PAUSE' });
			} else if (state.repeat === 1) {
				dispatch({ type: 'SEEK', position: 0 });
			} else {
				dispatch({ type: 'NEXT' });
			}
		}
	}, [state.currentTime]);

	useEffect(() => {
		if (audioRef.current.readyState == 4) {
			audioRef.current.currentTime = state.seekingTime;
		}
	}, [state.seekingTime]);

	useEffect(() => {
		audioRef.current.volume = state.volume / 100;
	}, [state.volume]);
	const refHeaderContainer = useRef(null);

	const classes = useStyles();
	const theme = useTheme();
	const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
	const isMobile = !isDesktop;

	const [headerHeight, setHeaderHeight] = useState(0);
	const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
	const [isSidebarOpenDesktop, setIsSidebarOpenDesktop] = useState(true);
	const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

	useEffect(() => {
		// code to run on component mount
		setHeaderHeight(refHeaderContainer.current.offsetHeight);
	}, []);

	const contentOffset = (() => {
		if ((isDesktop && !isSidebarOpenDesktop) || isMobile) {
			return 0;
		} else if (isDesktop && isSidebarCollapsed) {
			return theme.sidebar.widthCollapsed;
		} else {
			return theme.sidebar.width;
		}
	})();

	const HeaderComponent = AppHeader;
	const SidebarComponent = AppSidebar;
	const FooterComponent = null;

	const handleSidebarToggleOpenMobile = () => {
		setIsSidebarOpenMobile(!isSidebarOpenMobile);
	};

	const handleSidebarToggle = () => {
		// Open/close on mobile
		if (isMobile) {
			setIsSidebarOpenMobile(!isSidebarOpenMobile);
		}
		// Collapse/uncollapse on desktop
		else {
			setIsSidebarCollapsed(!isSidebarCollapsed);
		}
	};

	return (
		<div>
			<div className={classes.dashboardContainer}>
				<div
					ref={refHeaderContainer}
					className={clsx(classes.headerContainer)}
					style={{
						width: `calc(100% - ${contentOffset}px)`,
					}}>
					{HeaderComponent && (
						<HeaderComponent onToggleClick={handleSidebarToggle} />
					)}
				</div>
				<div
					// ref={refSidebarContainer}
					className={clsx(
						classes.sidebarContainer,
						isMobile && classes.sidebarContainerMobile,
						isDesktop && isSidebarCollapsed && classes.sidebarContainerCollapsed
					)}>
					{/* Mobile sidebar */}
					<Hidden mdUp implementation='css'>
						<Drawer
							variant='temporary'
							open={isSidebarOpenMobile}
							onClose={handleSidebarToggleOpenMobile}
							classes={{
								paper: clsx(classes.drawer), //  classes.drawerMobile
							}}
							ModalProps={{
								keepMounted: true, // Better open performance on mobile.
							}}>
							{SidebarComponent && <SidebarComponent />}
						</Drawer>
					</Hidden>
					{/* Desktop sidebar */}
					<Hidden smDown implementation='css'>
						<Drawer
							classes={{
								paper: clsx(classes.drawer),
							}}
							variant='permanent'>
							{SidebarComponent && (
								<SidebarComponent isCollapsed={isSidebarCollapsed} />
							)}
						</Drawer>
					</Hidden>
				</div>
				<main
					className={classes.mainContainer}
					style={{
						paddingTop: headerHeight,
						paddingBottom: 80 // || headerSize.height,
					}}>
					<div className={classes.contentContainer}>
						<Content />
					</div>
					<div className={classes.footerContainer}>
						{FooterComponent && <FooterComponent />}
					</div>
				</main>
				<div>
					<MediaBar />
					<audio
						ref={audioRef}
						src={state.currentSong.url}
						onLoadedMetadata={() =>
							dispatch({
								type: 'SET_DURATION',
								duration: audioRef.current.duration,
							})
						}
						onTimeUpdate={(e) => {
							dispatch({
								type: 'SET_CURRENT_TIME',
								time: e.target.currentTime,
							});
						}}
					/>
				</div>
			</div>
		</div>
	);
};

const useStyles = makeStyles((theme) => ({
	dashboardContainer: {
		display: 'flex',
		background: '#f5f5f5',
	},
	headerContainer: {
		top: 0,
		left: 'auto',
		right: 0,
		display: 'flex',
		alignItems: 'stretch',
		position: 'absolute',
		zIndex: theme.zIndex.drawer + 1,
		transition: theme.transitions.create(['width', 'margin'], {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen,
		}),
	},
	sidebarContainer: {
		display: 'flex',
		alignItems: 'stretch',
		position: 'relative',
		top: 0,
		bottom: 0,
		flexDirection: 'row',
		width: theme.sidebar.width,
		flexShrink: 0,
		// [theme.breakpoints.up('md')]: {
		//   width: theme.sidebar.width,
		//   flexShrink: 0,
		// },
		transition: theme.transitions.create('width', {
			easing: theme.transitions.easing.sharp,
			duration: theme.transitions.duration.leavingScreen,
		}),
	},
	sidebarContainerMobile: {
		width: 0,
	},
	sidebarContainerCollapsed: {
		width: theme.sidebar.widthCollapsed,
	},
	drawer: {
		height: 'calc(100% - 80px)',
		width: '100%',
		position: 'absolute',
		[theme.breakpoints.down('sm')]: {
			width: theme.sidebar.width,
			flexShrink: 0,
		},
	},
	mainContainer: {
		flexGrow: 1,
		height: '100vh',
		overflow: 'auto',
		flexDirection: 'column',
		display: 'flex',
	},
	contentContainer: {
		display: 'flex',
		position: 'relative',
		backgroundColor: theme.palette.primary.dark,
		flex: 1,
	},
	footerContainer: {
		position: 'relative',
	},
}));

export default Home;
