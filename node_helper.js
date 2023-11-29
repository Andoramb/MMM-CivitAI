const NodeHelper = require("node_helper");
const { BrowserWindow } = require("electron");

module.exports = NodeHelper.create({
  socketNotificationReceived: function (notification, payload) {
    console.log(notification);
    switch (notification) {
      case "CLEAR_CACHE":
        try {
          const win = BrowserWindow.getAllWindows()[0];
          const ses = win.webContents.session;

          ses.clearCache().then(() => {
            console.log("Electron's cache successfully cleared.");
            this.sendSocketNotification("ELECTRON_CACHE_CLEARED", {});
          });

        } catch (e) {
          if (e.name == "TypeError") {
            this.sendSocketNotification("ELECTRON_CACHE_CLEARED", {});
          } else {
            console.log("MMM-CivitAI ERROR: ", e);
          }
        }
        break;
    }
  },
});
