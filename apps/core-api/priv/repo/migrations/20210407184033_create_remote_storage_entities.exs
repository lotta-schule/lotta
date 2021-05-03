defmodule Api.Repo.Migrations.CreateRemoteStorageEntities do
  use Ecto.Migration
  import Ecto.Query
  alias Api.Repo

  def up do
    create table(:remote_storage_entities) do
      add(:store_name, :string)
      add(:path, :string)

      timestamps()
    end

    alter table(:files) do
      add(:remote_storage_entity_id, references(:remote_storage_entities, on_delete: :delete_all))
    end

    alter table(:file_conversions) do
      add(:remote_storage_entity_id, references(:remote_storage_entities, on_delete: :delete_all))
    end

    create(index(:files, [:remote_storage_entity_id]))

    flush()

    from("files", select: [:id, :remote_location])
    |> Repo.all()
    |> Enum.each(fn
      file ->
        rse =
          case file.remote_location do
            "https://ugc.lotta.schule/ugc/" <> path ->
              %{store_name: "digitalocean-prod", path: path}

            "https://mp4-dev-ugc.fra1.digitaloceanspaces.com/mp4-dev-ugc/" <> path ->
              %{store_name: "digitalocean-dev", path: path}

            nil ->
              IO.inspect("file conversion #{file.id} has no valid remote_location")
              nil
          end

        if rse != nil do
          file
          |> Map.put(:__struct__, Api.Storage.File)
          |> Ecto.build_assoc(:remote_storage_entity, rse)
          |> Api.Repo.insert!()
        end
    end)

    from("file_conversions", select: [:id, :remote_location])
    |> Repo.all()
    |> Enum.each(fn file ->
      rse =
        case file.remote_location do
          "https://ugc.lotta.schule/ugc/" <> path ->
            %{store_name: "digitalocean-prod", path: path}

          "https://mp4-dev-ugc.fra1.digitaloceanspaces.com/mp4-dev-ugc/" <> path ->
            %{store_name: "digitalocean-dev", path: path}

          "https://mp4-dev-ugc.medienportal.org/mp4-dev-ugc/" <> path ->
            %{store_name: "digitalocean-dev", path: path}

          nil ->
            IO.inspect("file conversion #{file.id} has no valid remote_location")
            nil
        end

      if rse != nil do
        file
        |> Map.put(:__struct__, Api.Storage.FileConversion)
        |> Ecto.build_assoc(:remote_storage_entity, rse)
        |> Api.Repo.insert!()
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
