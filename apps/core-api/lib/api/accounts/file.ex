defmodule Api.Accounts.File do
  @moduledoc """
    Ecto Schema for user files
  """

  use Ecto.Schema
  alias Api.UploadService
  import Ecto.Changeset

  schema "files" do
    field :mime_type, :string
    field :file_type, :string
    field :filename, :string
    field :filesize, :integer
    field :full_metadata, :map
    field :metadata, :map
    field :media_duration, :float
    field :remote_location, :string

    has_many :file_conversions, Api.Accounts.FileConversion
    belongs_to :user, Api.Accounts.User
    belongs_to :tenant, Api.Tenants.Tenant
    belongs_to :parent_directory, Api.Accounts.Directory

    many_to_many(
      :content_modules,
      Api.Content.ContentModule,
      join_through: "content_module_file",
      on_replace: :delete
    )

    timestamps()
  end

  @doc false
  def changeset(file, attrs) do
    file
    |> cast(attrs, [
      :filename,
      :parent_directory_id
    ])
    |> validate_required([
      :filename,
      :filesize,
      :remote_location,
      :mime_type,
      :file_type,
      :parent_directory_id,
      :user_id,
      :tenant_id
    ])
  end

  @doc false
  def delete_attachment(file) do
    cdn_base_url = System.get_env("UGC_S3_COMPAT_CDN_BASE_URL") || " "

    case String.starts_with?(file.remote_location, cdn_base_url) do
      true ->
        file.remote_location
        |> String.replace_leading(cdn_base_url, "")
        |> String.replace_leading("/", "")
        |> String.split("/", parts: 2)
        |> List.last()
        |> UploadService.delete_from_space()

        {:ok, file}

      _ ->
        {:ok, file}
    end
  end
end
