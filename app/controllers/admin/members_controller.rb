class Admin::MembersController < Admin::AdminController
  before_action :set_member, only: [ :edit, :update, :destroy ]

  def index
    @members = Member.all
  end

  def new
    @member = Member.new
  end

  def edit
    # @member는 before_action에서 설정됨
  end

  def create
    @member = Member.new(member_params)

    if @member.save
      respond_with_success("멤버가 성공적으로 추가되었습니다.")
    else
      respond_with_error
    end
  end

  def update
    if @member.update(member_params)
      respond_with_success("멤버가 성공적으로 수정되었습니다.")
    else
      respond_with_error
    end
  end

  def destroy
    @member.destroy
    respond_with_success("멤버가 성공적으로 삭제되었습니다.", close_modal: false)
  end

  private

  def set_member
    @member = Member.find(params[:id])
  end

  def member_params
    params.require(:member).permit(:nickname, :role, :link, :thumbnail)
  end

  def respond_with_success(message, close_modal: true)
    respond_to do |format|
      format.turbo_stream do
        streams = []
        streams << turbo_stream.update("modal", "") if close_modal
        streams << turbo_stream.replace("members_list", partial: "admin/members/members_list", locals: { members: Member.all })
        streams << turbo_stream.prepend("flash_messages", partial: "shared/flash", locals: { type: "success", message: message })

        render turbo_stream: streams
      end
      format.html { redirect_to admin_members_path, notice: message }
    end
  end

  def respond_with_error
    respond_to do |format|
      format.turbo_stream do
        render turbo_stream: turbo_stream.update("modal", partial: "admin/members/form", locals: { member: @member })
      end
      format.html { redirect_to admin_members_path }
    end
  end
end
