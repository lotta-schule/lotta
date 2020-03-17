defmodule Api.Accounts.File do
  use Ecto.Schema
  use Api.ReadRepoAliaser
  alias Api.UploadService
  import Ecto.Changeset

  schema "files" do
    field :path, :string
    field :is_public, :boolean
    field :mime_type, :string
    field :file_type, :string
    field :filename, :string
    field :filesize, :integer
    field :remote_location, :string

    has_many :file_conversions, Api.Accounts.FileConversion
    belongs_to :user, Api.Accounts.User
    belongs_to :tenant, Api.Tenants.Tenant
    many_to_many(
      :content_modules,
      Api.Content.ContentModule,
      join_through: "content_module_file",
      on_replace: :delete
    )

    timestamps()
  end

  @spec get_valid_path(String.t()) :: String.t()
  def get_valid_path(path) do
    path = String.replace(path, ~r/\/{2,}/, "/")
    path = case String.starts_with?(path, "/") do
      true -> path
      false -> "/#{path}"
    end
    case String.length(path) do
      1 -> path
      _ -> String.replace_trailing(path, "/", "")
    end
  end

  def is_author?(%Api.Accounts.File{} = file, %Api.Accounts.User{} = user) do
    file = file
    |> ReadRepo.preload(:user)
    file.user.id == user.id
  end

  @doc false
  def changeset(file, attrs, is_admin_user \\ false) do
    properties = case is_admin_user do
      true ->
        [:path, :filename, :is_public, :filesize, :remote_location, :mime_type, :file_type, :user_id, :tenant_id]
      false ->
        [:path, :filename, :filesize, :remote_location, :mime_type, :file_type, :user_id, :tenant_id]
    end
    file
    |> cast(attrs, properties)
    |> update_change(:path, &get_valid_path/1)
    |> validate_required([:path, :filename, :filesize, :remote_location, :mime_type, :file_type, :user_id, :tenant_id])
  end

  def move_changeset(file, attrs, can_edit_public_files \\ false) do
    properties = case can_edit_public_files do
      true ->
        [:path, :filename, :is_public]
      false ->
        [:path, :filename]
    end
    file
    |> cast(attrs, properties)
    |> update_change(:path, &get_valid_path/1)
    |> validate_required([:path, :filename])
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
