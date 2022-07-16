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
   * 네이버카페 글목록 파싱 함수
   * @param {string} cafeId
   * @param {string} menuId
   * @param {number} count
   * @param {boolean} skipNotice
   * @returns
   */
  naverCafeParser: Parser = async (cafeId, menuId, count, skipNotice) => {
    const url = `https://cafe.naver.com/ArticleList.nhn?search.clubid=${cafeId}&search.menuid=${menuId}&userDisplay=${count}&search.boardtype=L&search.cafeId=${cafeId}&search.page=1`;
    const $content = $.load(
      await axios
        .default({ url, method: "GET", responseType: "arraybuffer" })
        .then((res) => iconv.decode(res.data, "EUC-KR"))
    );

    const $noticeArticleList = $content(
      "div.article-board div.inner_list a.article"
    );
    const $normalArticleList = $content(
      "div.article-board:not(#upperArticleList) div.inner_list a.article"
    );

    const articles: Array<CafeArticle> = [];
    if (!skipNotice) {
      $noticeArticleList.each((idx, ele) => {
        articles.push({
          articleTitle: $content(ele)
            .text()
            .replace(/(\n|\t)/g, "")
            .trim()
            .replace(/ +/g, " "),
          url: `https://cafe.naver.com${$content(ele).attr("href")}`,
          isNotice: true,
        });
      });
    }
    $normalArticleList.each((idx, ele) => {
      articles.push({
        articleTitle: $content(ele)
          .text()
          .replace(/(\n|\t)/g, "")
          .trim()
          .replace(/ +/g, " "),
        url: `https://cafe.naver.com${$content(ele).attr("href")}`,
        isNotice: false,
      });
    });

    return {
      articles,
      type: "naver-cafe",
    };
  };
}

const fanCafeParser = new FanCafeParser();

export default fanCafeParser;
