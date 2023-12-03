# Module: MMM-CivitAI

MMM-CivitAI is a MagicMirror module that fetches and displays images from the CivitAI API, allowing you to showcase various images on your MagicMirror display.  
This module is heavily inspired by [WallberryTheme](https://github.com/delightedCrow/WallberryTheme) module, huge thanks for @delightedCrow

* * *

## Installation

Navigate to your MagicMirror's modules folder:

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
                period: "Day"
            }
        },
```

* * *

## Configuration options

The following properties of `MMM-CivitAI` can be configured.

**CivitAI API specific patameters**

| Option | Type | Description |
| --- | --- | --- |
| `limit` | Number | Number of images to fetch (0 - 200)  <br>**Default value:** `10` |
| `postId` | String | The ID of a post to get images from  <br>**Default value:** `null` |
| `modelId` | String | The ID of a model to get images from (model gallery)  <br>**Default value:** `null` |
| `username` | String | Filter images based on username  <br>**Default value:** `null` |
| `nsfw` | String | NSFW filter option (`"None"`, `"Soft"`, `"Mature"`, `"X"`)  <br>**Default value:** `None` |
| `sort` | String | Sorting option for images (`"Most Reactions"`, `"Most Comments"`, `"Newest"`)  <br>**Default value:** `Most Reactions` |
| `period` | String | Time period for sorting images (`"AllTime"`, `"Year"`, `"Day"`, `"Week"`, `"Month"`)  <br>**Default value:** `Day` |
| `page` | Number | Page number for paginated results  <br>**Default value:** `1` |
| `showPrompt` | Boolean | Show image prompt in the module  <br>**Default value:** `true` |
| `showUsername` | Boolean | Show username in the module  <br>**Default value:** `true` |

  

**Module formatting specific parameters**

| Option | Type | Description |
| --- | --- | --- |
| `updateInterval` | Number | How often to fetch new images (milliseconds)  <br>**Default value:** `3600*1000` |
| `backgroundOpacity` | Number | Opacity of the background image (0.0 to 1.0)  <br>**Default value:** `1` |
| `autoDimOn` | Boolean | Automatically dim bright images  <br>**Default value:** `false` |
| `addBackgroundFade` | Array | Adds darker gradient backgrounds to the top bar region and/or bottom bar regions of MagicMirror (helps with readability for bright or busy background images).  <br>  <br>**Possible values:** `"top"` will add a gradient background to the top bar region, `"bottom"` will add a gradient background to the bottom bar region. Set to an empty list to remove all gradients. Default value: `["top", "bottom"]`  <br>**Default value:** `true` |
| `clearCacheOnStart` | Boolean | Clear Electron's cache on startup  <br>**Default value:** `false` |
| `imageWidth` | String | Width of displayed images ("auto" or a specific width in pixels)  <br>**Default value:** `auto` |
| `imageHeight` | String | Height of displayed images ("auto" or a specific height in pixels)  <br>**Default value:** `auto` |

  

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