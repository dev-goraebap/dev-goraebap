class Admin::MembersController < Admin::AdminController
  def index
    @members = Member.all
  end
end
