# app/models/member.rb
class Member < ApplicationRecord
  has_one_attached :thumbnail

  validates :nickname, presence: { message: "닉네임을 입력해주세요" }
  validates :role, presence: { message: "역할을 선택해주세요" }

  # 링크가 있을 경우에만 URL 형식 검증 (정규식 사용)
  validates :link, format: {
    with: /\A(http|https):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?|^$\z/ix,
    message: "올바른 URL 형식이 아닙니다"
  }, allow_blank: true

  validate :thumbnail_content_type

  private

  def thumbnail_content_type
    if thumbnail.attached? && !thumbnail.content_type.in?(%w[image/jpeg image/png image/gif])
      errors.add(:thumbnail, "은 JPEG, PNG, GIF 형식이어야 합니다")
      thumbnail.purge # 잘못된 파일 제거
    end
  end
end
