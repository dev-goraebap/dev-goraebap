class CreateTagMappings < ActiveRecord::Migration[8.0]
  def change
    create_table :tag_mappings do |t|
      t.references :tag, null: false, foreign_key: true
      t.references :project, foreign_key: true
      t.references :post, foreign_key: true
      t.timestamps
    end
  end
end
