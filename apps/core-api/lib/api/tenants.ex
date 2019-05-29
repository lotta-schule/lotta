defmodule Api.Tenants do
  @moduledoc """
  The Tenants context.
  """

  import Ecto.Query, warn: false
  alias Api.Repo

  alias Api.Tenants.Tenant

  @doc """
  Returns the list of tenants.

  ## Examples

      iex> list_tenants()
      [%Tenant{}, ...]

  """
  def list_tenants do
    Repo.all(Tenant)
  end

  @doc """
  Gets a single tenant.

  Raises `Ecto.NoResultsError` if the Tenant does not exist.

  ## Examples

      iex> get_tenant!(123)
      %Tenant{}

      iex> get_tenant!(456)
      ** (Ecto.NoResultsError)

  """
  def get_tenant!(id), do: Repo.get!(Tenant, id)

  @doc """
  Gets a single tenant by slug.

  Raises `Ecto.NoResultsError` if the Tenant does not exist.

  ## Examples

      iex> get_tenant_by_slug!(123)
      %Tenant{}

      iex> get_tenant_by_slug!(456)
      ** (Ecto.NoResultsError)

  """
  def get_tenant_by_slug!(slug), do: Repo.get_by!(Tenant, [slug: slug])

  @doc """
  Creates a tenant.

  ## Examples

      iex> create_tenant(%{field: value})
      {:ok, %Tenant{}}

      iex> create_tenant(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_tenant(attrs \\ %{}) do
    %Tenant{}
    |> Tenant.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a tenant.

  ## Examples

      iex> update_tenant(tenant, %{field: new_value})
      {:ok, %Tenant{}}

      iex> update_tenant(tenant, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_tenant(%Tenant{} = tenant, attrs) do
    tenant
    |> Tenant.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a Tenant.

  ## Examples

      iex> delete_tenant(tenant)
      {:ok, %Tenant{}}

      iex> delete_tenant(tenant)
      {:error, %Ecto.Changeset{}}

  """
  def delete_tenant(%Tenant{} = tenant) do
    Repo.delete(tenant)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking tenant changes.

  ## Examples

      iex> change_tenant(tenant)
      %Ecto.Changeset{source: %Tenant{}}

  """
  def change_tenant(%Tenant{} = tenant) do
    Tenant.changeset(tenant, %{})
  end
end
