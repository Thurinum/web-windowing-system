'use strict';

/////////////////////////////////////////////////////////////////
// UTILS.JS - Copyleft 2021 Maxime Gagnon. All rights granted. //
// A collection of misceallenous utilities.                    //
/////////////////////////////////////////////////////////////////

function id(query) {
	return document.getElementById(query); // :3
}

function getFormattedDate() {
	const date = new Date();
	return `${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`;
}

export { id, getFormattedDate };
