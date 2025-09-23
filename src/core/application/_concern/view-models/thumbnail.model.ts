export class ThumbnailModel {
  readonly url: string;
  readonly dominantColor: string;
  readonly dominantColor2: string;

  static from(url: string, metadata: string): ThumbnailModel {
    const metadataObj = metadata ? (typeof metadata === 'string' ? JSON.parse(metadata) : metadata) : {};
    return {
      url,
      dominantColor: metadataObj['dominantColor'],
      dominantColor2: metadataObj['dominantColor2'],
    }
  }
}