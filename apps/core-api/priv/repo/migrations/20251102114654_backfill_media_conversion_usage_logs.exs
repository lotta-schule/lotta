defmodule Lotta.Repo.Migrations.BackfillMediaConversionUsageLogs do
  use Ecto.Migration
  import Ecto.Query

  def up do
    # Get all tenants from public schema
    tenants =
      from(t in "tenants", select: [:id, :prefix])
      |> repo().all()

    # Process each tenant
    Enum.each(tenants, &backfill_usage_logs_for_tenant/1)
  end

  def down do
    # Remove all backfilled usage logs for media conversions
    # that were inserted before November 2025
    from(ul in "usage_logs",
      where: ul.type == "media_conversion_seconds",
      where: ul.date < ^~D[2025-11-01]
    )
    |> repo().delete_all()
  end

  defp backfill_usage_logs_for_tenant(tenant) do
    # Query files with conversions in the tenant's schema
    # We need to find files that:
    # 1. Have file_type 'video' or 'audio'
    # 2. Have non-null media_duration
    # 3. Have at least one file_conversion inserted before November 2025

    query =
      from(f in "files",
        join: fc in "file_conversions",
        on: fc.file_id == f.id,
        where: f.file_type in ["video", "audio"],
        where: not is_nil(f.media_duration),
        where: fc.inserted_at < ^~U[2025-11-01 00:00:00Z],
        group_by: [f.id, f.user_id, f.filename, f.media_duration],
        select: %{
          file_id: type(f.id, :string),
          user_id: f.user_id,
          filename: f.filename,
          media_duration: f.media_duration,
          first_conversion_date: min(fc.inserted_at)
        }
      )

    files = repo().all(query, prefix: tenant.prefix)

    # Insert usage log entries
    Enum.each(files, fn file ->
      unique_identifier = "#{file.user_id}:#{file.file_id}:#{file.filename}"

      # Convert the timestamp to a date
      date =
        file
        |> Map.get(:first_conversion_date)
        |> NaiveDateTime.to_date()

      # Insert the usage log entry (usage_logs is in public schema)
      repo().insert_all(
        "usage_logs",
        [
          %{
            value: to_string(file.media_duration),
            type: "media_conversion_seconds",
            date: date,
            unique_identifier: unique_identifier,
            tenant_id: tenant.id,
            inserted_at: DateTime.utc_now() |> DateTime.truncate(:second),
            updated_at: DateTime.utc_now() |> DateTime.truncate(:second)
          }
        ],
        on_conflict: :nothing
      )
    end)
  end
end
