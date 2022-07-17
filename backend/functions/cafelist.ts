import { Handler } from "@netlify/functions";
import fanCafeParser from "../libs/FanCafeParser";

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
  if (event.body === null) return fanCafeParser.failResponse;

  // URL 유효성 검사
  const { cafeId, boards } = JSON.parse(event.body);
  const checkedBoards = [];

  if (!(boards instanceof Array) || boards.length === 0)
    return fanCafeParser.failResponse;
  for (const { idx, board } of boards.map((board, idx) => ({ idx, board }))) {
    if (idx === MAX_BOARD_NUM) break;
    else if (
      typeof board.menuId !== "string" ||
      typeof board.count !== "number" ||
      typeof board.type !== "string" ||
      typeof board.skipNotice !== "boolean"
    )
      return fanCafeParser.failResponse;
    checkedBoards.push(board);
  }

  // 각 URL 별 네이버카페 글목록 데이터 파싱

  const data = [];
  for (const { menuId, count, type, skipNotice } of checkedBoards) {
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
          await fanCafeParser.naverCafeParser(
            cafeId.naverCafe,
            menuId,
            c,
            skipNotice
          )
        );
        break;
      case "tgd":
        console.log("hello world");
        data.push(
          await fanCafeParser.tgdParser(cafeId.tgd, menuId, c, skipNotice)
        );
    }
  }

  return {
    statusCode: 200,
    headers: fanCafeParser.defaultHeader,
    body: JSON.stringify({
      data,
    }),
  };
};

export { handler };
