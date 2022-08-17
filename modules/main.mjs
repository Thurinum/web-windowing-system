import * as ContextMenu from "./interface/contextmenu.mjs";
import * as Window from "./interface/window.mjs";
import * as AppMenu from "./interface/appmenu.mjs";
import * as Utils from "./misc/utils.mjs";
import * as Debug from "./misc/debug.mjs";
import * as Settings from "./misc/settings.mjs";

ContextMenu.define(Utils.id("workspace"),
	new ContextMenu.Entries (
		[
			"Alert smt",
			"---",
			"Alert gay",
			"Options"
		],
		[
			"", 
			"",
			"", 
			new ContextMenu.Entries (
				["Rien", "lol"],
				["", ""],
				["", ""],
				["test.png", ""]
			)
		],
		["", "", "", ""],
		["test.png", "", "default.png", ""]
	)
);

let sceneEditor = new Window.Instance ({
	title: "Scene Editor",
	path: "test.html",
	icon: "scene_editor.png",
	position: ["left", "center"],
	isModal: false
});


window.settings = new Settings.Instance("test");
window.settings.save();

AppMenu.addItem(sceneEditor);
