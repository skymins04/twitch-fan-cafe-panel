function updateOptions() {
  const config = options;

  window.getConfig = function () {
    return config;
  };

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

  /**
   * Options를 저장하는 함수
   */
  function saveOptions() {
    twitch.configuration.set(
      "broadcaster",
      twitch.configuration.broadcaster.version,
      JSON.stringify(options)
    );
    const toast = new bootstrap.Toast(document.getElementById("saveToast"));
    toast.show();
  }

  /**
   * 배너 재생속도 관련 엘리먼트를 설정하는 함수
   * @param {number} value
   */
  function setBannerSpeed(value) {
    $("#banner-speed").val(value);
    $("#banner-speed-text").text(`${value / 1000}`);
  }

  /**
   * 기본설정 페이지 업데이트 함수
   */
  function updateConfigGeneral() {
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

  /**
   * 게시판설정 페이지 업데이트 함수
   */
  function updateConfigBoards() {
    $(".item-boards").empty();
    config.tabs.forEach((itm, idx) => {
      const template = `
        <div class="w-100 border rounded pt-2 pb-2 ps-3 pe-3 mb-2 d-flex justify-content-between align-items-center gap-4 item-board">
          <span class="fs-6 text-nowrap d-block h-100">게시판${idx + 1}</span>
          <div class="w-100 p-3 bg-light border rounded">
            <table class="w-100">
              <tr>
                <td class="text-secondary">게시판명</td>
                <td>
                  <input type="text" class="form-control board-title" value="${
                    itm.title
                  }"/>
                  <div class="help-info"><div class="text">탭에 표시될 게시판의 이름입니다.</div></div>
                </td>
              </tr>
              <tr>
                <td class="text-secondary">플랫폼</td>
                <td>
                  <select class="form-select board-type">
                    <option value="naver-cafe" ${
                      itm.type === "naver-cafe" ? "selected" : ""
                    }>네이버카페</option>
                    <option value="tgd" ${
                      itm.type === "tgd" ? "selected" : ""
                    }>트게더</option>
                  </select>
                  <div class="help-info"><div class="text">게시판을 가져올 플랫폼입니다. [기본설정]에서 사용할 플랫폼의 ID 설정이 되어있어야 합니다.</div></div>
                </td>
              </tr>
              <tr>
                <td class="text-secondary">게시판ID</td>
                <td>
                  <input type="text" class="form-control board-menuid" value="${
                    itm.menuId
                  }"/>
                  <div class="help-info"><div class="text">가져올 게시판의 ID입니다. 네이버카페는 게시판 페이지 주소 내 search.menuid의 값을 복사하여 붙여넣습니다. 트게더는 주소 내 category의 값을 복사하여 붙여넣습니다.</div></div>
                </td>
              </tr>
              <tr>
                <td class="text-secondary">게시글개수</td>
                <td>
                  <div class="input-group">
                    <select class="form-select board-count">
                      <option value="5" ${
                        itm.count === 5 ? "selected" : ""
                      }>5</option>
                      <option value="10" ${
                        itm.count === 10 ? "selected" : ""
                      }>10</option>
                      <option value="15" ${
                        itm.count === 15 ? "selected" : ""
                      }>15</option>
                      <option value="20" ${
                        itm.count === 20 ? "selected" : ""
                      }>20</option>
                      <option value="30" ${
                        itm.count === 30 ? "selected" : ""
                      }>30</option>
                      <option value="40" ${
                        itm.count === 40 ? "selected" : ""
                      }>40</option>
                      <option value="50" ${
                        itm.count === 50 ? "selected" : ""
                      }>50</option>
                    </select>
                    <label class="input-group-text">개</label>
                  </div>
                  <div class="help-info"><div class="text">가져올 게시판의 개시글 최대 개수입니다(공지글은 이 개수에 포함되지 않습니다.)</div></div>
                </td>
              </tr>
              <tr>
                <td class="text-secondary">공지글숨기기</td>
                <td>
                  <div class="input-group form-switch"><input type="checkbox" class="form-check-input mt-2 board-skipnotice" ${
                    itm.skipNotice ? "checked" : ""
                  }/></div>
                  <div class="help-info"><div class="text">공지글 숨기기를 활성화하면 게시글을 가져올 때 공지글은 가져오지 않습니다.</div></div>
                </td>
              </tr>
              <tr>
                <td></td>
                <td>
                  <div class="btn-group float-end mt-3" role="group">
                    <button type="button" class="btn btn-danger btn-sm btn-boards-del">삭제</button>
                  </div>
                </td>
              </tr>
            </table>
          </div>
        </div>
      `;
      const board = $(template);
      $(".item-boards").append(board);
    });

    $(document).on("change", ".board-title", function (e) {
      $(".board-title").each((idx, itm) => {
        config.tabs[idx].title = $(itm).val();
      });
    });
    $(document).on("change", ".board-type", function (e) {
      $(".board-type").each((idx, itm) => {
        config.tabs[idx].type = $(itm).val();
      });
    });
    $(document).on("change", ".board-menuid", function (e) {
      $(".board-menuid").each((idx, itm) => {
        config.tabs[idx].menuId = $(itm).val();
      });
    });
    $(document).on("change", ".board-count", function (e) {
      $(".board-count").each((idx, itm) => {
        config.tabs[idx].count = parseInt($(itm).val());
      });
    });
    $(document).on("click", ".board-skipnotice", function (e) {
      $(".board-skipnotice").each((idx, itm) => {
        config.tabs[idx].skipNotice = $(itm).prop("checked");
      });
    });
  }

  /**
   * 배너설정 페이지 업데이트 함수
   */
  function updateConfigBanners() {
    setBannerSpeed(config.bannerSlideInterval);
    $("#banner-speed").on("input", function (e) {
      config.bannerSlideInterval = parseInt($(this).val());
      setBannerSpeed(config.bannerSlideInterval);
    });

    $(".item-banners").empty();

    config.banners.forEach((itm, idx) => {
      const template = `
        <div class="w-100 border rounded pt-2 pb-2 ps-3 pe-3 bg-light d-flex justify-content-between align-items-center gap-4 item-banner">
          <span class="fs-6 text-nowrap d-block h-100 text-secondary">배너${
            idx + 1
          }</span>
          <input type="text" class="form-control banner-url" placeholder="ex) https://cdn.jsdelivr.net/gh/testuser/image-cdn/test.png" value="${itm}"/>
          <button type="button" class="btn btn-danger btn-sm text-nowrap btn-banners-del">삭제</button>
        </div>
      `;
      const banner = $(template);
      $(".item-banners").append(banner);
    });

    $(document).on("change", ".banner-url", function (e) {
      $(".banner-url").each((idx, itm) => {
        config.banners[idx] = $(itm).val();
      });
    });
  }

  /**
   * 기본설정 초기화/저장 버튼 이벤트 핸들러
   */
  $(document).on("click", ".btn-general-reset", function (event) {
    setDefaultGeneralSetting();
    updateConfigGeneral();
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

  /**
   * 게시판설정 삭제/초기화/게시판추가/저장 버튼 이벤트 핸들러
   */
  $(document).on("click", ".btn-boards-del", function (event) {
    const boardIdx = $(this)
      .parent()
      .parent()
      .parent()
      .parent()
      .parent()
      .parent()
      .parent()
      .index();
    if (boardIdx > -1) config.tabs.splice(boardIdx, 1);
    updateConfigBoards();
    const toast = new bootstrap.Toast(document.getElementById("delToast"));
    toast.show();
  });
  $(document).on("click", ".btn-boards-reset", function (event) {
    setDefaultBoardsSetting();
    updateConfigBoards();
  });
  $(document).on("click", ".btn-boards-add", function (event) {
    if (config.tabs.length < 4) {
      config.tabs.push({
        title: "",
        type: "naver-cafe",
        menuId: "",
        count: 15,
        skipNotice: false,
      });
      updateConfigBoards();
    }
  });
  $(document).on("click", ".btn-boards-save", function (event) {
    options.tabs = config.tabs;
    saveOptions();
  });

  /**
   * 배너설정 삭제/초기화/배너추가/저장 버튼 이벤트 핸들러
   */
  $(document).on("click", ".btn-banners-del", function (event) {
    const bannerIdx = $(this).parent().index();
    if (bannerIdx > -1) config.banners.splice(bannerIdx, 1);
    updateConfigBanners();
    const toast = new bootstrap.Toast(document.getElementById("delToast"));
    toast.show();
  });
  $(document).on("click", ".btn-banners-reset", function (event) {
    setDefaultBannersSetting();
    updateConfigBanners();
  });
  $(document).on("click", ".btn-banners-add", function (event) {
    config.banners.push("");
    updateConfigBanners();
  });
  $(document).on("click", ".btn-banners-save", function (event) {
    options.banners = config.banners;
    saveOptions();
  });

  updateConfigGeneral();
  updateConfigBoards();
  updateConfigBanners();
}
