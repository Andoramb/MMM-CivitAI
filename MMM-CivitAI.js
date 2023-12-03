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
		imageWidth: "auto",
		imageHeight: "auto",
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
				this.currentIndex = (this.currentIndex + 1) % this.config.limit;
				this.fetchPhoto();  
				break;
		}
	},

    fetchPhoto: function() {
        const params = {
            limit: this.config.limit,
            postId: this.config.postId || null,
            modelId: this.config.modelId || null,
            username: this.config.username || null,
            nsfw: this.config.nsfw,
            nsfwLevel: this.config.nsfwLevel,            
            sort: this.config.sort,
            period: this.config.period,
            page: this.config.page,
            //prompt: this.config.prompt || null,
            //negativeprompt: this.config.negativeprompt || null,
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
        let width = this.config.imageWidth == "auto" ? window.innerWidth : this.config.imageWidth;
        let height = this.config.imageHeight == "auto" ? window.innerHeight : this.config.imageHeight;
      
        p.dark = WBColor.hsv2Rgb({h:0, s:0, v:0});
        p.light = WBColor.hsv2Rgb({h:0, s:0, v:30});

        if (civitaiData.items && civitaiData.items.length > 0) {
            const item = civitaiData.items[this.currentIndex];
            console.log("Processing photo data from CivitAI API:", item);

			try {
				p.authorName = item.username;
				p.username = item.username;
				p.meta = {
					prompt: (item.meta.prompt.replace(/<.*?>/g, '')).replace(/,\s*,/g, ',') || '',
					
				};
				this.photoData = p;
    
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
                this.img.src = item.url;
                this.photoElement = this.img;
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
		  this.currentIndex = (this.currentIndex + 1) % this.config.limit; // Cycle through photos
		  this.fetchPhoto();
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
