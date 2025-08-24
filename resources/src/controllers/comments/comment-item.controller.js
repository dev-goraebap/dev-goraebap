import { Controller } from '@hotwired/stimulus';
import { avatars } from './avatar';

export class CommentItemController extends Controller {
  static targets = ['avatar'];

  static values = {
    avatarNo: Number,
  };

  connect() {
    if (!this.hasAvatarTarget) {
      throw new Error('not found avatar target by comment item');
    }
    if (!this.hasAvatarNoValue) {
      throw new Error('not found avatarNo value by comment item');
    }
    const avatar = avatars.find((x) => x.no === this.avatarNoValue);
    if (avatar) {
      this.avatarTarget.innerText = avatar.icon;
    }
  }
}
