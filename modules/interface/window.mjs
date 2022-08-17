import * as Utils from "../misc/utils.mjs";
import * as Debug from "../misc/debug.mjs";

// Allows an element to move another
function makeMoveable(trigger, target) {
	// Prepare element
	target.style.position = "absolute";
	
	trigger.addEventListener('mousedown', startMove);
	
	function startMove(e) {
		// Offset the element so it matches trigger pos
		target.triggerOffsetX = target.offsetLeft - e.clientX;
		target.triggerOffsetY = target.offsetTop - e.clientY;
		
		// Save transitions to add them back later
		trigger.oldTransition = trigger.style.transition;
		
		document.addEventListener('mousemove', move);
		document.addEventListener('mouseup', stopMove);
	}
	
	// Move an element if a trigger is held
	function move(e) {
		e.preventDefault();
		
		target.style.transition = "none";
		target.style.left = (e.clientX + target.triggerOffsetX) + 'px';
		target.style.top = (e.clientY + target.triggerOffsetY) + 'px';
		
		// Prevent element from getting off page
		let offX = target.offsetLeft;
		let offY = target.offsetTop;
		let w = target.offsetWidth;
		let h = target.offsetHeight;
		let cliW = document.documentElement.clientWidth;
		let cliH = document.documentElement.clientHeight;
		let taskbarH = Utils.id("taskbar").offsetHeight;
		
		if (offX <= 0)
			target.style.left = 0; 
		else if (offX + w >= cliW)
			target.style.left = (cliW - w) + "px";
			
		if (offY <= 0)
			target.style.top = 0;
		else if (offY + h >= cliH - taskbarH)
			target.style.top = (cliH - h - taskbarH) + "px";
	}
	
	function stopMove() {
		target.style.transition = trigger.oldTransition;
		
		document.removeEventListener('mousemove', move);
		document.removeEventListener('mouseup', stopMove);
	}
}

// Namespaced globals
const taskbar = Utils.id("taskbar");
let cache = [];
let active;
let count = 0;
let useAnimations = true;

// Class for instantiating windows
class Instance {
	isMaximized = false;
	
	// dataObj = {
	// 	title: "Untitled window",
	// 	path: "",
	// 	icon: "default.png",
	// 	size: [800, 600],
	// 	position: ["center", "center"],
	// 	isModal: false,
	// 	allowMaximize: true,
	// 	allowMinimize: true,
	// 	allowResize: true,
	// 	allowMoving: true
	// }
	constructor(dataObj) {
		this.path = dataObj.path;
		this.title = dataObj.title
			? dataObj.title : "Untitled window";
		this.icon = dataObj.icon
			? dataObj.icon : "default.png";
		this.size = dataObj.size
			? dataObj.size : [800, 600];
		this.position = dataObj.position
			? dataObj.position : ["center", "center"];
		this.isModal = dataObj.isModal
			? dataObj.isModal : false;
		this.allowMaximize = dataObj.allowMaximize
			? dataObj.allowMaximize : true;
		this.allowMinimize = dataObj.allowMinimize
			? dataObj.allowMinimize : true;
		this.allowResize = dataObj.allowResize
			? dataObj.allowResize : true;
		this.allowMoving = dataObj.allowMoving
			? dataObj.allowMoving : true;
		
		// Prepare the active/inactive window system
		if (count === 0) {
			document.addEventListener("mousedown", function(e) {
				let target = e.target.closest(".window");
				if (target) {
					setActive(target);
				}
			});
		}
		
		// Window limit
		if (count >= 1000) {
			Debug.warn("Cannot load more than 1000 windows!");
			return;
		}
		
		// Only create window if it doesn't exist;
		// else just return a resetted ref to the old one
		let cached = cache[this.path];
		if (!cached) {
			this.create();
		} else {
			cached.reset();
			return cached;
		}
	}
	
