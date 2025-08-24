import { Controller } from '@hotwired/stimulus';
import { avatars } from './avatar';

// prettier-ignore
const prefixWords = [
  '귀여운', '멋진', '똑똑한', '재미있는', '훌륭한', '뛰어난', '창의적인', '열정적인',
  '친근한', '활발한', '신비한', '우아한', '당당한', '유쾌한', '차분한', '온화한',
  '진지한', '성실한', '빠른', '느긋한', '꼼꼼한', '대담한', '겸손한', '자신감있는',
  '포근한', '시원한', '따뜻한', '밝은', '조용한', '활기찬'
];
// prettier-ignore
const suffixWords = [
  '개발자', '코딩러', '프로그래머', '엔지니어', '해커', '테크러', '빌더', '메이커',
  '고양이', '강아지', '토끼', '곰', '여우', '다람쥐', '팬더', '코알라',
  '사자', '호랑이', '늑대', '독수리', '부엉이', '펭귄', '돌고래', '거북이',
  '바리스타', '요리사', '작가', '화가', '음악가', '탐험가', '모험가', '여행자'
];

export class CommentFormController extends Controller {
  static targets = ['avatar'];

  connect() {
    if (!this.hasAvatarTarget) {
      throw new Error('not found avatar target');
    }
    this.onChangeRandomAvatar();
    this.onChangeRandomNickname();
  }

  onChangeRandomAvatar() {
    const randomAvatar = avatars[Math.floor(Math.random() * avatars.length)];

    this.avatarTarget.innerText = randomAvatar.icon;
    const avatarNoInput = this.element.elements['comment[avatarNo]'];
    if (avatarNoInput) {
      avatarNoInput.value = randomAvatar.no;
    }
  }

  onChangeRandomNickname() {
    const prefix = prefixWords[Math.floor(Math.random() * prefixWords.length)];
    const suffix = suffixWords[Math.floor(Math.random() * suffixWords.length)];
    const randomNickname = prefix + suffix;

    const nicknameInput = this.element.elements['comment[nickname]'];
    if (nicknameInput) {
      nicknameInput.value = randomNickname;
    }
  }

  onChangeComment(event) {
    const value = event.target.value;
    const submitBtn = this.element.elements['submitBtn'];
    if (value) {
      submitBtn.disabled = false;
    } else {
      submitBtn.disabled = true;
    }
  }
}
