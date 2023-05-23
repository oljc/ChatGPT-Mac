module.exports = {
  productName: "ChatGPT",
  appId: "com.ljc.chatgptmac",
  copyright: "© 2023 Li Jiangchen",
  directories: {
    output: "build",
  },
  dmg: {
    contents: [
      { x: 130, y: 220 },
      { x: 410, y: 220, type: "link", path: "/Applications" },
    ],
  },
  mac: {
    icon: "icons/icon",
    category: "com.ljc.chatgptmac",
    target: [
      {
        target: "dmg",
        arch: ["arm64", "x64"],
      },
      {
        target: "zip",
        arch: ["arm64", "x64"],
      },
    ],
    hardenedRuntime: true,
    gatekeeperAssess: false,
    extendInfo: {
      LSBackgroundOnly: 1,
      LSUIElement: 1,
    },
  },
};
