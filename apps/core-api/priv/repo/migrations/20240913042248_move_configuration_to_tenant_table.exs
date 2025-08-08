defmodule Lotta.Repo.Migrations.MoveConfigurationToTenantTable do
  use Ecto.Migration

  require Logger

  import Ecto.Query

  def change do
    alter table(:tenants) do
      add(:configuration, :map, null: false, default: %{})

      # These fields are not used in the public schema, but in
      # the tenant's own database prefix.
      # Therefore, they are not represented by an Ecto association.
      add(:logo_image_file_id, :binary_id, null: true)
      add(:background_image_file_id, :binary_id, null: true)
    end

    if direction() == :up do
      flush()

      from(t in "tenants", select: [:id, :prefix, :title, :slug, :configuration])
      |> repo().all()
      |> Enum.map(&fetch_configuration/1)
      |> Enum.each(&apply_configuration(elem(&1, 0), elem(&1, 1)))
    end
  end

  defp fetch_configuration(%{prefix: prefix} = tenant) do
    full_configuration =
      from(c in "configuration", select: [:name, :json_value, :string_value, :file_value_id])
      |> repo().all(prefix: prefix)
      |> Enum.into(%{}, &{&1.name, &1.json_value || &1.string_value || &1.file_value_id})

    logo_image_file_id =
      if full_configuration["logo_image_file"],
        do: Ecto.UUID.cast!(full_configuration["logo_image_file"])

    background_image_file_id =
      if full_configuration["background_image_file"],
        do: Ecto.UUID.cast!(full_configuration["background_image_file"])

    configuration =
      full_configuration
      |> Map.take(["custom_theme", "user_max_storage_config"])
      |> Enum.reduce(%{}, fn {key, value}, acc ->
        Map.put(acc, String.to_existing_atom(key), value)
      end)

    {tenant,
     %{
       configuration: configuration,
       logo_image_file_id: logo_image_file_id,
       background_image_file_id: background_image_file_id
     }}
  rescue
    Ecto.QueryError ->
      Logger.warning("Failed to fetch configuration for tenant #{tenant.slug}")
      {tenant, %{}}
  end

  defp apply_configuration(tenant, %{configuration: configuration} = args) do
    tenant
    |> Ecto.Changeset.cast(
      args,
      [:logo_image_file_id, :background_image_file_id]
    )
    |> Ecto.Changeset.put_embed(:configuration, configuration)
    |> repo().update()
  end
end
