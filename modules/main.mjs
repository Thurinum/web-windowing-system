import * as ContextMenu from "./interface/contextmenu.mjs";
import * as Window from "./interface/window.mjs";
import * as AppMenu from "./interface/appmenu.mjs";
import * as Utils from "./misc/utils.mjs";
import * as Debug from "./misc/debug.mjs";
import * as Settings from "./misc/settings.mjs";
import * as System from "./system.mjs";

System.setupClock();

// define menus for the whole desktop
ContextMenu.define(Utils.id("workspace"),
	new ContextMenu.Entries (
		[
			"Menu entry",
			"Menu entry with icon",
			"---",
			"More..."
		],
		[
			"", 
			"",
			"", 
			new ContextMenu.Entries (
				["Furries."],
				[""],
				[""],
				["test.png"]
			)
		],
		["", "", "", ""],
		["", "test.png", "", ""]
	)
);

window.settings = new Settings.Instance("test");
window.settings.save();

AppMenu.addItem(new Window.Instance ({
	title: "Welcome",
	path: "dummy.html",
	icon: "scene_editor.png",
	position: ["left", "center"],
	isModal: false
}));
AppMenu.addItem(new Window.Instance ({
	title: "Dummy",
	path: "dummy2.html",
	icon: "scene_editor.png",
	position: ["center", "center"],
	isModal: false
}));