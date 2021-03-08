defmodule Api.Repo.Migrations.AddPublishedToArticles do
  use Ecto.Migration

  import Ecto.Query

  alias Api.Repo

  def up do
    alter table(:articles) do
      add(:published, :boolean, null: false, default: false)
    end

    flush()

    from(a in "articles", where: not is_nil(a.category_id))
    |> Repo.update_all(set: [published: true])
  end

  def down do
    remove(:published)
  end
end
