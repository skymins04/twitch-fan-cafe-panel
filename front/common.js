let token, userId, options, bannerNum;

const defaultDevAPIURL = `http://localhost:8888/api/cafelist`;

const defaultPannelTitle = "팬카페 트위치 패널";
const defaultToastMsgLinkCopy = "복사되었습니다!";
const defaultFailedScreenSaverText = "게시판을 불러올 수 없습니다.";
const defaultLoadingScreenSaverText = "게시판 로딩중";
const defaultBannerSlideInterval = 4000;

const twitch = window.Twitch.ext;
twitch.onContext((context) => {});
twitch.onAuthorized((auth) => {
  token = auth.token;
  userId = auth.userId;
});
twitch.configuration.onChanged(function () {
  if (twitch.configuration.broadcaster) {
    try {
      const config = JSON.parse(twitch.configuration.broadcaster.content);
      options = config;

      if (!options.apiURL) options.apiURL = defaultDevAPIURL;

      if (!options.cafeId)
        options.cafeId = {
          naverCafe: "",
          tgd: "",
        };

      if (!options.banners) options.banners = [];

      if (!options.tabs) options.tabs = [];

      if (!options.panelTitle) options.pannelTitle = defaultPannelTitle;
      else if (options.panelTitle.trim() === "")
        options.panelTitle = defaultPannelTitle;

      if (!options.toastMsgLinkCopy)
        options.toastMsgLinkCopy = defaultToastMsgLinkCopy;
      else if (options.toastMsgLinkCopy.trim() === "")
        options.toastMsgLinkCopy = defaultToastMsgLinkCopy;

      if (!options.bannerSlideInterval)
        options.bannerSlideInterval = defaultBannerSlideInterval;
      else if (options.bannerSlideInterval < 1000)
        options.bannerSlideInterval = 1000;

      if (!options.loadingScreenSaverText)
        options.loadingScreenSaverText = defaultLoadingScreenSaverText;
      else if (options.loadingScreenSaverText.trim() === "")
        options.loadingScreenSaverText = defaultLoadingScreenSaverText;

      if (!options.failedScreenSaverText)
        options.failedScreenSaverText = defaultFailedScreenSaverText;
      else if (options.failedScreenSaverText.trim() === "")
        options.failedScreenSaverText = defaultFailedScreenSaverText;
    } catch (e) {
      console.log("invalid config");
      setDefaultSetting();
    }
    updateOptions();
  }
});

function setDefaultSetting() {
  options = {
    apiURL: defaultDevAPIURL,
    cafeId: {
      naverCafe: "",
      tgd: "",
    },
    banners: [],
    tabs: [],
    pannelTitle: defaultPannelTitle,
    toastMsgLinkCopy: defaultToastMsgLinkCopy,
    bannerSlideInterval: defaultBannerSlideInterval,
    loadingScreenSaverText: defaultLoadingScreenSaverText,
    failedScreenSaverText: defaultFailedScreenSaverText,
  };
}

function setDefaultGeneralSetting() {
  options.apiURL = defaultDevAPIURL;
  options.cafeId = {
    naverCafe: "",
    tgd: "",
  };
  options.pannelTitle = defaultPannelTitle;
  options.toastMsgLinkCopy = defaultToastMsgLinkCopy;
  options.bannerSlideInterval = defaultBannerSlideInterval;
  options.loadingScreenSaverText = defaultLoadingScreenSaverText;
  options.failedScreenSaverText = defaultFailedScreenSaverText;
}

function setDefaultBoardsSetting() {
  options.tabs = [];
}

function setDefaultBannersSetting() {
  options.banners = [];
}
