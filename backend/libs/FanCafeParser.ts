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

      for (let i = 0; i < $noticeTitles.length; i++) {
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
          cmt: parseInt($content($noticeComments[i]).text()),
          isNotice: true,
        });
      }
    }
    const $normalTitles = $normalArticles.find("a.article");
    const $normalComments = $normalArticles.find("a.cmt em");
    const $normalAuthors = $normalArticles.find("td.p-nick");
    const $normalDates = $normalArticles.find("td.td_date");

    for (let i = 0; i < $normalTitles.length; i++) {
      articles.push({
        articleTitle: $content($normalTitles[i])
          .text()
          .replace(/(\n|\t)/g, "")
          .trim()
          .replace(/ +/g, " "),
        url: `https://cafe.naver.com${$content($normalTitles[i]).attr("href")}`,
        author: $content($normalAuthors[i]).text(),
        date: $content($normalDates[i]).text(),
        cmt: parseInt($content($normalComments[i]).text()),
        isNotice: false,
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
      const $noticeArticleTitles = $content(
        "div#article-list div.article-list-row.notice div.list-title a"
      );
      const $normalArticleTitles = $content(
        "div#article-list div.article-list-row:not(.notice) div.list-title a"
      );

      if (!skipNotice) {
        $noticeArticleTitles.each((idx, ele) => {
          const title = $content(ele).attr("title");
          const href = $content(ele).attr("href");
          if (title && href) {
            noticeArticles.push({
              articleTitle: title
                .replace(/(\n|\t)/g, "")
                .trim()
                .replace(/ +/g, " "),
              url: `https://tgd.kr${href}`,
              isNotice: true,
            });
          }
        });
      }

      $normalArticleTitles.each((idx, ele) => {
        const title = $content(ele).attr("title");
        const href = $content(ele).attr("href");
        if (nomarlArticles.length >= count) return;
        else if (title && href) {
          nomarlArticles.push({
            articleTitle: title
              .replace(/(\n|\t)/g, "")
              .trim()
              .replace(/ +/g, " "),
            url: `https://tgd.kr${href}`,
            isNotice: false,
          });
        }
      });

      if (
        (pageNum !== 1 && $normalArticleTitles.length !== 30) ||
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
