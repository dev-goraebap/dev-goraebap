import { AttachmentEntity } from '../attachment.entity';

/**
 * Attachment를 가질 수 있는 Entity들의 기본 클래스
 * getImage, getImages 메서드를 제공하여 첨부파일 정보를 쉽게 조회할 수 있습니다.
 */
export abstract class BaseEntityWithAttachments {
  // 쿼리빌더에서 수동으로 설정되는 속성
  readonly attachments?: AttachmentEntity[];

  /**
   * 지정된 이름의 첫 번째 attachment 정보를 반환합니다.
   *
   * @param name - attachment의 name (예: 'thumbnail', 'contentImage')
   * @returns attachment 정보 객체 또는 null
   */
  getImage(name: string): { url: string; dominantColor?: string, dominantColor2?: string } | null {
    if (!this.attachments || this.attachments.length === 0) {
      return null;
    }

    const attachment = this.attachments.find((a) => a.name === name);
    if (!attachment) {
      return null;
    }

    if (!attachment.blob.isImage()) {
      return null;
    }

    return {
      url: attachment.blob.getFilePath(),
      dominantColor: attachment.blob.metadata?.dominantColor,
      dominantColor2: attachment.blob.metadata?.dominantColor2,
    };
  }

  /**
   * 지정된 이름의 모든 attachment 정보를 배열로 반환합니다.
   *
   * @param name - attachment의 name (예: 'contentImage')
   * @returns attachment 정보 객체들의 배열
   */
  getImages(name: string): { url: string; dominantColor?: string }[] {
    if (!this.attachments || this.attachments.length === 0) {
      return [];
    }

    return this.attachments
      .filter((a) => a.name === name && a.blob.isImage())
      .map((attachment) => ({
        url: attachment.blob.getFilePath(),
        dominantColor: attachment.blob.metadata?.dominantColor,
        dominantColor2: attachment.blob.metadata?.dominantColor2,
      }));
  }
}
