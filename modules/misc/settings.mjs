'use strict';

import * as Debug from "./debug.mjs";

/////////////////////////////////////////////////////////////////////
// SETTINGS.MJS - Copyleft 2021 Maxime Gagnon. All rights granted. //
// Manipulate settings stored in localStorage.                     //
/////////////////////////////////////////////////////////////////////

// Manipulate localStorage
let storage = window.localStorage;

function getKey(key) {
	return storage.getItem(key);
}
function setKey(key, val) {
	storage.setItem(key, val);
}

// Settings instance for one location in the storage
// Allows multiple groups of settings
class Instance {
	name = "";
	obj = {};
	
	constructor(name) {
		this.name = name;
		
		// Load settings if they already exist
		if (getKey("settings." + name) != null) {
			this.load();
		}
	}
	
	// Get or set settings
	get(key) {
		return this.obj[key];
	}
	set(key, val) {
		this.obj[key] = val;
	}
	
	// Convert object as JSON and save to localStorage
	save() {
		let json = JSON.stringify(this.obj);
		setKey("settings." + this.name, json);
	}
	
	load() {
		let json = getKey("settings." + this.name);
		
		try {
			this.obj = JSON.parse(json);
		} catch(err) {
			Debug.error(`Could not load settings from ${this.name} because "${err}".`);
		}
	}
}

export { Instance };
