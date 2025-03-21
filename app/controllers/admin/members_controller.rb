class Admin::MembersController < Admin::AdminController
  def index
    @members = Member.all
  end

  def new
    @member = Member.new
  end

  def edit
    # 1. ID로 멤버 찾기
    @member = Member.find(params[:id])
  end

  def create
    @member = Member.new(member_params)

    if @member.save
      respond_to do |format|
        format.turbo_stream do
          render turbo_stream: [
            turbo_stream.update("modal", ""),
            turbo_stream.replace("members_list", partial: "admin/members/members_list", locals: { members: Member.all }),
            turbo_stream.prepend("flash_messages", partial: "shared/flash", locals: { type: "success", message: "멤버가 성공적으로 추가되었습니다." })
          ]
        end
        format.html { redirect_to admin_members_path, notice: "멤버가 성공적으로 추가되었습니다." }
      end
    else
      # Turbo Stream 요청일 경우 모달 내에서 오류를 표시
      respond_to do |format|
        format.turbo_stream do
          # 모달 내용을 오류가 포함된 new 폼으로 교체
          render turbo_stream: turbo_stream.update("modal", partial: "admin/members/form", locals: { member: @member })
        end
        format.html { redirect_to admin_members_path }
      end
    end
  end

  def update
    # 1. ID로 멤버 찾기
    @member = Member.find(params[:id])

    # 2. 멤버 정보 업데이트 시도
    if @member.update(member_params)
      # 3. 업데이트 성공 시 응답 처리
      respond_to do |format|
        # 4. Turbo Stream 요청인 경우
        format.turbo_stream do
          render turbo_stream: [
            # 5. 모달 닫기
            turbo_stream.update("modal", ""),

            # 6. 멤버 목록 갱신
            turbo_stream.replace("members_list", partial: "admin/members/members_list", locals: { members: Member.all }),

            # 7. 성공 메시지 표시
            turbo_stream.prepend("flash_messages", partial: "shared/flash", locals: { type: "success", message: "멤버가 성공적으로 수정되었습니다." })
          ]
        end

        # 8. 일반 HTML 요청인 경우
        format.html { redirect_to admin_members_path, notice: "멤버가 성공적으로 수정되었습니다." }
      end
    else
      # 9. 업데이트 실패 시 모달 내에서 오류 표시
      respond_to do |format|
        format.turbo_stream do
          # 모달 내용을 오류가 포함된 edit 폼으로 교체
          render turbo_stream: turbo_stream.update("modal", partial: "admin/members/form", locals: { member: @member })
        end
        format.html { redirect_to admin_members_path }
      end
    end
  end

  def destroy
    # 1. ID로 멤버 찾기
    @member = Member.find(params[:id])

    # 2. 멤버 삭제
    @member.destroy

    # 3. 응답 처리
    respond_to do |format|
      # 4. Turbo Stream 요청인 경우
      format.turbo_stream do
        render turbo_stream: [
          # 5. 멤버 목록 갱신
          turbo_stream.replace("members_list", partial: "admin/members/members_list", locals: { members: Member.all }),

          # 6. 성공 메시지 표시
          turbo_stream.prepend("flash_messages", partial: "shared/flash", locals: { type: "success", message: "멤버가 성공적으로 삭제되었습니다." })
        ]
      end

      # 7. 일반 HTML 요청인 경우
      format.html { redirect_to admin_members_path, notice: "멤버가 성공적으로 삭제되었습니다." }
    end
  end

  private

  def member_params
    params.require(:member).permit(:nickname, :role, :link, :thumbnail)
  end
end
