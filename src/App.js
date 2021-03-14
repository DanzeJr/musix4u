// this comment tells babel to convert jsx to calls to a function called jsx instead of React.createElement
import React, { createContext, useReducer } from 'react';
import Home from './components/Home';
import { CssBaseline } from '@material-ui/core';
import { ThemeProvider } from '@material-ui/styles';
import theme from './theme';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Auth from './components/Auth';
import { initialState, reducer } from './reducers';

export const StoreContext = createContext(null);

/**
 * @function App
 */
const App = () => {
	const [state, dispatch] = useReducer(reducer, initialState);

	return (
		<StoreContext.Provider value={{ state, dispatch }}>
			<ThemeProvider theme={theme}>
				<CssBaseline />
				<BrowserRouter>
					<Switch>
						{/* <Route exact path="/" render={() => <Redirect to="/sales/dashboard" />} /> */}
						<Route exact path='/' component={Home} />
						<Route path='/auth' component={Auth} />
					</Switch>
				</BrowserRouter>
			</ThemeProvider>
		</StoreContext.Provider>
	);
};

export default App;
