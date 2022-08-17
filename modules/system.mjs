import * as Utils from "./misc/utils.mjs";

//////////////////////////////////////////////////////////////////
// SYSTEM.JS - Copyleft 2021 Maxime Gagnon. All rights granted. //
// A collection of functions pertaining to the environment.     //
//////////////////////////////////////////////////////////////////

function setupSystemClock() {
	const updateClock = () => Utils.id("taskbarClock").textContent = Utils.getFormattedDate();

	updateClock();
	setInterval(updateClock, 60000);
}

export { setupSystemClock as setupClock };
