defmodule Lotta.Tenants.Tenant do
  @moduledoc """
    Ecto Schema for tenants
  """

  use Ecto.Schema

  import Ecto.Changeset
  alias Lotta.Storage.File

  @type id() :: pos_integer()

  @type t() :: %__MODULE__{}

  @type configuration() :: %{
          custom_theme: map(),
          logo_image_file: File.t(),
          background_image_file: File.t(),
          user_max_storage_config: String.t()
        }

  schema "tenants" do
    field :title, :string
    field :slug, :string
    field :prefix, :string
    field :configuration, :map, virtual: true

    timestamps()
  end

  @doc """
  Changeset to be used for tenant creation.
  """
  @doc since: "2.6.0"
  @spec create_changeset(%__MODULE__{}, map()) :: Ecto.Changeset.t()
  def create_changeset(tenant, attrs) do
    tenant
    |> cast(attrs, [:title, :slug, :prefix])
    |> validate_required([:title, :slug])
    |> unique_constraint(:slug)
  end

  @doc """
  Changeset to be used for Updating tenant.
  This *only* updates the tenant entry in the public schema
  itself, it will *not* process the configuration, which
  does happen in the tenant's own database prefix, which is
  why it is not represented by an Ecto association.

  For more information, see `Lotta.Tenants.update_configuration/3`.
  """
  @doc since: "2.6.0"
  @spec update_changeset(t(), map()) :: Ecto.Changeset.t()
  def update_changeset(tenant, attrs) do
    tenant
    |> cast(attrs, [:title])
    |> validate_required([:title, :slug, :prefix])
    |> unique_constraint(:slug)
  end

  @doc """
  Adds the correct query prefix for a given tenant.
  If nil is passed as the tenant, no prefix will be
  added. This allows to fallback to the prefix set
  by the process if no tenant is explicitly given.
  """
  @doc since: "2.6.0"
  @spec put_query_prefix(Ecto.Queryable.t(), t() | nil) :: Ecto.Queryable.t()
  def put_query_prefix(query, tenant) do
    if is_nil(tenant) do
      query
    else
      Ecto.Query.put_query_prefix(query, tenant.prefix)
    end
  end
end
