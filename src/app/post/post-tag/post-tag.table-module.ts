import { TagID } from "src/app/tag";
import { PostTagDataGateway } from "./post-tag.data-gateway";

export class PostTagTableModule {
  constructor(
    private dataGateway: PostTagDataGateway
  ) { }

  async link(postId: number, tagIds: TagID[]): Promise<void> {
    const linkData = tagIds.map(tagId => ({
      postId,
      tagId
    }));
    await this.dataGateway.insertMany(linkData);
  }
}