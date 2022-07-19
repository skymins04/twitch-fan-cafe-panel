import * as axios from "axios";
import * as iconv from "iconv-lite";
import * as $ from "cheerio";

/**
 * 팬카페 지원 플랫폼 (naver-cafe: 네이버 카페, tgd: 트게더)
 */
type FanCafePlatforms = "naver-cafe" | "tgd";

/**
 * 팬카페 게시글
 */
interface CafeArticle {
  articleTitle: string;
  url: string;
  author: string;
  date: string;
  cmt: number;
  isNotice: boolean;
  isOwner: boolean;
}

/**
 * 팬카페 게시판 Parser 응답형식
 */
interface ParserResponse {
  articles: Array<CafeArticle>;
  type: FanCafePlatforms;
}

/**
 * 팬카페 게시판
 */
type Parser = (
  cafeId: string,
  menuId: string,
  count: number,
  skipNotice: boolean
) => Promise<ParserResponse>;

class FanCafeParser {
  constructor() {}

  /**
   * axios 요청 기본 헤더
   */
  readonly defaultHeader = {
    "Access-Control-Allow-Origin": "*",
  };

  /**
   * 오류응답
   */
  readonly failResponse = {
    statusCode: 400,
    headers: this.defaultHeader,
  };

  /**
   * 네이버카페 게시판 글목록 파싱 함수
   * @param {string} cafeId
   * @param {string} menuId
   * @param {number} count
   * @param {boolean} skipNotice
   * @returns
   */
  naverCafeParser: Parser = async (cafeId, menuId, count, skipNotice) => {
    if (!cafeId.match(/^[0-9]+$/) || !menuId.match(/^[0-9]+$/))
      return { articles: [], type: "naver-cafe" };

    const url = `https://cafe.naver.com/ArticleList.nhn?search.clubid=${cafeId}&search.menuid=${menuId}&userDisplay=${count}&search.boardtype=L&search.cafeId=${cafeId}&search.page=1`;
    const articles: Array<CafeArticle> = [];

    const $content = $.load(
      await axios
        .default({
          url,
          method: "GET",
          responseType: "arraybuffer",
        })
        .then((res) => iconv.decode(res.data, "EUC-KR"))
    );

    const $noticeArticles = $content("div#upperArticleList");
    const $normalArticles = $content(
      "div.article-board:not(#upperArticleList)"
    );

    if (!skipNotice) {
      const $noticeTitles = $noticeArticles.find("a.article");
      const $noticeComments = $noticeArticles.find("a.cmt em");
      const $noticeAuthors = $noticeArticles.find("td.p-nick");
      const $noticeDates = $noticeArticles.find("td.td_date");
      const $noticeIsOwner = $noticeArticles.find("span.mem-level img");

      for (let i = 0; i < $noticeTitles.length; i++) {
        let cmt = parseInt($content($noticeComments[i]).text());
        if (!cmt) cmt = 0;
        articles.push({
          articleTitle: $content($noticeTitles[i])
            .text()
            .replace(/(\n|\t)/g, "")
            .trim()
            .replace(/ +/g, " "),
          url: `https://cafe.naver.com${$content($noticeTitles[i]).attr(
            "href"
          )}`,
          author: $content($noticeAuthors[i]).text(),
          date: $content($noticeDates[i]).text(),
          cmt,
          isNotice: true,
          isOwner:
            $content($noticeIsOwner[i]).attr("src") ===
            "https://cafe.pstatic.net/levelicon/1/1_999.gif"
              ? true
              : false,
        });
      }
    }
    const $normalTitles = $normalArticles.find("a.article");
    const $normalComments = $normalArticles.find("a.cmt em");
    const $normalAuthors = $normalArticles.find("td.p-nick");
    const $normalDates = $normalArticles.find("td.td_date");
    const $normalIsOwner = $normalArticles.find("span.mem-level img");

    for (let i = 0; i < $normalTitles.length; i++) {
      let cmt = parseInt($content($normalComments[i]).text());
      if (!cmt) cmt = 0;
      articles.push({
        articleTitle: $content($normalTitles[i])
          .text()
          .replace(/(\n|\t)/g, "")
          .trim()
          .replace(/ +/g, " "),
        url: `https://cafe.naver.com${$content($normalTitles[i]).attr("href")}`,
        author: $content($normalAuthors[i]).text(),
        date: $content($normalDates[i]).text(),
        cmt,
        isNotice: false,
        isOwner:
          $content($normalIsOwner[i]).attr("src") ===
          "https://cafe.pstatic.net/levelicon/1/1_999.gif"
            ? true
            : false,
      });
    }

    return {
      articles,
      type: "naver-cafe",
    };
  };

