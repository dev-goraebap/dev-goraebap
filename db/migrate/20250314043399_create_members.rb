class CreateMembers < ActiveRecord::Migration[8.0]
  def change
    create_table :members do |t|
      t.string :nickname, null: false
      t.string :role, null: false
      t.string :link
      t.timestamps
    end
  end
end
