defmodule Lotta.Repo.TenantMigrations.ChangeArticleTopicToTags do
  use Ecto.Migration

  import Ecto.Query

  alias Lotta.Repo

  def up do
    alter table(:articles) do
      add(:tags, {:array, :string})
    end

    flush()

    from(a in "articles",
      select: [:id, :topic],
      where: not is_nil(a.topic)
    )
    |> Repo.all(prefix: prefix())
    |> Enum.each(fn %{id: id, topic: topic} ->
      Repo.update_all(
        from(a in "articles",
          where: a.id == ^id
        ),
        set: [tags: [topic]]
      )
    end)

    flush()

    alter table(:articles) do
      remove(:topic)
    end
  end

  def down do
    alter table(:articles) do
      add(:topic, :string)
    end

    flush()

    from("articles",
      select: [:id, :tags]
    )
    |> Repo.all(prefix: prefix())
    |> Enum.each(fn %{id: id, tags: tags} ->
      case tags do
        [topic | _tail] ->
          Repo.update_all(
            from(a in "articles",
              where: a.id == ^id
            ),
            [set: [topic: topic]],
            prefix: prefix()
          )

        _ ->
          nil
      end
    end)

    flush()

    alter table(:articles) do
      remove(:tags)
    end
  end
end