  /**
   * 트게더 게시판 글목록 파싱 함수
   * @param {string} cafeId
   * @param {string} menuId
   * @param {number} count
   * @param {boolean} skipNotice
   * @returns
   */
  tgdParser: Parser = async (cafeId, menuId, count, skipNotice) => {
    if (
      !cafeId.match(/^[ㄱ-ㅎ|ㅏ-ㅣ|가-힣|a-z|A-Z|0-9|_]+$/) ||
      !menuId.match(/^[0-9]+$/)
    )
      return { articles: [], type: "tgd" };

    let pageNum = 0;
    const articles: Array<CafeArticle> = [];
    const nomarlArticles: Array<CafeArticle> = [];
    const noticeArticles: Array<CafeArticle> = [];

    while (true) {
      const url = `https://tgd.kr/s/${cafeId}/page/${pageNum}?category=${menuId}`;
      const $content = $.load(
        await axios.default({ url, method: "GET" }).then((res) => res.data)
      );

      const $noticeArticles = $content(
        "div#article-list div.article-list-row.notice"
      );
      const $normalArticles = $content(
        "div#article-list div.article-list-row:not(.notice)"
      );

      if (!skipNotice) {
        const $noticeTitles = $noticeArticles.find("div.list-title a");
        const $noticeComments = $noticeArticles.find("small.comment-count");
        const $noticeAuthors = $noticeArticles.find("div.list-writer span");
        const $noticeDates = $noticeArticles.find("div.list-time");
        const $noticeIsOwner = $noticeArticles.find("div.list-writer img");

        for (let i = 0; i < $noticeTitles.length; i++) {
          const title = $content($noticeTitles[i]).attr("title");
          const href = $content($noticeTitles[i]).attr("href");
          let cmt = parseInt(
            $content($noticeComments[i])
              .text()
              .trim()
              .replace(/(\[|\])/g, "")
          );
          if (!cmt) cmt = 0;
          if (title && href) {
            noticeArticles.push({
              articleTitle: title
                .replace(/(\n|\t)/g, "")
                .trim()
                .replace(/ +/g, " "),
              url: `https://tgd.kr${href}`,
              author: $content($noticeAuthors[i]).text().trim(),
              date: $content($noticeDates[i]).text().trim(),
              cmt,
              isNotice: true,
              isOwner:
                $content($noticeIsOwner[i]).attr("title") === "Broadcaster"
                  ? true
                  : false,
            });
          }
        }
      }

      const $normalTitles = $normalArticles.find("div.list-title a");
      const $normalComments = $normalArticles.find("small.comment-count");
      const $normalAuthors = $normalArticles.find("div.list-writer span");
      const $normalDates = $normalArticles.find("div.list-time");
      const $normalIsOwner = $normalArticles.find("div.list-writer img");

      for (let i = 0; i < $normalTitles.length; i++) {
        const title = $content($normalTitles[i]).attr("title");
        const href = $content($normalTitles[i]).attr("href");
        let cmt = parseInt(
          $content($normalComments[i])
            .text()
            .trim()
            .replace(/(\[|\])/g, "")
        );
        if (!cmt) cmt = 0;
        if (nomarlArticles.length >= count) break;
        else if (title && href) {
          nomarlArticles.push({
            articleTitle: title
              .replace(/(\n|\t)/g, "")
              .trim()
              .replace(/ +/g, " "),
            url: `https://tgd.kr${href}`,
            author: $content($normalAuthors[i]).text().trim(),
            date: $content($normalDates[i]).text().trim(),
            cmt,
            isNotice: false,
            isOwner:
              $content($normalIsOwner[i]).attr("title") === "Broadcaster"
                ? true
                : false,
          });
        }
      }

      if (
        (pageNum !== 1 && $normalTitles.length !== 30) ||
        nomarlArticles.length >= count
      )
        break;

      pageNum += 1;
    }

    articles.push(...noticeArticles);
    articles.push(...nomarlArticles);

    return {
      articles,
      type: "tgd",
    };
  };
}

const fanCafeParser = new FanCafeParser();

export default fanCafeParser;
