defmodule Lotta.Repo.TenantMigrations.AddPublishedToArticles do
  use Ecto.Migration

  import Ecto.Query

  alias Lotta.Repo

  def up do
    alter table(:articles) do
      add(:published, :boolean, null: false, default: false)
    end

    flush()

    from(a in "articles", where: not is_nil(a.category_id))
    |> put_query_prefix(prefix())
    |> Repo.update_all(set: [published: true])
  end

  def down do
    alter table(:articles) do
      remove(:published)
    end
  end
end
