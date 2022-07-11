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
const MAX_BOARD_NUM = 5;

/**
 * 네이버카페 글목록을 파싱하여 Response로 전달하는 핸들러
 * @param event
 * @param context
 * @returns
 *
 * JSON.parse(event.body as string): {
 *  boards: {title: string, url: string, skipNotice: boolean}[]
 * }
 */

const handler: Handler = async (event, context) => {
  if (event.body === null) return failResponse;

  // URL 유효성 검사
  const { boards } = JSON.parse(event.body);

  if (!(boards instanceof Array) || boards.length === 0) return failResponse;
  for (const { idx, board } of boards.map((board, idx) => ({ idx, board }))) {
    if (idx === MAX_BOARD_NUM) break;
    else if (
      typeof board.title !== "string" ||
      typeof board.url !== "string" ||
      typeof board.skipNotice !== "boolean"
    )
      return failResponse;
    else if (
      !board.url.match(
        /^https:\/\/cafe\.naver\.com\/ArticleList\.nhn\?search\.clubid=[0-9]+&search\.menuid=[0-9]+&userDisplay=[0-9]+&search\.boardtype=L&search.cafeId=[0-9]+&search.page=1$/
      )
    )
      return failResponse;
  }

  // 각 URL 별 네이버카페 글목록 데이터 파싱

  const data = [];
  for (const { title, url, skipNotice } of boards) {
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
    data.push({
      title,
      articles,
      type: "naver-cafe",
    });
  }

  return {
    statusCode: 200,
    headers: defaultHeader,
    body: JSON.stringify({
      data,
    }),
  };
};

export { handler };
