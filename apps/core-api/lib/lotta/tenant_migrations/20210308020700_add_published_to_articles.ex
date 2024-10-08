defmodule Lotta.Repo.TenantMigrations.AddPublishedToArticles do
  @moduledoc false

  use Ecto.Migration

  import Ecto.Query

  alias Lotta.Repo

  def up do
    alter table(:articles) do
      add(:published, :boolean, null: false, default: false)
    end

    flush()

    from(a in "articles", where: not is_nil(a.category_id))
    |> Repo.update_all([set: [published: true]], prefix: prefix())
  end

  def down do
    alter table(:articles) do
      remove(:published)
    end
  end
end