	// Creates a window.
	// Several event callback functions are nested within
	// to avoid window retrieval logic overhead.
	// TODO: Taskbar icons
	create() {
		let win = document.createElement("div");
		win.setAttribute("class", "window");
		win.setAttribute("id", `window${count}`);
		document.body.append(win);
		
		let caption = document.createElement("div");
		caption.setAttribute("class", "window_caption");
		win.append(caption);
		
		if (this.icon != "") {
			let icon = document.createElement("img");
			icon.src = "/assets/icons/" + this.icon;
			icon.setAttribute("class", "window_icon");
			caption.appendChild(icon);
		}
		
		let heading = document.createElement("span");
		heading.setAttribute("class", "window_heading");
		heading.innerHTML = this.title;
		caption.appendChild(heading);
		
		// Set window's dimensions
		let width = this.size[0] <= window.innerWidth ? this.size[0] : window.innerWidth;
		win.style.width = width + "px";
		
		let height = this.size[1] <= window.innerHeight ? this.size[1] : window.innerHeight;
		win.style.height = height + "px";
		
		// Set window's position
		let x, y;
		
		switch (this.position[0]) {
			case "left":
			x = 0;
			break;
			case "center":
			x = window.innerWidth / 2 - this.size[0] / 2;
			break;
			case "right":
			x = window.innerWidth - this.size[0];
			break;
			default:
			Debug.warn(`Invalid horizontal position ${this.position[0]}`);
			break;
		}
		
		switch (this.position[1]) {
			case "top":
			y = 0;
			break;
			case "center":
			y = window.innerHeight / 2 - this.size[1] / 2;
			break;
			case "bottom":
			y = window.innerHeight - this.size[1];
			break;
			default:
			Debug.warn(`Invalid vertical position ${this.position[1]}`);
			break;
		}
		
		win.style.left = x + "px";
		win.style.top = y + "px";
		
		// Enable window movement
		if (this.allowMoving) {
			makeMoveable(caption, win);
		}
		
		// Caption buttons handling
		// TODO: Modals are inside overlay that block other windows
		// Only one modal at a time
		if (this.isModal) {
			win.style.zIndex = "1";
		}
		
		if (this.allowMinimize) {
			let btn = document.createElement("img");
			btn.src = "/assets/shared/minimizeButton.png";
			btn.setAttribute("class", "window_btnMinimize");
			btn.setAttribute("id", `window_btnMinimize${count}`);
			btn.setAttribute("draggable", "false");
			caption.appendChild(btn);
			
			btn.addEventListener("click", function(e) {
				let index = e.target.id.slice(-1);
				let win = Utils.id(`window${index}`);
				setInactive(win);
			});
		}
		
		if (this.allowMaximize) {
			let btn = document.createElement("img");
			btn.src = "/assets/shared/maximizeButton.png";
			btn.setAttribute("class", "window_btnMaximize");
			btn.setAttribute("id", `window_btnMaximize${count}`);
			btn.setAttribute("draggable", "false");
			caption.appendChild(btn);
			
			btn.addEventListener("click", function(e) {
				toggleMaximized();
			});
			
			function toggleMaximized() {
				if (!win.isMaximized) {
					win.size = [win.offsetWidth, win.offsetHeight];
					win.pos = [win.offsetLeft, win.offsetTop];
					win.style.width = document.documentElement.clientWidth - 5 + "px";
					win.style.height = document.documentElement.clientHeight - Utils.id("taskbar").offsetHeight - 4 + "px";
					win.style.top = "0";
					win.style.left = "0";
					win.isMaximized = true;
					// TODO: Disable resizing when it'll be impl.
				} else {
					win.style.width = win.size[0] + "px";
					win.style.height = win.size[1] + "px";
					win.style.left = win.pos[0] + "px";
					win.style.top = win.pos[1] + "px";
					win.isMaximized = false;
				}
			}
		}
		
		if (this.allowResize) {
			let resizers = {
				"resizer_corner resizerBL": undefined,
				"resizer_corner resizerBR": undefined,
				"resizer_corner resizerTL": undefined,
				"resizer_corner resizerTR": undefined,
				"resizer_side resizerST": undefined,
				"resizer_side resizerSB": undefined,
				"resizer_side resizerSL": undefined,
				"resizer_side resizerSR": undefined
			};
			
			//Set ID of each resizer
			for (let i = 0; i < Object.keys(resizers).length; i++) {
				let key = Object.keys(resizers)[i];
				let resizer = document.createElement("div");
				resizers[key] = resizer;
				resizer.setAttribute("class", "resizer " + key);
				
				// Prepare resizing when mouse is pressed
				resizer.addEventListener("mousedown", startResize);
				
				win.append(resizer);
			}
			
			function startResize(e) {
				// Get current resizer as closest one
				let currentResizer = e.target.closest(".resizer");
				let resizerClass = currentResizer.className;
				
				let directionX, directionY;
				if (!(resizerClass.includes("ST")) && !(resizerClass.includes("SB"))) {
					directionX = currentResizer.offsetLeft <= win.offsetLeft
							? -1 : 1;
				}
				if (!(resizerClass.includes("SL")) && !(resizerClass.includes("SR"))) {
					directionY = currentResizer.offsetTop <= win.offsetTop
							? -1 : 1;
				}
						
				let oldMouseX = e.clientX;
				let oldMouseY = e.clientY;
				
				// offsetWidth gives wrong results...
				let currentWidth = parseInt(win.style.width);
				let currentHeight = parseInt(win.style.height);
				
				// Do the actual resizing when mouse moves
				window.addEventListener("mousemove", resize);
				
				// Stop resizing when mouse is released
				window.addEventListener("mouseup", stopResize);
				
				// Remove window transitions
				win.oldTransition = win.style.transition;
				win.style.transition = "none";
				
				function resize(e) {
					let mouseX = e.clientX;
					let mouseY = e.clientY;
					
					if (directionX && mouseX >= 0 && mouseX <= window.innerWidth) {
						let w = currentWidth - directionX * (oldMouseX - mouseX);
						win.style.width = w + "px";
						if (directionX == -1)
							win.style.left = mouseX + "px";
					}
					
					if (directionY && mouseY >= 0 && mouseY <= window.innerHeight) {
						let h = currentHeight - directionY * (oldMouseY - mouseY);
						win.style.height = h + "px";
						if (directionY == -1)
							win.style.top = mouseY + "px";	
					}
										
				}
				
				function stopResize(e) {
					window.removeEventListener("mousemove", resize);
					window.removeEventListener("mouseup", stopResize);
					
					// Restore transitions
					win.style.transition = win.oldTransition;
				}
			}
		}
		
		let closeBtn = document.createElement("img");
		closeBtn.src = "/assets/shared/closeButton.png";
		closeBtn.setAttribute("class", "window_btnClose");
		closeBtn.setAttribute("id", `window_btnClose${count}`);
		closeBtn.setAttribute("draggable", "false");
		closeBtn.addEventListener("click", function(e) {
			let index = e.target.id.slice(-1);
			let win = Utils.id(`window${index}`);
			let thumbnail = Utils.id(`window_thumbnail${index}`);
			setInactive(win);
			win.style.opacity = "0";
			win.style.transform = "scale(0.6)";
			thumbnail.style.zIndex = "5";
			thumbnail.style.opacity = "0";
			thumbnail.style.transform = "translate(-25%, 0)";
			setTimeout(function() {
				win.style.display = "none";
			}, 200);
		});
		caption.appendChild(closeBtn);
		
		// Window contents
		let container = document.createElement("div");
		container.setAttribute("class", "window_content");
		let content = fetch("/windowdata/" + this.path)
			.then(response => {
				if (response.ok) {
					return response.text();
				} else  {
					Debug.error(`Could not load content of window '${this.title}'.`);					
					return "An error occured while fetching content for this window.\nSee console for details.";
				}
			})
			.then(data => {
				if (data.includes("<script>")) {
					Debug.error(`Loading of window '${this.title}' was blocked because the latter contains a script. Please remove all script tags from the window content's HTML.`);
					container.innerHTML = "This window was blocked because it contained disallowed content.\nSee console for details.";
					return;
				}
				container.innerHTML = data;
			});
		win.append(container);
		
		// Enable scrolling of the window's content
		container.style.overflow = "auto";
		
		// Prevent default context menu and show custom
		window.addEventListener("contextmenu", function(e) {
			e.preventDefault();
		});
		
		// Register window in taskbar
		let thumbnail = document.createElement("div");
		thumbnail.style.width = "157px";
		thumbnail.setAttribute("class", "window_thumbnail");
		thumbnail.setAttribute("id", `window_thumbnail${count}`);
		thumbnail.innerHTML = `<div class="window_thumbnailWrapper"><img class="window_thumbnailIcon" src="${"/assets/icons/" + this.icon}" /><span class="window_thumbnailTitle">${this.title}</span></div><span class="window_thumbnailOverlay" id="window_thumbnailOverlay${count}"></span>`;
		win.thumbnail = thumbnail; // Used in setActive
		
		// Toggle window state on taskbar thumbnail click
		thumbnail.addEventListener("mousedown", function(e) {
			let index = e.target.id.slice(-1);
			let win = Utils.id(`window${index}`);
		
			if (active != win || win.style.display === "none") {
				setActive(win);
			} else if (win.style.display === "block") {
				setInactive(win);
			}
		});
		
		// Enable animations
		if (useAnimations) {
			// Setup opening/closing animation
			win.style.opacity = "0";
			win.style.transform = "scale(0.6)";
			
			setTimeout(function() {
				win.style.opacity = "1";
			}, 200);
		}
		
		// Add window to cache
		if (!cache[this.path])
			cache[this.path] = this;
		
		this.id = count;
		this.element = win;
		count++;
	}
	
