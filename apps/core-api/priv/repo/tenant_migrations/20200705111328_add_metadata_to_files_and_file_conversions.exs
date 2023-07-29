defmodule Lotta.Repo.TenantMigrations.AddMetadataToFilesAndFileConversions do
  require Logger

  import Ecto.Query

  use Ecto.Migration

  def up do
    alter table(:files) do
      add(:full_metadata, :jsonb)
      add(:metadata, :jsonb)
      add(:media_duration, :float)
    end

    create(index(:files, [:tenant_id, :media_duration]))
    create(index(:files, [:tenant_id, :filesize]))
    create(index(:files, [:tenant_id, :user_id, :media_duration]))

    alter table(:file_conversions) do
      add(:full_metadata, :jsonb)
      add(:metadata, :jsonb)
      add(:media_duration, :float)
      add(:filesize, :integer)
    end

    create(index(:file_conversions, [:media_duration]))
    create(index(:file_conversions, [:filesize]))
    create(index(:file_conversions, [:file_id, :media_duration]))
    create(index(:file_conversions, [:file_id, :filesize]))

    flush()

    # fetch filesize from all file_conversions without filesize

    Lotta.Repo.all(
      from(fc in "file_conversions",
        select: [fc.id, fc.remote_location],
        where: is_nil(fc.filesize) and not is_nil(fc.remote_location)
      ),
      prefix: prefix()
    )
    |> Enum.each(fn [id, remote_location] ->
      case HTTPoison.head(remote_location) do
        {:ok, %{headers: headers}} ->
          {_key, filesize} = List.keyfind(headers, "Content-Length", 0)
          Logger.info("Content-Length found on id #{id}: #{filesize}")

          if filesize do
            from(fc in Lotta.Storage.FileConversion, where: fc.id == ^id)
            |> Lotta.Repo.update_all(set: [filesize: String.to_integer(filesize)])
          else
            Logger.info("No filesize found")
          end

        {:error, reason} ->
          Logger.warning("error fetching filesize: #{inspect(reason)}")
      end
    end)
  end

  def down do
    drop(index(:files, [:tenant_id, :media_duration]))
    drop(index(:files, [:tenant_id, :filesize]))
    drop(index(:files, [:tenant_id, :user_id, :media_duration]))
    drop(index(:file_conversions, [:media_duration]))
    drop(index(:file_conversions, [:filesize]))
    drop(index(:file_conversions, [:file_id, :media_duration]))
    drop(index(:file_conversions, [:file_id, :filesize]))

    alter table(:files) do
      remove(:full_metadata, :jsonb)
      remove(:metadata, :jsonb)
      remove(:media_duration, :integer)
    end

    alter table(:file_conversions) do
      remove(:full_metadata, :jsonb)
      remove(:metadata, :jsonb)
      remove(:media_duration, :integer)
      remove(:filesize, :integer)
    end
  end
end
