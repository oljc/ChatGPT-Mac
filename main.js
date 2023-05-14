require("update-electron-app")();

const { menubar } = require("menubar");

const path = require("path");
const {
  app,
  nativeImage,
  Tray,
  Menu,
  globalShortcut,
  shell,
  MenuItem,
} = require("electron");
const contextMenu = require("electron-context-menu");

const image = nativeImage.createFromPath(
  path.join(__dirname, `icons/newiconTemplate.png`)
);

app.on("ready", () => {
  const tray = new Tray(image);

  const menuBar = menubar({
    browserWindow: {
      icon: image,
      transparent: path.join(__dirname, `icons/iconApp.png`),
      webPreferences: {
        webviewTag: true,
      },
      width: 440,
      height: 650,
    },
    tray,
    showOnAllWorkspaces: true,
    preloadWindow: true,
    showDockIcon: false,
    icon: image,
  });

  menuBar.on("ready", () => {
    const { window } = menuBar;

    if (process.platform !== "darwin") {
      window.setSkipTaskbar(true);
    } else {
      app.dock.hide();
    }

    const contextMenuTemplate = [
      {
        label: "退出",
        accelerator: "Command+Q",
        click: () => {
          app.quit();
        },
      },
      {
        label: "重新加载",
        accelerator: "Command+R",
        click: () => {
          window.reload();
        },
      },
      {
        type: "separator",
      },
      {
        label: "GitHub",
        click: () => {
          shell.openExternal("https://github.com/LIjiAngChen8/ChatGPT-Mac");
        },
      }
    ];

    tray.on("right-click", () => {
      menuBar.tray.popUpContextMenu(Menu.buildFromTemplate(contextMenuTemplate));
    });

    tray.on("click", (e) => {
      if (e.ctrlKey || e.metaKey) {
        menuBar.tray.popUpContextMenu(Menu.buildFromTemplate(contextMenuTemplate));
      }
    });

    const menu = new Menu();
    menu.append(new MenuItem({
      label: '关闭弹窗',
      submenu: [{
        role: 'exit',
        accelerator: 'Esc', click: () => { menuBar.hideWindow() }
      }]
    }));

    globalShortcut.register("CommandOrControl+Shift+g", () => {
      if (window.isVisible()) {
        menuBar.hideWindow();
      } else {
        menuBar.showWindow();
        if (process.platform == "darwin") {
          menuBar.app.show();
        }
        menuBar.app.focus();
      }
    });

    Menu.setApplicationMenu(menu);
  });

  app.on("web-contents-created", (e, contents) => {
    if (contents.getType() == "webview") {
      contents.on("new-window", (e, url) => {
        e.preventDefault();
        shell.openExternal(url);
      });
      contextMenu({
        window: contents,
      });
      contents.on("before-input-event", (event, input) => {
        const { control, meta, key } = input;
        if (!control && !meta) return;
        if (key === "c") contents.copy();
        if (key === "v") contents.paste();
        if (key === "x") contents.cut();
        if (key === "a") contents.selectAll();
        if (key === "z") contents.undo();
        if (key === "y") contents.redo();
        if (key === "r") contents.reload();
        if (key === "q") app.quit();
      });
    }
  });

  if (process.platform == "darwin") {
    menuBar.on("after-hide", () => {
      menuBar.app.hide();
    });
  }
  app.commandLine.appendSwitch(
    "disable-backgrounding-occluded-windows",
    "true"
  );
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});