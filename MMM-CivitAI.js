Module.register("MMM-CivitAI", {
	defaults: {
		limit: 10,
		postId: null,
		modelId: null,
		modelVersionId: null,
		username: null,
		nsfw: "None",
		sort: "Most Reactions",
		period: "Day",
		page: 1,
		showPrompt: true,
		showUsername: true,
		//prompt: null,  //not available in CivitAI API yet
		//negativeprompt: null, //not available in CivitAI API yet
		updateInterval: 3600 * 1000, // 1h
		backgroundOpacity: 1,
		autoDimOn: false,
		addBackgroundFade: ["top", "bottom"],
		clearCacheOnStart: false,
		resizeMode: "height",
		// media type filter: "image", "video", "imagevideo"
		// default to "image" when unspecified
		type: "image"
		//imageWidth: "auto",  //not needed, reserverd for future update
		//imageHeight: "auto",    //not needed, reserverd for future update
	},

	photoData: null,
	photoElement: null,
	photoError: null,
	fetchTimer: null,
	img: null,

	getStyles: function() {
		return [
			this.file("MMM-CivitAI.css"),
			"font-awesome.css"
		];
	},

    getScripts: function() {
		return ["colorHelpers.js"];
	},
    
	start: function() {
		this.currentIndex = 0;
		Log.info("Starting module: " + this.name);
		if (this.config.clearCacheOnStart) {
			this.sendSocketNotification("CLEAR_CACHE");
		} else {
			this.fetchPhoto();
			this.scheduleUpdate();
		}
	},

	getTemplate: function() {
		return "MMM-CivitAI.njk";
	},

	getTemplateData: function() {
		return {
			config: this.config,
			photoElement: this.photoElement,
			photoData: this.photoData,
			photoError: this.photoError,
			setBackgroundTint: this.setBackgroundTint,
			getHeight: this.getFadeHeight
		};
	},

	socketNotificationReceived: function(notification, payload) {
		Log.info(
			"socketNotificationReceivedCivitAI: " + notification + ", payload: " + payload
		);
		switch(notification) {
		case "ELECTRON_CACHE_CLEARED":
			this.fetchPhoto();
			break;
		case "FETCH_PHOTO":
			this.fetchPhoto();  
			break;
		}
	},

	notificationReceived: function(notification, payload, sender) {
		switch(notification){
			case "SHOW_ALERT":
				if (payload.type === "notification") {
					this.showNotification(payload);
				} else {
					this.showAlert(payload, sender);
				}
				break;
			case "HIDE_ALERT":  // Corrected duplicate case
				this.hideAlert(sender);
				break;
			case "FETCH_PHOTO":
				// If we have cached items, pick a random one, otherwise fetch new ones
				if (this.filteredItems && this.filteredItems.length > 0) {
					const randomIndex = Math.floor(Math.random() * this.filteredItems.length);
					this.processFilteredItem(this.filteredItems[randomIndex]);
				} else {
					this.fetchPhoto();
				}
				break;
		}
	},

	fetchPhoto: function() {
		const params = {
			limit: this.config.limit,
			postId: this.config.postId || null,
			modelId: this.config.modelId || null,
			modelVersionId: this.config.modelVersionId || null,
			username: this.config.username || null,
			nsfw: this.config.nsfw,
			sort: this.config.sort,
			period: this.config.period,
			type: this.config.type || null,
			page: this.config.page,
			username: this.config.username || null,
		};
	
		// Remove null or undefined parameters
		Object.keys(params).forEach(key => params[key] === null && delete params[key]);
	
		const url = "https://civitai.com/api/v1/images?" + new URLSearchParams(params).toString();
		console.log("Fetching photo from CivitAI API:", url);
		this.photoError = null;
		var req = new XMLHttpRequest();
		var mod = this;
	
		req.addEventListener("load", function () {
			const civitaiData = JSON.parse(this.responseText);
			if (this.status === 200) {
				mod.processPhoto(civitaiData);
			} else if ("error" in civitaiData) {
				mod.processError(
					`The CivitAI API returned the error "${civitaiData["error"]["issues"][0]["message"]}"`
				);
			} else {
				mod.processError(`CivitAI Error: ${this.status}, ${this.statusText}`);
				Log.error("CivitAI Error: ", this.responseText);
			}
		});
	
		req.addEventListener("error", function() {
			mod.processError("Could not connect to the CivitAI server.");
		});
	
		req.open("GET", url);
		req.setRequestHeader("Content-Type", "application/json");
		req.send();
	},
	

    processPhoto: function(civitaiData) {
        var p = {};
		
		// Not needed, reserved for future update
        //let width = this.config.imageWidth == "auto" ? window.innerWidth : this.config.imageWidth;
        //let height = this.config.imageHeight == "auto" ? window.innerHeight : this.config.imageHeight;
      
        p.dark = WBColor.hsv2Rgb({h:0, s:0, v:0});
        p.light = WBColor.hsv2Rgb({h:0, s:0, v:30});

		if (civitaiData.items && civitaiData.items.length > 0) {
			// Helper: resolve a probable media URL for an item from common fields
			const resolveMediaUrl = (it) => {
				if (!it) return "";
				if (it.url) return it.url;
				if (it.imageUrl) return it.imageUrl;
				if (it.file) return it.file;
				if (it.images && it.images.length) {
					if (it.images[0].url) return it.images[0].url;
					if (it.images[0].src) return it.images[0].src;
				}
				return "";
			};

			// Filter items according to the new config.type option
			const isVideoUrl = (url) => /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url);
			const filterType = (this.config.type || "imagevideo").toLowerCase();

			// Build a filtered list depending on requested type
			const filteredItems = civitaiData.items.filter(it => {
				const url = resolveMediaUrl(it) || "";
				const video = isVideoUrl(url) || (it.contentType && /video/i.test(it.contentType));
				if (filterType === "image") return !video;
				if (filterType === "video") return video;
				return true; // imagevideo
			});

			if (filteredItems.length === 0) {
				this.processError("No media items matched the configured type filter.");
				return;
			}

			// Store filtered items for future random selection
			this.filteredItems = filteredItems;
			// Pick a random item from the filtered list
			const randomIndex = Math.floor(Math.random() * filteredItems.length);
			const item = filteredItems[randomIndex];

			try {
				p.authorName = item.username;
				p.username = item.username;
				p.meta = {
					prompt: (item.meta && item.meta.prompt ? item.meta.prompt.replace(/<.*?>/g, '') : '') || '',
				};
				this.photoData = p;
				// decide if this item is a video or image
				const url = resolveMediaUrl(item) || "";
				const videoRegex = /\.(mp4|webm|ogg|mov)(\?.*)?$/i;
				const isVideo = videoRegex.test(url) || (item.contentType && /video/i.test(item.contentType));
				this.photoData.isVideo = isVideo;

				if (isVideo) {
					// create or reuse video element
					if (this.video === undefined || this.video === null) {
						this.video = document.createElement("video");
					}
					this.video.style.opacity = this.config.backgroundOpacity;
					// Set all attributes needed for reliable autoplay
					this.video.setAttribute("autoplay", "");
					this.video.setAttribute("loop", "");
					this.video.setAttribute("muted", "");
					this.video.setAttribute("playsinline", "");
					this.video.muted = true; // Explicitly set muted for Safari
					
					this.video.onloadeddata = () => {
						// Attempt to play the video
						this.video.play().catch(error => {
							console.warn("Autoplay failed:", error);
							// Retry play on next animation frame
							requestAnimationFrame(() => {
								this.video.play().catch(() => {});
							});
						});
						
						this.updateDom(2000);
						this.fetchTimer = setTimeout(() => {
							this.fetchPhoto();
						}, this.config.updateInterval);
					};

					this.video.crossOrigin = "Anonymous";
					this.video.src = url;
					this.photoElement = this.video;
				} else {
					if (this.img === null) {
						this.img = document.createElement("img");
					}

					this.img.style.opacity = this.config.backgroundOpacity;
					this.img.onload = () => {
						if (this.config.autoDimOn) {
							this.photoData.isLight = WBColor.isImageLight(this.img);
						}
						this.updateDom(2000);
						this.fetchTimer = setTimeout(() => {
							this.fetchPhoto();
						}, this.config.updateInterval);
					};

					this.img.crossOrigin = "Anonymous";
					this.img.src = url;
					this.photoElement = this.img;
				}
            } catch (error) {
                this.processError(`Error processing photo: ${error.message}`);
            }
        } else {
            this.processError("No image data found in the CivitAI API response.");
        }
    },
    
    processError: function (errorText) {
        console.error("Error loading background photo:", errorText);
        this.photoError = errorText;
        this.updateDom();
        this.fetchTimer = setTimeout(() => {
            this.fetchPhoto();
        }, this.config.updateInterval);
    },

	scheduleUpdate: function () {
		setInterval(() => {
		  if (this.filteredItems && this.filteredItems.length > 0) {
			// Pick a new random item from our cached list
			const randomIndex = Math.floor(Math.random() * this.filteredItems.length);
			this.processFilteredItem(this.filteredItems[randomIndex]);
		  } else {
			// If we don't have items cached, fetch new ones
			this.fetchPhoto();
		  }
		}, this.config.updateInterval);
	  },

	suspend: function() {
		Log.info("Suspending MMM-CivitAI...");
		this.setBackgroundTint({r:0, g:0, b:0});
		clearTimeout(this.fetchTimer);
	},

	resume: function() {
		Log.info("Waking MMM-CivitAI...");
		clearTimeout(this.fetchTimer);
	},

	nunjucksEnvironment: function() {
		if (this._nunjucksEnvironment !== null) {
			return this._nunjucksEnvironment;
		}

		var self = this;

		this._nunjucksEnvironment = new nunjucks.Environment(new nunjucks.WebLoader(this.file(""), {async: true, useCache: true}), {
			trimBlocks: true,
			lstripBlocks: true
		});
		this._nunjucksEnvironment.addFilter("translate", function(str) {
			return self.translate(str);
		});

		return this._nunjucksEnvironment;
	},

	getFadeHeight: function(regionClassName) {
		let region = document.getElementsByClassName(regionClassName)[0];
		return region.clientHeight + 130;
	},

	setBackgroundTint: function(tint) {
		let darkBackground = `rgb(${tint.r}, ${tint.g}, ${tint.b})`;
		let html = document.getElementsByTagName("html")[0];
		let body = document.getElementsByTagName("body")[0];
		body.style.backgroundColor = darkBackground;
		html.style.backgroundColor = darkBackground;
	},
});
