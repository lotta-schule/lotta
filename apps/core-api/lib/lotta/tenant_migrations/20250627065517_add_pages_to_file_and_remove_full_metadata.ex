defmodule Lotta.Repo.TenantMigrations.AddPagesToFileAndRemoveFullMetadata do
  @moduledoc false

  use Ecto.Migration
  alias Lotta.Repo

  import Ecto.Query

  def change do
    from(f in "files",
      where: not is_nil(f.full_metadata)
    )
    |> Repo.update_all([set: [metadata: dynamic([f], f.full_metadata)]], prefix: prefix())

    flush()

    from(f in "files",
      where:
        not is_nil(f.metadata) and
          fragment("?->'duration' IS NOT NULL", f.full_metadata)
    )
    |> Repo.update_all(
      [
        set: [
          media_duration:
            dynamic([f], fragment("(?->>'media_duration')::numeric", f.full_metadata))
        ]
      ],
      prefix: prefix()
    )

    flush()

    alter table(:files) do
      add(:page_count, :integer, default: nil)
      remove(:full_metadata, :jsonb)
    end

    alter table(:file_conversions) do
      add(:page, :integer, default: 0, null: false)
    end

    flush()

    from(f in "files",
      where: not is_nil(f.metadata) and fragment("?->'pages' IS NOT NULL", f.metadata)
    )
    |> Repo.update_all(
      [
        set: [
          page_count: dynamic([f], fragment("(?->>'pages')::integer", f.metadata))
        ]
      ],
      prefix: prefix()
    )
  end
end
