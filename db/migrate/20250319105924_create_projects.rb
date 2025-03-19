class CreateProjects < ActiveRecord::Migration[8.0]
  def change
    create_table :projects do |t|
      t.string :title, null: false
      t.string :description, null: false
      t.string :features_text, null: false
      t.timestamps
    end
  end
end
