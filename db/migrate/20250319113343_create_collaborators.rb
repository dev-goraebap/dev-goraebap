class CreateCollaborators < ActiveRecord::Migration[8.0]
  def change
    create_table :collaborators do |t|
      t.references :member, null: false, foreign_key: true
      t.references :project, null: false, foreign_key: true
      t.integer :rank
      t.timestamps
    end
  end
end
