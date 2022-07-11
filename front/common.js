let token, userId, options;
const defaultPannelTitle = "NaverCafe 트위치 패널";
const defaultToastMsgLinkCopy = "복사되었습니다!";
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

      if (!options.cafeId) options.cafeId = "";

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
    } catch (e) {
      console.log("invalid config");
      setDefaultSetting();
    }
    updateOptions();
  }
});

function setDefaultSetting() {
  options = {
    cafeId: "",
    banners: [],
    tabs: [],
    pannelTitle: defaultPannelTitle,
    toastMsgLinkCopy: defaultToastMsgLinkCopy,
    bannerSlideInterval: defaultBannerSlideInterval,
  };
}
