// this comment tells babel to convert jsx to calls to a function called jsx instead of React.createElement
import React from "react";
import { Global, css } from "@emotion/react";
import Home from "./components/Home";
import { CssBaseline } from "@material-ui/core";
import { ThemeProvider } from "@material-ui/styles";
import { darkTheme } from "./theme";

/**
 * @function App
 */
const App = () => (
	<ThemeProvider theme={darkTheme}>
		<CssBaseline />
		<Global styles={GlobalCSS} />
		<Home />
	</ThemeProvider>
);

const GlobalCSS = css`
	* {
		box-sizing: border-box;
		font-family: "Signika", sans-serif;
	}

	html,
	body,
	#root {
		margin: 0;
		height: 100%;
		width: 100%;
	}

	a {
		text-decoration: none;
	}

	ul {
		margin: 0;
		list-style: none;
		padding: 0;
	}
`;

export default App;
