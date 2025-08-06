// EditorJS JSON 구조에 대한 타입 정의
interface FileData {
  url: string;
  blobId: number;
  caption: string;
  withBorder: boolean;
  withBackground: boolean;
  stretched: boolean;
}

interface ImageItemData {
  caption: string;
  withBorder: boolean;
  withBackground: boolean;
  stretched: boolean;
  file: FileData;
}

interface EditorBlock {
  id: string;
  type: string;
  data: ImageItemData | any; // 다른 타입의 data도 있을 수 있음
}

// EditorJS 전체 구조
interface EditorJSData {
  time: number;
  blocks: EditorBlock[];
  version: string;
}

/**
 * EditorJS JSON에서 image 타입 블록들의 blobId를 추출하는 함수
 * @param jsonString - EditorJS JSON 문자열
 * @returns blobId 배열
 */
export function extractBlobIds(jsonString: string): number[] {
  const blobIds: number[] = [];

  try {
    const editorData = JSON.parse(jsonString) as EditorJSData;

    // blocks가 없거나 배열이 아닌 경우 빈 배열 반환
    if (!editorData.blocks || !Array.isArray(editorData.blocks)) {
      return [];
    }

    editorData.blocks.forEach((block) => {
      // image 타입이면서 file 속성이 있는 경우
      if (block.type === 'image' && block.data && block.data.file) {
        blobIds.push(Number(block.data.file.blobId));
      }
    });
  } catch (error) {
    console.error('JSON 파싱 실패:', error);
    return [];
  }

  return blobIds;
}
