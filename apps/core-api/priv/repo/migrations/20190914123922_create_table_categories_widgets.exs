defmodule Api.Repo.Migrations.CreateTableCategoriesWidgets do
  use Ecto.Migration

  def change do
    create table(:categories_widgets, primary_key: false) do
      add :category_id, references(:categories, on_delete: :delete_all), primary_key: true
      add :widget_id, references(:widgets, on_delete: :delete_all), primary_key: true
      add :sort_key, :integer, default: 0
    end

    create index(:categories_widgets, [:category_id])
    create index(:categories_widgets, [:widget_id])

    create unique_index(:categories_widgets, [:category_id, :widget_id], name: :category_id_widget_id_unique_index)
  end
end
