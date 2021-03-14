import React, { useContext } from "react";
import { StoreContext } from '../../App';
import { progressToFormattedTime } from "../../utils/time.util";

const ProgressTime = () => {
	const { state } = useContext(StoreContext);

	return <React.Fragment>{progressToFormattedTime(state)}</React.Fragment>;
};

export default ProgressTime;
