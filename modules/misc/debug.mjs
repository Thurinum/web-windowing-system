'use strict';

import * as Settings from "./settings.mjs";

let info, warn, error;

// 0: Info + Warning + Error
// 1: Warning + Error
// 2: Error only
function setLevel(level) {
	switch (level) {
	case 0:
		info = function(msg) { console.info(msg) }
		warn = function(msg) { console.warn(msg) }
		error = function(msg) { console.error(msg) }
		break;
	case 1:
		info = function() {};
		warn = function(msg) { console.warn(msg) }
		error = function(msg) { console.error(msg) }
		break;
	case 2:
		info = function() {};
		warn = function() {};
		error = function(msg) { console.error(msg) }
		break;
	}
}

// TODO: Add html popup
function userWarning(title, msg) {
	alert(title + "\n\n" + msg);
}

setLevel(0);

export { setLevel, info, warn, error };
