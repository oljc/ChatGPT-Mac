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
  screen,
  MenuItem,
} = require("electron");
const contextMenu = require("electron-context-menu");

const image = nativeImage.createFromPath(
  path.join(__dirname, `icons/iconTemplate.png`)
);


app.on("ready", () => {
  const tray = new Tray(image);

  const menuBar = menubar({
    browserWindow: {
      icon: image,
      webPreferences: {
        webviewTag: true,
      },
      show: false,
      frame: false,
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

    if (process.platform == "darwin") {
      app.dock.hide();
    } else {
      window.setSkipTaskbar(true);
    }

    const contextMenuTemplate = [
      {
        label: "🚀重新加载",
        accelerator: "Command+R",
        click: () => {
          window.reload();
        },
      },
      {
        label: "🏷️默认大小",
        submenu: [
          {
            label: "全屏",
            click: () => {
              const { width, height } = screen.getPrimaryDisplay().workAreaSize;
              window.setSize(width, height, true);
            },
          },
          {
            label: "显示菜单栏",
            click: () => {
              window.setSize(888, 620, true);
            },
          },
          {
            label: "小屏",
            click: () => {
              window.setSize(440, 650, true);
            },
          },
        ],
      },
      {
        label: "🌐浏览器打开",
        accelerator: "Command+O",
        click: () => {
          shell.openExternal("https://chat.openai.com/chat");
        },
      },
      {
        type: "separator",
      },
      {
        label: "GitHub 🪼",
        click: () => {
          shell.openExternal("https://github.com/LIjiAngChen8/ChatGPT-Mac");
        },
      },
      {
        label: "退出",
        accelerator: "Command+Q",
        click: () => {
          app.quit();
        },
      },
      {
        label: `应用版本：${app.getVersion()}`,
        enabled: false
      }
    ];

    tray.on("right-click", () => {
      menuBar.tray.popUpContextMenu(
        Menu.buildFromTemplate(contextMenuTemplate)
      );
    });

    tray.on("click", (e) => {
      if (e.ctrlKey || e.metaKey) {
        menuBar.tray.popUpContextMenu(
          Menu.buildFromTemplate(contextMenuTemplate)
        );
      }
    });

    const menu = new Menu();
    menu.append(
      new MenuItem({
        label: "关闭弹窗",
        submenu: [
          {
            role: "exit",
            accelerator: "Esc",
            click: () => {
              menuBar.hideWindow();
            },
          },
        ],
      })
    );

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
        const { control, meta, key, isAutoRepeat, type } = input;

        if (type === "keyDown" && !isAutoRepeat && key === "Enter") {
          if (input.shift || event.isComposing || event.isAutoRepeat) {
            return;
          }
          contents.executeJavaScript(`
            const button = document.querySelector('main form button');
            if (button) { button.click();}`
          );
        };
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
