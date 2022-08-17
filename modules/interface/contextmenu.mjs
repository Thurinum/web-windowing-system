import * as Debug from "../misc/debug.mjs";

class Entries {
	constructor(labels, actions, args, icons) {
		// Check if same amount of inputs provided
		// Some args can be empty
		if (labels.length != actions.length) {
			Debug.warn("Could not create context menu because it does not have the same amount of labels than actions.");
			return;
		}
		
		this.labels = labels;
		this.actions = actions;
		this.args = args;
		this.icons = icons;
		this.length = labels.length;
	}
}

function define(target, data) {
	target.addEventListener("contextmenu", function(e) {
		event.preventDefault();
		clearAll();
		let menu = create(data);
		show(menu, e);
	});
}

function create(data) {
	let contextMenu = document.createElement("div");
	contextMenu.setAttribute("class", "contextMenu");
	
	// Temp counters would lose their scope so we need global
	window.currentMenuData = data;
	contextMenu.innerHTML = "";
	
	// Generate menu entries
	for (let e = 0; e < data.length; e++) {
		let entry;
		
		// Handle entries and separators
		if (data.labels[e] === "---") {
			entry = document.createElement("hr");
		} else {
			entry = document.createElement("button");
			entry.setAttribute("class", "contextMenu_button");
			entry.setAttribute("id", `contextMenu_button${e}`);
			
			let rootPath = "/assets/icons/";
			let icon = document.createElement("img");
			icon.setAttribute("class", "contextMenu_icon");
			
			if (!data.icons[e]) {
				icon.src = rootPath + "empty.png";
			} else {
				icon.src = rootPath + data.icons[e];
			}
			
			entry.appendChild(icon);
			entry.innerHTML += data.labels[e];
			
			if (data.actions[e] instanceof Function) {
				entry.addEventListener("click", function(e) {
					let index = e.target.id.slice(-1);
					window.currentMenuData.actions[index](window.currentMenuData.args[index]);
				});					
			} else if (data.actions[e] instanceof Entries) {
				entry.addEventListener("click", function(e) {
					let index = e.target.id.slice(-1);
					let menu = create(window.currentMenuData.actions[index]);
					show(menu, e);
					setTimeout(function() {
						menu.style.left = e.target.parentNode.style.left + e.target.parentNode.offsetWidth + "px";
					}, 100);
				});
			}
		}
		
		contextMenu.append(entry);
		
		// Prevent default ctxmenu on entry
		entry.addEventListener("contextmenu", function(e) {
			e.preventDefault();
		});
	}
	document.body.append(contextMenu);
	
	// Prevent default ctxmenu to spawn on the context menu
	contextMenu.addEventListener("contextmenu", function(e) {
		e.preventDefault();
	});
	
	return contextMenu;
}

function show(contextMenu, event) {	
	// Show the menu at cursor position
	contextMenu.style.display = "block";
	contextMenu.style.position = "absolute";
	contextMenu.style.top = event.pageY - 5 + "px";
	contextMenu.style.left = event.pageX - 5 + "px";
		
	// Fade in
	setTimeout(function() {
		contextMenu.style.opacity = 1;
	}, 100);
}

function clearAll() {
	let menus = document.querySelectorAll(".contextMenu");
	for (let i = 0; i < menus.length; i++) {
		menus[i].style.opacity = 0;
		setTimeout(function() {
			menus[i].style.display = "none";
			menus[i].remove();
		}, 100);
	}
}

// Close context menu when a click is detected elsewhere
document.addEventListener("click", function(e) {
	if (e.target.className != "contextMenu_button")
		clearAll();
});

export { Entries, define }
