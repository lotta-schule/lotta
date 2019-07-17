defmodule Api.Accounts.File do
  use Ecto.Schema
  import Ecto.Changeset

  schema "files" do
    field :file_type, :string
    field :filename, :string
    field :filesize, :integer
    field :mime_type, :string
    field :path, :string
    field :remote_location, :string

    has_many :file_conversions, Api.Accounts.FileConversion
    belongs_to :user, Api.Accounts.User
    belongs_to :tenant, Api.Tenant.Tenant
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
    |> cast(attrs, [:path, :filename, :filesize, :remote_location, :mime_type, :file_type, :user_id, :tenant_id])
    |> validate_required([:path, :filename, :filesize, :remote_location, :mime_type, :file_type, :user_id, :tenant_id])
  end
end
