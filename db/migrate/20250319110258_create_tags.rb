class CreateTags < ActiveRecord::Migration[8.0]
  def change
    create_table :tags do |t|
      t.string :name, null: false
      t.string :bg_color
      t.string :text_color, null: false
      t.timestamps
    end
  end
end
