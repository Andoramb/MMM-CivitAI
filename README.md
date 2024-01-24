# Module: MMM-CivitAI

MMM-CivitAI is a MagicMirror module that fetches and displays images from the CivitAI API, allowing you to showcase various AI generated images on your MagicMirror display 🖼️ <br><br>
This module is heavily inspired by [WallberryTheme](https://github.com/delightedCrow/WallberryTheme) module, 🙌 huge thanks for @delightedCrow

As far as I've seen it the [CivitAI API](https://github.com/civitai/civitai/wiki/REST-API-Reference) does not require an api key for directly fetching images ✅

## Screenshot
<p align="center">
<img style="width: 50%;" src="image/1.jpg">
</p>

* * *

## Installation

Navigate to your MagicMirror's modules folder, ex.:

```bash
cd ~/MagicMirror/modules
```

Clone this repository:

```bash
git clone https://github.com/Andoramb/MMM-CivitAI.git
```

Install the module dependencies:

```bash
cd MMM-CivitAI
npm install
```

* * *

## Using the module

To use this module, add it to the modules array in the `config/config.js` file.

Example configuration:

```javascript
        {
            module: "MMM-CivitAI",
            position: "fullscreen_below",
            config: {
                addBackgroundFade: ["top", "bottom"], 
                limit: 10,
                updateInterval: 60 * 60 * 1000, // 1h in ms
                showPrompt: true,
                showUsername: true,
                nsfw: "None",
                sort: "Most Reactions",
                period: "Day",
                resizeMode: "height"
            }
        },
```

* * *

## Configuration options

The following properties of `MMM-CivitAI` can be configured.

**CivitAI API specific patameters**

| Option | Default | Description |
| --- | --- | --- |
| `limit` | `10` | Number of images to fetch (0 - 200)  |
| `postId` |  `null` | The ID of a post to get images from  |
| `modelId` | `null` | The ID of a model to get images from (model gallery)  |
| `username` | `null` | Filter images based on username  |
| `nsfw` | `"None"` | NSFW filter option (`"None"`, `"Soft"`, `"Mature"`, `"X"`)  |
| `sort` | `"Most Reactions"` | Sorting option for images (`"Most Reactions"`, `"Most Comments"`, `"Newest"`)|
| `period` | `"Day"` | Time period for sorting images (`"AllTime"`, `"Year"`, `"Day"`, `"Week"`, `"Month"`)|
| `page` | `1` | Page number for paginated results|
| `showPrompt` | `true` | Show image prompt in the module  |
| `showUsername` | `true` | Show username in the module  |
| `resizeMode` | `"height"` | Fit the image to the `"height"` or `"width"` of screen |

  

**Module formatting specific parameters**

| Option | Default | Description |
| --- | --- | --- |
| `updateInterval` | `3600*1000` | How often to fetch new images (milliseconds)|
| `backgroundOpacity` | `1` | Opacity of the background image (0.0 to 1.0)|
| `autoDimOn` | `false` | Automatically dim bright images |
| `addBackgroundFade` | `["top", "bottom"]` | Adds darker gradient backgrounds to the top bar region and/or bottom bar regions of MagicMirror (helps with readability for bright or busy background images). <br>**Possible values:** `"top"` and/or `"bottom"`. Set to an empty list to remove all gradients.|
| `clearCacheOnStart` | `false` | Clear Electron's cache on startup|

  

* * *

## Notifications

**MMM-CivitAI** can react to the following notifications sent by other modules:

| Notification | Payload | Description |
| --- | --- | --- |
| `FETCH_PHOTO` | `none` | Fetch the next photo |
| `SHOW_ALERT` | `none` | Fetch the next photo |
| `HIDE_ALERT` | `none` | Fetch the next photo |

Example:  
`http://192.168.1.100:8080/remote?action=NOTIFICATION&notification=FETCH_PHOTO` - Will fetch the next image :)


* * *

## Contributing
Feel free to suggest improvements, create issues if you find something needs fixing.
