let bannerNum;

/*

https://cafe.naver.com/ArticleList.nhn?search.clubid=30754208&search.menuid=24&userDisplay=30&search.boardtype=L&search.totalCount=1&search.cafeId=30754208&search.page=1

title
cafeId
menuId
userDisplay
skipNotice

*/

/**
 * Twitch Configuration 로드 완료시 실행되는 함수
 */
function updateOptions() {
  console.log(options);
  if (options.banners.length === 0) {
    bannerNum = 0;
    $(".main").addClass("no-banner");
  } else {
    const { banners } = options;
    for (const url of banners) {
      console.log("hahaha", url);
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

  if (options.tabs.length === 0) {
    $(".main").addClass("no-tab");
    $("#failed-screen-saver").html("설정된 글목록이 없습니다.");
  } else {
  }

  initClipboardJS(() => {
    createToast(options.toastMsgLinkCopy);
  });
  setTimeout(UIinit, 100);
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

  $(".header-title:first").html(options.pannelTitle);

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
