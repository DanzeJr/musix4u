import React, { useContext } from "react";
import { StoreContext } from "../Home";
import { progressToFormattedTime } from "../../utils/time.util";

const ProgressTime = () => {
	const { state, dispatch } = useContext(StoreContext);

	return <React.Fragment>{progressToFormattedTime(state)}</React.Fragment>;
};

export default ProgressTime;
