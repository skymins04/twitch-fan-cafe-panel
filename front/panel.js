let panelTitle = "NaverCafe 트위치 패널";

$(() => {
  setTimeout(UIinit, 100);
});

/**
 * CSS로 처리 불가능한 스타일 연산 모듈
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

  $(".header-title:first").html(panelTitle);

  $("#loading-screen-saver").hide();
}
