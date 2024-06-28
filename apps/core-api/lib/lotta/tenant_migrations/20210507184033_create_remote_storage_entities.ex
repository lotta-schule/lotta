defmodule Lotta.Repo.TenantMigrations.CreateRemoteStorageEntities do
  @moduledoc false

  use Ecto.Migration

  require Logger

  import Ecto.Query

  alias Lotta.Repo

  def up do
    create table(:remote_storage_entities, primary_key: false) do
      add(:id, :uuid,
        null: false,
        primary_key: true,
        default: fragment("public.gen_random_uuid()")
      )

      add(:store_name, :string)
      add(:path, :string)

      timestamps()
    end

    alter table(:files) do
      add(
        :remote_storage_entity_id,
        references(:remote_storage_entities, type: :uuid, on_delete: :delete_all)
      )
    end

    alter table(:file_conversions) do
      add(
        :remote_storage_entity_id,
        references(:remote_storage_entities, type: :uuid, on_delete: :delete_all)
      )
    end

    create(index(:files, [:remote_storage_entity_id]))
    create(index(:file_conversions, [:remote_storage_entity_id]))

    flush()

    from("files", select: [:id, :remote_location])
    |> Repo.all(prefix: prefix())
    |> Enum.each(fn
      file ->
        rse =
          case file.remote_location do
            "https://ugc.lotta.schule/ugc/" <> path ->
              %{store_name: "digitalocean-prod", path: path}

            nil ->
              Logger.notice("file conversion #{file.id} has no valid remote_location")
              nil
          end

        if rse != nil do
          Lotta.Storage.File
          |> Repo.get(Ecto.UUID.load!(file.id))
          |> Lotta.Repo.preload(:remote_storage_entity)
          |> Ecto.Changeset.change()
          |> Ecto.Changeset.put_assoc(:remote_storage_entity, rse)
          |> Lotta.Repo.update()
        end
    end)

    from("file_conversions", select: [:id, :remote_location])
    |> Repo.all(prefix: prefix())
    |> Enum.each(fn file ->
      rse =
        case file.remote_location do
          "https://ugc.lotta.schule/ugc/" <> path ->
            %{store_name: "digitalocean-prod", path: path}

          nil ->
            Logger.notice("file conversion #{file.id} has no valid remote_location")
            nil
        end

      if rse != nil do
        Lotta.Storage.FileConversion
        |> Lotta.Repo.get(Ecto.UUID.load!(file.id))
        |> Lotta.Repo.preload(:remote_storage_entity)
        |> Ecto.Changeset.change()
        |> Ecto.Changeset.put_assoc(:remote_storage_entity, rse)
        |> Lotta.Repo.update()
      end
    end)
  end

  def down do
    alter table(:file_conversions) do
      remove(:remote_storage_entity_id)
    end

    alter table(:files) do
      remove(:remote_storage_entity_id)
    end

    drop(table(:remote_storage_entities))

    flush()
  end
end
