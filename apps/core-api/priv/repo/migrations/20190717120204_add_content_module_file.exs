defmodule Api.Repo.Migrations.AddContentModuleFile do
  use Ecto.Migration

  def change do
    create table(:content_module_file, primary_key: false) do
      add(:content_module_id, references(:content_modules, on_delete: :delete_all),
        primary_key: true
      )

      add(:file_id, references(:files, on_delete: :delete_all), primary_key: true)
    end

    create(index(:content_module_file, [:content_module_id]))
    create(index(:content_module_file, [:file_id]))
  end
end
