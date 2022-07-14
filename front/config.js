function updateOptions() {
  const config = options;

  /**
   * 메뉴 탭 클릭 이벤트
   */
  $(document).on("click", ".nav-link", function () {
    $(".nav-link").removeClass("active");
    $(this).addClass("active");
    $(".tab").hide();
    const tabId = $(this).attr("data-tab-id");
    $(`.tab[data-tab-id="${tabId}"]`).show();
  });

  function saveOptions() {
    twitch.configuration.set(
      "broadcaster",
      twitch.configuration.broadcaster.version,
      JSON.stringify(options)
    );
    const toast = new bootstrap.Toast(document.getElementById("saveToast"));
    toast.show();
  }

  function setBannerSpeed(value) {
    $("#banner-speed").val(value);
    $("#banner-speed-text").text(`${value / 1000}`);
  }

  function resetConfigGeneral() {
    $("#pannel-title-input").val(config.pannelTitle);
    $("#pannel-title-input").change(function (e) {
      config.pannelTitle = $(this).val();
    });
    $("#pannel-naver-cafe-id-input").val(config.cafeId.naverCafe);
    $("#pannel-naver-cafe-id-input").change(function (e) {
      config.cafeId.naverCafe = $(this).val();
    });
    $("#pannel-tgd-id-input").val(config.cafeId.tgd);
    $("#pannel-tgd-id-input").change(function (e) {
      config.cafeId.tgd = $(this).val();
    });
    $("#pannel-loading-text-input").val(config.loadingScreenSaverText);
    $("#pannel-loading-text-input").change(function (e) {
      config.loadingScreenSaverText = $(this).val();
    });
    $("#pannel-failed-text-input").val(config.failedScreenSaverText);
    $("#pannel-failed-text-input").change(function (e) {
      config.failedScreenSaverText = $(this).val();
    });
    $("#pannel-copy-text-input").val(config.toastMsgLinkCopy);
    $("#pannel-copy-text-input").change(function (e) {
      config.toastMsgLinkCopy = $(this).val();
    });
    $("#pannel-api-url-input").val(config.apiURL);
    $("#pannel-api-url-input").change(function (e) {
      config.apiURL = $(this).val();
    });
  }

  function resetConfigBanners() {
    setBannerSpeed(config.bannerSlideInterval);
    $("#banner-speed").on("input", function (e) {
      config.bannerSlideInterval = parseInt($(this).val());
      setBannerSpeed(config.bannerSlideInterval);
    });
  }

  $(document).on("click", ".btn-general-reset", function (event) {
    setDefaultGeneralSetting();
    resetConfigGeneral();
  });
  $(document).on("click", ".btn-general-save", function (event) {
    options.pannelTitle = config.pannelTitle;
    options.cafeId.naverCafe = config.cafeId.naverCafe;
    options.cafeId.tgd = config.cafeId.tgd;
    options.loadingScreenSaverText = config.loadingScreenSaverText;
    options.failedScreenSaverText = config.failedScreenSaverText;
    options.toastMsgLinkCopy = config.toastMsgLinkCopy;
    options.apiURL = config.apiURL;
    saveOptions();
  });

  resetConfigGeneral();
  resetConfigBanners();
}
