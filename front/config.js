var bannerNum = 0;

function createToastInfo(msg) {
  const toast = $(`<div class="toast-info">${msg}</div>`);
  $(document.body).prepend(toast);
  setTimeout(() => {
    toast.remove();
  }, 4000);
}

function updateBannerConfig() {
  const banners = $("#banners .banner input")
    .toArray()
    .map((x) => x.value);
  options.banners = banners;
  twitch.configuration.set(
    "broadcaster",
    twitch.configuration.broadcaster.version,
    JSON.stringify(options)
  );
  createToastInfo("배너 설정이 저장되었습니다!");
}

function addBanner() {
  bannerNum += 1;
  const banner = $(`<div class="banner">
      배너${bannerNum}
      <input
        type="text"
        placeholder="ex) https://cdn.jsdelivr.net/gh/user/repo/test-image.png"
      />
      <div class="del-btn btn">삭제</div>
    </div>`);
  options.banners.push("");
  $("#banners").append(banner);
}

function delBanner() {
  options.banners.splice($(this).parent().index(), 1);
  $(this).parent().remove();
  updateOptions();
  console.log($(this));
}

function onChangeBannerURL() {
  options.banners[$(this).parent().index()] = $(this).val();
}

function updateOptions() {
  const { banners } = options;
  // const banners = [];
  bannerNum = banners.length;
  $("#banners").empty();
  for (const [idx, url] of banners.entries()) {
    const banner = $(`<div class="banner">
      배너${idx + 1}
      <input
        type="text"
        placeholder="ex) https://cdn.jsdelivr.net/gh/user/repo/test-image.png"
        value="${url}"
      />
      <div class="del-btn btn">삭제</div>
    </div>`);
    $("#banners").append(banner);
  }
}

// Function to save the streamer's WYR options
$(function () {
  $("#add-banner-btn").click(addBanner);
  $("#config-banner-save-btn").click(updateBannerConfig);
  $(document).on("click", ".banner .del-btn", delBanner);
  $(document).on("change", ".banner input", onChangeBannerURL);
});
