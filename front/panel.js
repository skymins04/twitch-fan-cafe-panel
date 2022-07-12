/**
 * Twitch Configuration 로드 완료시 실행되는 함수
 */
function updateOptions() {
  $("#loading-screen-saver .text").html(options.loadingScreenSaverText);
  $(".header-title:first").html(options.pannelTitle);

  console.log(options);
  if (options.banners.length === 0) {
    bannerNum = 0;
    $(".main").addClass("no-banner");
  } else {
    const { banners } = options;
    for (const url of banners) {
      const banner = $(`<div></div>`);
      banner.addClass("item");
      banner.css("background-image", `url(${url})`);
      $("#slider").append(banner);
    }
    $("#slider").css("width", `${banners.length * 100}%`);
    $("#slider .item").css("width", `${100 / banners.length}%`);
    bannerNum = banners.length;
    startBannerSlide();
  }

  if (
    options.tabs.length === 0 ||
    options.cafeId.naverCafe.trim() === "" ||
    !options.cafeId.naverCafe.match(/^[0-9]+$/)
  ) {
    $(".main").addClass("no-tab");
    showFailedScreenSaver("설정된 글목록이 없습니다.");
  } else {
  }

  initClipboardJS(() => {
    createToast(options.toastMsgLinkCopy);
  });
  getCafeList(() => {
    setTimeout(UIinit, 100);
  });
}

/**
 * CSS로 처리 불가능한 스타일 연산 및 적용 함수
 */
function UIinit() {
  const docStyle = getComputedStyle(document.documentElement);
  const globalPadding2 = parseInt(
    docStyle.getPropertyValue("--global-padding-2")
  );

  const tabBtnsWidth = $(".tab-btns:first").width();
  $(".tab-btn").width(tabBtnsWidth / $(".tab-btn").length);

  const tabBtnsHeight = $(".tab-btns:first").height();
  const tabContentsHeight = $(".tab-contents:first").height();
  $(".tab-contents").height(tabContentsHeight - tabBtnsHeight);
  $(".tab-btn").height(tabBtnsHeight - globalPadding2 * 2);

  $("#loading-screen-saver").hide();
}

/**
 * ClipboardJS 초기화 함수
 * @param {() => void} callback
 */
function initClipboardJS(callback) {
  const clipboard = new ClipboardJS(".tab-content .item");
  clipboard.on("success", function (event) {
    callback();
  });
  clipboard.on("error", function (event) {
    console.log(event);
  });
}

/**
 * Toast 알림 생성 함수
 * @param {string} msg
 */
function createToast(msg) {
  const toast = $(`<div class="toast-info">${msg}</div>`);
  $("#toast-viewport").append(toast);
  setTimeout(() => {
    toast.remove();
  }, 5500);
}

/**
 * 배너의 슬라이드쇼를 실행하는 함수
 */
function startBannerSlide() {
  if (bannerNum !== 0) {
    let sliderNum = 0;
    setInterval(() => {
      if (sliderNum !== bannerNum - 1) {
        $("#slider").animate({ left: "-=100%" }, 400);
        sliderNum += 1;
      } else {
        $("#slider").animate({ left: "0" }, 600);
        sliderNum = 0;
      }
    }, options.bannerSlideInterval);
    $(".banner-viewport").show();
  }
}

/**
 * 실패화면을 띄우는 함수
 * @param {string} msg
 */
function showFailedScreenSaver(msg) {
  $("#failed-screen-saver").html(msg);
  $("#loading-screen-saver").hide();
}

/**
 * 게시판 글목록을 가져오고 탭을 생성하는 함수
 * @param {() => void} callback
 */
function getCafeList(callback) {
  const reqParam = {
    cafeId: options.cafeId,
    boards: options.tabs,
  };
  if (reqParam.boards.length === 0) {
    $(".main").addClass("no-tab");
    showFailedScreenSaver(options.failedScreenSaverText);
  } else {
    $.ajax({
      type: "POST",
      url:
        options.mode === "prod"
          ? PROD_API_URL
          : options.mode === "dev"
          ? DEV_API_URL
          : "",
      data: JSON.stringify(reqParam),
      dataType: "text",
    })
      .then((res) => {
        const { data } = JSON.parse(res);
        $(".tab-btns").empty();
        $(".tab-contents").empty();
        data.forEach((itm, i) => {
          const tabBtn = $("<div></div>");
          tabBtn.addClass("tab-btn");
          tabBtn.addClass(itm.type);
          if (i === 0) tabBtn.addClass("selected");
          tabBtn.attr("data-tab-no", i);
          tabBtn.html(itm.title);

          const tabContent = $("<ul></ul>");
          tabContent.addClass("tab-content");
          tabContent.addClass(itm.type);
          tabContent.attr("data-tab-no", i);

          itm.articles.forEach((article, j) => {
            const noticeTag = article.isNotice
              ? `<span class="notice">공지</span>`
              : "";
            const tabContentItem = $("<li></li>");
            const tabContentItemTitle = $(
              `<span class="title">${noticeTag}<span class="idx">${
                j + 1
              }</span><span class="dot">.</span>${article.title}</span>`
            );
            tabContentItem.append(tabContentItemTitle);
            tabContentItem.attr("data-clipboard-text", article.url);
            tabContentItem.addClass("item");
            if (article.isNotice) tabContentItem.addClass("item-notice");
            tabContent.append(tabContentItem);
          });

          $(".tab-btns").append(tabBtn);
          $(".tab-contents").append(tabContent);
        });

        $(".tab-content:first").show();

        callback();
      })
      .catch((e) => {
        $(".main").addClass("no-tab");
        showFailedScreenSaver(options.failedScreenSaverText);
      });
  }
}
