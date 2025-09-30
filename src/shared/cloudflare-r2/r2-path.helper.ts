export class R2PathHelper {
  private static publicUrl: string;
  private static bucketName: string;

  static configure(publicUrl: string, bucketName: string) {
    this.publicUrl = publicUrl;
    this.bucketName = bucketName;
  }

  /**
   * @description 파일 키를 디렉토리 구조가 포함된 파일 경로로 변환합니다.
   * 파일 키의 처음 2자리와 3-4자리를 사용하여 2단계 디렉토리 구조를 생성합니다.
   * @param key 변환할 파일 키 (최소 4자리 이상)
   * @returns 디렉토리 구조가 포함된 파일 경로 (예: "ab/cd/abcd1234.jpg")
   * @example
   * getFilePath("abcd1234.jpg") // returns "ab/cd/abcd1234.jpg"
   */
  static getFilePath(key: string): string {
    return `${key.substring(0, 2)}/${key.substring(2, 4)}/${key}`;
  }

  /**
   * @description 엔드포인트와 파일 키를 결합하여 공개 접근 가능한 URL을 생성합니다.
   * @param key 파일 키 (최소 4자리 이상)
   * @returns 디렉토리 구조가 포함된 완전한 공개 URL
   * @example
   * getPublicUrl("abcd1234.jpg") // returns "https://cdn.example.com/bucket-name/ab/cd/abcd1234.jpg"
   */
  static getPublicUrl(key: string): string {
    if (!this.publicUrl || !this.bucketName) {
      throw new Error('R2PathHelper not configured. Call R2PathHelper.configure() first.');
    }
    const filePath = this.getFilePath(key);
    return `${this.publicUrl}/${this.bucketName}/${filePath}`;
  }
}