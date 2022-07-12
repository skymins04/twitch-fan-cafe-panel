import { Handler } from "@netlify/functions";
import * as axios from "axios";
import * as iconv from "iconv-lite";
import * as $ from "cheerio";

const defaultHeader = {
  "Access-Control-Allow-Origin": "*",
};
const failResponse = {
  statusCode: 400,
  headers: defaultHeader,
};

// 최대 동시 파싱 글목록 수
const MAX_BOARD_NUM = 4;

/**
 * 네이버카페 글목록을 파싱하여 Response로 전달하는 핸들러
 * @param event
 * @param context
 * @returns
 *
 * JSON.parse(event.body as string): {
 *  boards: {title: string, menuId: string, type: 'naver-cafe', count: number, skipNotice: boolean}[]
 * }
 */

const handler: Handler = async (event, context) => {
  if (event.body === null) return failResponse;

  // URL 유효성 검사
  const { cafeId, boards } = JSON.parse(event.body);
  const checkedBoards = [];

  if (!(boards instanceof Array) || boards.length === 0) return failResponse;
  for (const { idx, board } of boards.map((board, idx) => ({ idx, board }))) {
    if (idx === MAX_BOARD_NUM) break;
    else if (
      typeof board.title !== "string" ||
      typeof board.menuId !== "string" ||
      typeof board.count !== "number" ||
      typeof board.type !== "string" ||
      typeof board.skipNotice !== "boolean"
    )
      return failResponse;
    checkedBoards.push(board);
  }

  // 각 URL 별 네이버카페 글목록 데이터 파싱

  const data = [];
  for (const { title, menuId, count, type, skipNotice } of checkedBoards) {
    let c = count;
    switch (count) {
      case 5:
      case 10:
      case 15:
      case 20:
      case 30:
      case 40:
      case 50:
        break;
      default:
        c = 15;
        break;
    }
    switch (type) {
      case "naver-cafe":
        data.push(
          await parseNaverCafe(cafeId.naverCafe, title, menuId, c, skipNotice)
        );
        break;
    }
  }

  return {
    statusCode: 200,
    headers: defaultHeader,
    body: JSON.stringify({
      data,
    }),
  };
};

/**
 * 네이버카페 글목록 파싱 함수
 * @param {string} cafeId
 * @param {string} title
 * @param {string} menuId
 * @param {number} count
 * @param {boolean} skipNotice
 * @returns
 */
const parseNaverCafe = async (
  cafeId: string,
  title: string,
  menuId: string,
  count: number,
  skipNotice: boolean
) => {
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

  const articles: { title: string; url: string; isNotice: boolean }[] = [];
  if (!skipNotice) {
    $noticeArticleList.each((idx, ele) => {
      articles.push({
        title: $content(ele)
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
      title: $content(ele)
        .text()
        .replace(/(\n|\t)/g, "")
        .trim()
        .replace(/ +/g, " "),
      url: `https://cafe.naver.com${$content(ele).attr("href")}`,
      isNotice: false,
    });
  });
  return {
    title,
    articles,
    type: "naver-cafe",
  };
};

export { handler };
