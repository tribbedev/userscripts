// ==UserScript==
// @name         reTurnVideoUrl
// @namespace    https://tribbe.de
// @version      1.0.0
// @description  prints m3u8 or mp4 download urls
// @author       Tribbe (rePublic Studios)
// @license      MIT
//
//
// @include http://*/*
// @include https://*/*
// @exclude *captcha*
//
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var download = [];
download.status = true; // true: download starts, false: no download
download.askForName = true;
download.askForDownload = true;

download.jDownloader = [];
download.jDownloader.use = true;
download.jDownloader.email = "selimplaya21@gmail.com";
download.jDownloader.password = "UNemFsc752jvgg";
download.jDownloader.deviceName = "JDownloader@Tribbe";
download.jDownloader.downloadPath = "M:\\movies";

async function main() {
    var video_src = await getVideoSrc();
    if (video_src) {
        console.log("video_src: " + video_src);
        if (download.status) {
            await downloadVideo(video_src);
        }
    }
}

async function downloadVideo(videosrc) {
    var video_name = null;

    if (download.askForDownload) {
        if (prompt('Willst du das Video auf dieser Seite Downloaden?: (ja/nein)', 'ja') != 'ja') {
            return;
        }
    }
    if (download.askForName) {
        video_name = prompt('Wie soll die Datei danach heißen?:', Date.now());
    }
    if (video_name == null) video_name = Date.now();

    var jdownloader = false
    if (download.jDownloader.use) {
        try {
            GM_xmlhttpRequest({
                method: "POST",
                url: "https://api.tribbe.dev/jdownloader/add", //url: "https://api.jdownloader.org/flash/add",
                data: JSON.stringify({
                    jd_email: download.jDownloader.email,
                    jd_password: download.jDownloader.password,
                    jd_devicename: download.jDownloader.deviceName,
                    link: videosrc,
                    packagename: video_name,
                    destinationfolder: download.jDownloader.downloadPath,
                    pass: "EmuP4a^Bn6L/fF"
                }),
                headers: { "Content-type": "application/json; charset=UTF-8" },
                onload: function (response) {
                    console.log(response);
                }
            })
            jdownloader = true
        } catch {
            console.error('Jdownloader is Offline or an error is there');
        }
    }
    if (!jdownloader) {
        var link = document.createElement("a");
        link.download = video_name + "." + videosrc.split(/[#?]/)[0].split('.').pop().trim();
        link.href = videosrc;
        link.click();
    }
}

async function getVideoSrc() {
    var content = document.body.textContent;
    var video = null;
    var videoNode = null;

    var retry = false;
    //#region VOE
    if (
        document.querySelectorAll(
            "div[class='plyr__video-wrapper']>video[id='voe-player']"
        ).length > 0
    ) {
        retry = true;

        var mp4finder = null;
        mp4finder = content.match(/('https?.*?\.mp4.*?')/g);
        if (mp4finder != null) video = mp4finder[0].replaceAll("'", "");

        if (video == null) {
            mp4finder = content.match(/sources\[\"mp4\"\] = .*?\(\[(.*?)]\);/);
            if (mp4finder != null && mp4finder.length == 2) {
                var mp4array = mp4finder[1].replaceAll("'", "").split(",");
                var p01 = mp4array.join("").split("").reverse().join("");
                video = atob(p01);
            }
        }

        if (video == null) {
            mp4finder = content.match(/'mp4': '(.*?)'/);
            if (mp4finder != null && mp4finder.length == 2) {
                video = atob(mp4finder[1].replaceAll("'", ""));
            }
        }

        var hlsfinder = null;
        if (video == null) {
            hlsfinder = content.match(/sources\[\"hls\"\] = .*?\(\[(.*?)]\);/);
            if (hlsfinder != null && hlsfinder.length == 2) {
                var hlsarray = hlsfinder[1].replaceAll("'", "").split(",");
                var p02 = hlsarray.join("").split("").reverse().join("");
                video = atob(p02);
            }
        }

        if (video == null) {
            hlsfinder = content.match(/'hls': '(.*?)'/);
            if (hlsfinder != null && hlsfinder.length == 2) {
                video = atob(hlsfinder[1].replaceAll("'", ""));
            }
        }
    }
    //#endregion

    //#region Streamtape
    if (
        document.location.hostname.includes("streamtape.") ||
        document.location.hostname.includes("str.") ||
        document.location.hostname.includes("tapecontent.") ||
        document.location.hostname.includes("stape.") ||
        document.location.hostname.includes("adblockstrtech.")
    ) {
        retry = true;

        videoNode = document.querySelectorAll("div[id*='link']");
        var bFound = false;
        for (const link of Object.values(videoNode)) {
            var url = "https:" + link.textContent;
            if (
                !bFound &&
                url.includes(document.location.hostname + "/get_video?id=")
            ) {
                bFound = true;
                video = url;
            }
        }
    }
    //#endregion

    //#region Vidoza
    if (document.location.hostname.includes("vidoza.") ||
        document.location.hostname.includes("videzz.")
    ) {
        retry = true;

        videoNode = document.querySelectorAll(
            "video[id*='html5_api'][class*='vjs-tech']>source[type*='video/mp4'][src]"
        );
        if (videoNode.length > 0) {
            video = videoNode[0].getAttribute("src");
        }
    }
    //#endregion

    //#region StreamZ
    if (
        document.location.hostname.includes("streamz.ws") ||
        document.location.hostname.includes("streamzz.to")
    ) {
        retry = true;

        videoNode = document.querySelectorAll("video[id*='video_1_html5_api']");
        if (videoNode.length > 0) {
            video = videoNode[0].getAttribute("src");
        }
    }
    //#endregion

    //#region Evoload
    if (document.location.hostname.includes("evoload.")) {
        retry = true;

        videoNode = document.querySelectorAll("video[id*='EvoVid_html5_api']");
        if (videoNode.length > 0) {
            video = videoNode[0].getAttribute("src");
        }
    }
    //#endregion

    //#region Doodstream
    if (document.location.hostname.includes("dood.")) {
        retry = true;

        videoNode = document.querySelectorAll(
            "video[id*='html5_api'][class*='vjs-tech'][src]"
        );
        if (videoNode.length > 0) {
            video = videoNode[0].getAttribute("src");
        }
    }
    //#endregion

    //#region Speedfiles
    if (document.location.hostname.includes("speedfiles.")) {
        retry = true;

        videoNode = document.querySelectorAll(
            "video[id*='my-video_html5_api'][class*='vjs-tech'][src]"
        );
        if (videoNode.length > 0) {
            video = videoNode[0].getAttribute("src");
        }
    }
    //#endregion

    //repeat if isnt found
    if (video == null && retry) {
        await sleep(500);
        return await getVideoSrc();
    }

    return video;
}

async function sleep(timeout) {
    await new Promise((r) => setTimeout(r, timeout));
}

async function waitForFound(selector, count, timeout, currentcount = 0) {
    var targetNode = document.querySelectorAll(selector);
    if (targetNode.length > 0) return targetNode;
    if (currentcount < count) {
        await sleep(timeout);
        return waitForFound(selector, count, timeout, currentcount + 1);
    } else {
        return null;
    }
}

function isString(x) {
    return Object.prototype.toString.call(x) === "[object String]";
}

main()