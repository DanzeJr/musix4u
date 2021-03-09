// this comment tells babel to convert jsx to calls to a function called jsx instead of React.createElement
/** @jsxImportSource @emotion/react */
import React, { createContext, useEffect, useReducer, useRef } from "react";
import { css } from "@emotion/react";
import { initialState, reducer } from "../../reducers";

import Topbar from "../TopBar";
import Sidebar from "../SideBar";
import Content from "../Content";
import PlayBar from "../PlayBar";
import MediaBar from "../MediaBar";

export const StoreContext = createContext(null);

const Home = () => {
	const [state, dispatch] = useReducer(reducer, initialState);

	const audioRef = useRef();

	useEffect(() => {
		if (state.playing) {
			audioRef.current.play();
		} else audioRef.current.pause();
	}, [state.playing, state.currentSong]);

	const getTracks = async () => {
		let response = await fetch(`${process.env.REACT_APP_ApiUrl}api/tracks`);
		let data = await response.json();

		dispatch({ type: "GET", media: data });
	};

	useEffect(() => {
		getTracks();
	}, []);

	useEffect(() => {
		if (audioRef.current.readyState == 4) {
			audioRef.current.currentTime = state.seekingTime;
		}
	}, [state.seekingTime])

	useEffect(() => {
		audioRef.current.volume = state.volume;
	}, [state.volume]);

	return (
		<StoreContext.Provider value={{ state, dispatch }}>
			<div css={CSS}>
				<Topbar />
				<Sidebar />
				<Content />
				<MediaBar />
				<MediaBar />

				<audio
					ref={audioRef}
					src={state.currentSong.url}
					onLoadedMetadata={() =>
						dispatch({
							type: "SET_DURATION",
							duration: audioRef.current.duration,
						})
					}
					onTimeUpdate={(e) => {
						dispatch({ type: "SET_CURRENT_TIME", time: e.target.currentTime })
					}}
				/>
			</div>
		</StoreContext.Provider>
	);
};

const CSS = css`
	height: 100%;
	width: 100%;
	display: flex;
	position: relative;
	color: white;
`;

export default Home;
