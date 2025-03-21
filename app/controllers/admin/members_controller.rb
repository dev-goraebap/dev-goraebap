class Admin::MembersController < Admin::AdminController
  before_action :set_member, only: [ :edit, :update, :destroy ]

  def index
    # 파라미터 초기화
    keyword = params[:keyword]
    sort_column = params[:sort_by].presence_in(%w[created_at nickname role updated_at id]) || "created_at"
    sort_direction = params[:sort_direction].presence_in(%w[asc desc]) || "desc"
    page = params[:page].to_i > 0 ? params[:page].to_i : 1
    per_page = params[:per_page].to_i.between?(1, 10) ? params[:per_page].to_i : 10

    # 기본 쿼리 생성 (빈 릴레이션으로 시작)
    @members = Member.all.none

    # 실제 쿼리 구성 (조건부 필터링)
    if keyword.present?
      keyword_pattern = "%#{keyword}%"
      @members = Member.where("nickname LIKE ? OR role LIKE ?", keyword_pattern, keyword_pattern)
    else
      # 키워드가 없으면 모든 멤버 가져오기
      @members = Member.all
    end

    # 정렬 적용
    @members = @members.order("#{sort_column} #{sort_direction}")

    # 페이지네이션 정보 계산
    total_count = @members.count
    total_pages = (total_count.to_f / per_page).ceil

    # 페이지네이션 적용
    @members = @members.limit(per_page).offset((page - 1) * per_page)

    # 뷰에서 사용할 데이터 준비
    @filters = {
      keyword: keyword,
      sort_by: sort_column,
      sort_direction: sort_direction,
      page: page,
      per_page: per_page
    }

    @pagination = {
      current_page: page,
      per_page: per_page,
      total_count: total_count,
      total_pages: total_pages,
      has_next_page: (page * per_page) < total_count,
      has_prev_page: page > 1
    }

    # 응답 처리
    respond_to do |format|
      format.html
      format.turbo_stream do
        render turbo_stream: turbo_stream.replace(
          "members_list",
          partial: "admin/members/members_list",
          locals: {
            members: @members,
            pagination: @pagination,
            filters: @filters
          }
        )
      end
      format.json { render json: { members: @members, pagination: @pagination } }
    end
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
