class CreatePosts < ActiveRecord::Migration[8.0]
  def change
    create_table :posts do |t|
      t.references :member, null: false, foreign_key: true
      t.string :title, null: false
      t.string :summary, null: false
      t.timestamps
    end
  end
end
