// this comment tells babel to convert jsx to calls to a function called jsx instead of React.createElement
import React, { createContext, useReducer, useEffect } from 'react';
import Home from './components/Home';
import { CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import theme from './theme';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Auth from './components/Auth';
import { initialState, reducer } from './reducers';
import { FirebaseAuth } from './services/Firebase';

export const StoreContext = createContext(null);

/**
 * @function App
 */
const App = () => {
	const [state, dispatch] = useReducer(reducer, initialState);

	useEffect(() => {
		FirebaseAuth.onAuthStateChanged((userAuth) => {
			if (userAuth) {
				localStorage.setItem('auth', userAuth);
			} else {
				localStorage.removeItem('auth');
			}
			dispatch({ type: 'SET_USER', user: userAuth });
		});
		FirebaseAuth.onIdTokenChanged(async (user) => {
			let claims = {};
			if (user) {
				const tokenResult = await user.getIdTokenResult();
				claims = tokenResult.claims;
			}
			dispatch({ type: 'SET_CLAIMS', claims });
		});
	}, []);

	return (
		<StoreContext.Provider value={{ state, dispatch }}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<BrowserRouter>
					<Switch>
						<Route path='/auth' component={Auth} />
						<Route exact path='/' component={Home} />
						<Route path='/community/:id' component={Home} />
						<Route path='/playlists/:id' component={Home} />
						<Route path='/playlists' component={Home} />
					</Switch>
				</BrowserRouter>
			</ThemeProvider>
		</StoreContext.Provider>
	);
};

export default App;
