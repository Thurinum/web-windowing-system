import * as Utils from "../misc/utils.mjs";
import * as Debug from "../misc/debug.mjs";
import * as Window from "./window.mjs";

const menu = Utils.id("appmenu");
menu.style.display = "none";
menu.style.opacity = "0";
menu.style.bottom = "-7vh";

function toggle() {
	if (menu.style.display === "none") {
		menu.style.display = "grid";
		setTimeout(function() {
			menu.style.opacity = "1";
			menu.style.bottom = "3vh";
		}, 50);
	} else {
		menu.style.opacity = "0";
		menu.style.bottom = "-7vh";
		setTimeout(function() {
			menu.style.display = "none";
		}, 200);
	}
}

// Creates new menu item from a window object
function addItem(win) {
	if (Utils.id("appmenu_thumbnailOverlay" + win.id)) {
		Debug.warn(`Cannot create duplicate shortcut for window ${win.path} (${win.id}).`);
		return;
	}
	
	let item = document.createElement("div");
	item.setAttribute("class", "appmenu_thumbnail");
	item.innerHTML = `<div class="appmenu_thumbnailOverlay" id="appmenu_thumbnailOverlay${win.id}"></div><div class="appmenu_thumbnailIcon" style="background-image: url('../assets/icons/${win.icon}')"></div><div class="appmenu_thumbnailText">${win.title}</div>`;
	menu.appendChild(item);
	
	item.childNodes[0].addEventListener("click", function(e) {
		let index = e.target.id.slice(-1);
		let win = Utils.id(`window${index}`);
		Window.setActive(win);
		toggle();
	});
}

Utils.id("appmenuBtn").addEventListener("click", toggle);

export { addItem }
