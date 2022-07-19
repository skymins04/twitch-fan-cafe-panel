function randomNum(min, max) {
  var randNum = Math.floor(Math.random() * (max - min + 1)) + min;
  return randNum;
}

/**
 * Twitch Configuration 로드 완료시 실행되는 함수
 */
function updateOptions() {
  $("#loading-screen-saver .text").html(options.loadingScreenSaverText);
  $(".header-title:first").html(options.panelTitle);

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
    $(document).on("click", ".tab-btn", function (event) {
      const tabNo = $(this).attr("data-tab-no");
      $(".tab-btn").removeClass("selected");
      $(this).addClass("selected");
      $(".tab-content").hide();
      $(`.tab-content[data-tab-no="${tabNo}"]`).show();
    });
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
      url: options.apiURL,
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
          tabBtn.html(options.tabs[i].title);

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
              `<div class="title">${noticeTag}<span class="idx">${
                j + 1
              }</span><span class="dot">.</span><span class="text">${
                article.articleTitle
              }</span></div>`
            );
            const tabContentItemMeta = $(`
              <div class="meta">
                <span class="date"><svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512"><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M224 256c70.7 0 128-57.31 128-128s-57.3-128-128-128C153.3 0 96 57.31 96 128S153.3 256 224 256zM274.7 304H173.3C77.61 304 0 381.6 0 477.3c0 19.14 15.52 34.67 34.66 34.67h378.7C432.5 512 448 496.5 448 477.3C448 381.6 370.4 304 274.7 304z"/></svg><span class="text">${article.date}</span></span>
                <span class="comment"><svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M256 32C114.6 32 .0272 125.1 .0272 240c0 49.63 21.35 94.98 56.97 130.7c-12.5 50.37-54.27 95.27-54.77 95.77c-2.25 2.25-2.875 5.734-1.5 8.734C1.979 478.2 4.75 480 8 480c66.25 0 115.1-31.76 140.6-51.39C181.2 440.9 217.6 448 256 448c141.4 0 255.1-93.13 255.1-208S397.4 32 256 32z"/></svg><span class="text">${article.cmt}</span></span>
                <span class="author"><svg class="icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><!--! Font Awesome Pro 6.1.1 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license (Commercial License) Copyright 2022 Fonticons, Inc. --><path d="M421.7 220.3L188.5 453.4L154.6 419.5L158.1 416H112C103.2 416 96 408.8 96 400V353.9L92.51 357.4C87.78 362.2 84.31 368 82.42 374.4L59.44 452.6L137.6 429.6C143.1 427.7 149.8 424.2 154.6 419.5L188.5 453.4C178.1 463.8 165.2 471.5 151.1 475.6L30.77 511C22.35 513.5 13.24 511.2 7.03 504.1C.8198 498.8-1.502 489.7 .976 481.2L36.37 360.9C40.53 346.8 48.16 333.9 58.57 323.5L291.7 90.34L421.7 220.3zM492.7 58.75C517.7 83.74 517.7 124.3 492.7 149.3L444.3 197.7L314.3 67.72L362.7 19.32C387.7-5.678 428.3-5.678 453.3 19.32L492.7 58.75z"/></svg><span class="text">${article.author}</span</span>
              </div>
            `);
            tabContentItem.append(tabContentItemTitle);
            tabContentItem.append(tabContentItemMeta);
            tabContentItem.attr("data-clipboard-text", article.url);
            tabContentItem.attr("data-article-no", j + 1);
            tabContentItem.addClass("item");
            tabContentItem.addClass((j + 1) % 2 == 1 ? "odd" : "even");
            tabContentItem.addClass(`ran2_${randomNum(0, 1)}`);
            tabContentItem.addClass(`ran3_${randomNum(0, 2)}`);
            tabContentItem.addClass(`ran4_${randomNum(0, 3)}`);
            tabContentItem.addClass(`ran5_${randomNum(0, 5)}`);
            if (article.isNotice) tabContentItem.addClass("item-notice");
            if (article.isOwner) tabContentItem.addClass("owner");
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
