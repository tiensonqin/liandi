import {Wnd} from "../layout/wnd";
import {i18n} from "../i18n";
import {initSearch} from "../search";
import {remote} from "electron";
import {addCenterWnd, getAllModels} from "../layout/util";
import {Constants} from "../constants";
import * as path from "path";
import {Graph} from "../graph";
import {Tab} from "../layout/Tab";
import {Files} from "../files";
import {Backlinks} from "../backlinks";

export const onGetConfig = (data: IConfig) => {
    window.liandi.config = data;
    document.title = i18n[window.liandi.config.lang].slogan;
    initBar();
    initWindow();
    addCenterWnd();
};

const initBar = () => {
    document.querySelector(".toolbar").innerHTML = `<div id="barNavigation" aria-label="${i18n[window.liandi.config.lang].fileTree}" class="item fn__a">
            <svg>
                <use xlink:href="#iconFiles"></use>
            </svg>
        </div>
        <div id="barBacklinks" class="item fn__a" aria-label="${i18n[window.liandi.config.lang].backlinks}">
            <svg>
                <use xlink:href="#iconLink"></use>
            </svg>
        </div>
        <div id="barGraph" class="item fn__a" aria-label="${i18n[window.liandi.config.lang].graphView}">
            <svg>
                <use xlink:href="#iconGraph"></use>
            </svg>
        </div>
        <div class="fn__flex-1" id="drag"></div>
        <a href="https://hacpai.com/sponsor" class="item ft__pink" aria-label="${i18n[window.liandi.config.lang].sponsor}">
            <svg>
                <use xlink:href="#iconFavorite"></use>
            </svg>
        </a>
        <div id="barHelp" class="item fn__a" aria-label="${i18n[window.liandi.config.lang].help}">
            <svg>
                <use xlink:href="#iconHelp"></use>
            </svg>
        </div>
        <div id="barBug" class="item fn__a" aria-label="${i18n[window.liandi.config.lang].debug}">
            <svg>
                <use xlink:href="#iconBug"></use>
            </svg>
        </div>
        <div id="barSettings" class="item fn__a" aria-label="${i18n[window.liandi.config.lang].config}">
            <svg>
                <use xlink:href="#iconSettings"></use>
            </svg>
        </div>`;
    document.getElementById("barNavigation").addEventListener("click", () => {
        const wnd = new Wnd(window.liandi.leftLayout.children.length === 0 ? undefined : "tb");
        const tab = new Tab({
            title: `<svg class="item__svg"><use xlink:href="#iconFiles"></use></svg> ${i18n[window.liandi.config.lang].fileTree}`,
            callback(tab: Tab) {
                if (window.liandi.leftLayout.element.clientWidth < 7) {
                    window.liandi.leftLayout.parent.children[1].element.style.width = (window.liandi.leftLayout.parent.children[1].element.clientWidth - 200) + "px";
                    window.liandi.leftLayout.element.style.width = "206px";
                }
                tab.addModel(new Files(tab));
            }
        });
        wnd.addTab(tab);
        window.liandi.leftLayout.addWnd(wnd);
    });

    document.getElementById("barGraph").addEventListener("click", function () {
        const wnd = new Wnd(window.liandi.topLayout.children.length === 0 ? undefined : "lr");
        const tab = new Tab({
            title: `<svg class="item__svg"><use xlink:href="#iconGraph"></use></svg> ${i18n[window.liandi.config.lang].graphView}`,
            panel: '<div class="graph__input"><input class="input"></div><div class="fn__flex-1"></div>',
            callback(tab: Tab) {
                if (window.liandi.topLayout.element.clientHeight < 7) {
                    const height = window.innerHeight / 3;
                    window.liandi.topLayout.parent.children[1].element.style.height = (window.liandi.topLayout.parent.children[1].element.clientHeight - height) + "px";
                    window.liandi.topLayout.element.style.height = (height + 6) + "px";
                }
                tab.addModel(new Graph({tab}));
            }
        });
        wnd.addTab(tab);
        window.liandi.topLayout.addWnd(wnd);
    });

    document.getElementById("barBacklinks").addEventListener("click", function () {
        const wnd = new Wnd(window.liandi.rightLayout.children.length === 0 ? undefined : "tb");
        const tab = new Tab({
            title: `<svg class="item__svg"><use xlink:href="#iconLink"></use></svg> ${i18n[window.liandi.config.lang].backlinks}`,
            callback(tab: Tab) {
                if (window.liandi.rightLayout.element.clientWidth < 7) {
                    window.liandi.rightLayout.parent.children[1].element.style.width = (window.liandi.rightLayout.parent.children[1].element.clientWidth - 260) + "px";
                    window.liandi.rightLayout.element.style.width = "266px";
                    window.liandi.rightLayoutWidth = 266;
                }
                tab.addModel(new Backlinks({tab}));
            }
        });
        wnd.addTab(tab);
        window.liandi.rightLayout.addWnd(wnd);
    });
    document.getElementById("barHelp").addEventListener("click", function () {
        if (getAllModels().files.length === 0) {
            document.getElementById("barNavigation").dispatchEvent(new CustomEvent("click"));
        }
        window.liandi.ws.send("mount", {
            url: `${Constants.WEBDAV_ADDRESS}/`,
            path: path.posix.join(Constants.APP_DIR, "public/zh_CN/链滴笔记用户指南"),
            pushMode: 0,
            callback: Constants.CB_MOUNT_HELP
        });
    });
    document.getElementById("barBug").addEventListener("click", () => {
        remote.getCurrentWindow().webContents.openDevTools({mode: "bottom"});
    });
    document.getElementById("barSettings").addEventListener("click", () => {
        initSearch("settings");
    });
};


const initWindow = () => {
    // window action
    const currentWindow = remote.getCurrentWindow();
    if (process.platform === "darwin") {
        document.getElementById("drag").addEventListener("dblclick", () => {
            if (currentWindow.isMaximized()) {
                currentWindow.unmaximize();
            } else {
                currentWindow.maximize();
            }
        });
        return;
    }

    if (process.platform === "win32") {
        document.body.classList.add("body--win32");
    }

    currentWindow.on("blur", () => {
        document.body.classList.add("body--blur");
    });
    currentWindow.on("focus", () => {
        document.body.classList.remove("body--blur");
    });

    const maxBtnElement = document.getElementById("maxWindow");
    const restoreBtnElement = document.getElementById("restoreWindow");
    const minBtnElement = document.getElementById("minWindow");
    const closeBtnElement = document.getElementById("closeWindow");

    minBtnElement.addEventListener("click", () => {
        currentWindow.minimize();
    });
    minBtnElement.style.display = "block";

    maxBtnElement.addEventListener("click", () => {
        currentWindow.maximize();
    });

    restoreBtnElement.addEventListener("click", () => {
        currentWindow.unmaximize();
    });

    closeBtnElement.addEventListener("click", () => {
        currentWindow.close();
    });
    closeBtnElement.style.display = "block";

    const toggleMaxRestoreButtons = () => {
        if (currentWindow.isMaximized()) {
            restoreBtnElement.style.display = "block";
            maxBtnElement.style.display = "none";
        } else {
            restoreBtnElement.style.display = "none";
            maxBtnElement.style.display = "block";
        }
    };
    toggleMaxRestoreButtons();
    currentWindow.on("maximize", toggleMaxRestoreButtons);
    currentWindow.on("unmaximize", toggleMaxRestoreButtons);
};