	setActive() {
		setActive(this);
	}
	
	// TODO: Reset inputs etc.
	reset() {
		Debug.warn("UNIMPLEMENTED");
	}
}
	
// Gives the focus to a window. Displays it if it is hidden.
function setActive(win) {
	if (!Utils.id(`window_thumbnail${count - 1}`)) {
		taskbar.append(win.thumbnail);
	}
	
	if (active) {
		active.thumbnail.style.backgroundImage
		= "url(/assets/shared/taskbarButton_inactive.png)";
		active.style.filter = "grayscale(0.6)";
		active.style.boxShadow = "rgb(175, 175, 175) 0px 6px 50px -10px";
	}
	
	active = win;
	win.style.display = "block";
	win.style.filter = "";
	if (useAnimations) {
		win.style.boxShadow = "rgb(102, 102, 102) 0px 6px 50px -10px";
		setTimeout(function() {
			win.style.transform = "translate(0, 0) scale(1)";
			win.style.opacity = 1;
		}, 50);
	}
	document.body.childNodes[document.body.childNodes.length - 1].insertAdjacentElement("afterend", win);
	win.thumbnail.style.zIndex = "4";
	win.thumbnail.style.opacity = "1";
	win.thumbnail.style.transform = "translate(0, 0)";
	win.thumbnail.style.backgroundImage
	= "url(/assets/shared/taskbarButton_active.png)";
}
	
// Makes a window inactive and hide it from view.
function setInactive(win) {
	if (useAnimations) {
		win.style.transform = "translate(0, 80vh) scale(0.5)";
		win.style.opacity = 0;
		setTimeout(function() {
			win.style.display = "none";
		}, 200);
	} else {
		win.style.display = "none";
	}
	win.style.boxShadow = "rgb(175, 175, 175) 0px 6px 50px -10px";
	win.style.filter = "grayscale(0.6)";
	win.thumbnail.style.backgroundImage = "url(/assets/shared/taskbarButton_inactive.png)";
}

// Makes all windows inactive without hiding them.
function setInactiveAll() {
	if (active) {
		active.thumbnail.style.backgroundImage
		= "url(/assets/shared/taskbarButton_inactive.png)";
		active.style.filter = "grayscale(0.6)";
		active.style.boxShadow = "rgb(175, 175, 175) 0px 6px 50px -10px";
		active = undefined;
	}
}


// Make all windows inactive on click on the empry workspace
Utils.id("workspace").addEventListener("click", function(e) {
	if (e.target.className != "window")
		setInactiveAll();
});

export { Instance, setActive }
