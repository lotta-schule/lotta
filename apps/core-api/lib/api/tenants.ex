defmodule Api.Tenants do
  @moduledoc """
  The Tenants context.
  """

  import Ecto.Query, warn: false
  alias Api.Repo

  alias Api.Tenants.{Category,Tenant,Widget}
  alias Api.Accounts.{User,UserGroup}

  def data(ctx) do
    Dataloader.Ecto.new Api.Repo,
      query: &query/2,
      default_params: ctx.context
  end
  def query(Widget, params) do
    tenant_id = params.tenant.id
    if Map.has_key?(params, :current_user) do
      max_priority = params.current_user |> User.get_max_priority_for_tenant(params.tenant)
      Ecto.Query.from(w in Widget,
        where: w.tenant_id == ^tenant_id,
        join: ug in UserGroup, where: (not is_nil(w.group_id) and ug.priority <= ^max_priority and ug.id == w.group_id) or is_nil(w.group_id),
        distinct: :id
      )
    else
      Ecto.Query.from w in Widget, where: w.tenant_id == ^tenant_id and is_nil(w.group_id)
    end
  end
  def query(queryable, _params) do
    queryable
  end

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
  def get_tenant_by_slug(slug), do: Repo.get_by(Tenant, [slug: slug])

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

  alias Api.Tenants.Category

  @doc """
  Returns the list of categories.

  ## Examples

      iex> list_categories_by_tenant()
      [%Category{}, ...]

  """
  def list_categories_by_tenant(tenant, user) do
    tenant_id = tenant.id
    if is_nil(user) do
      Repo.all(Ecto.Query.from c in Category, where: c.tenant_id == ^tenant_id and is_nil(c.group_id))
    else
      max_priority = user |> User.get_max_priority_for_tenant(tenant)
      Ecto.Query.from(c in Category,
        where: c.tenant_id == ^tenant_id,
        join: ug in UserGroup, where: (not is_nil(c.group_id) and ug.priority <= ^max_priority and ug.id == c.group_id) or is_nil(c.group_id),
        distinct: true)
      |> Repo.all
    end
  end

  @doc """
  Gets a single category.

  Raises `Ecto.NoResultsError` if the Category does not exist.

  ## Examples

      iex> get_category!(123)
      %Category{}

      iex> get_category!(456)
      ** (Ecto.NoResultsError)

  """
  def get_category!(id), do: Repo.get!(Category, id)

  @doc """
  Creates a category.

  ## Examples

      iex> create_category(%{field: value})
      {:ok, %Category{}}

      iex> create_category(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_category(attrs \\ %{}) do
    %Category{}
    |> Category.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a category.

  ## Examples

      iex> update_category(category, %{field: new_value})
      {:ok, %Category{}}

      iex> update_category(category, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_category(%Category{} = category, attrs) do
    category
    |> Category.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a Category.

  ## Examples

      iex> delete_category(category)
      {:ok, %Category{}}

      iex> delete_category(category)
      {:error, %Ecto.Changeset{}}

  """
  def delete_category(%Category{} = category) do
    Repo.delete(category)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking category changes.

  ## Examples

      iex> change_category(category)
      %Ecto.Changeset{source: %Category{}}

  """
  def change_category(%Category{} = category) do
    Category.changeset(category, %{})
  end

  alias Api.Tenants.Widget

  @doc """
  Returns the list of widgets.

  ## Examples

      iex> list_widgets_by_tenant()
      [%Category{}, ...]

  """
  def list_widgets_by_tenant(tenant, user) do
    tenant_id = tenant.id
    if is_nil(user) do
      Repo.all(Ecto.Query.from w in Widget, where: w.tenant_id == ^tenant_id and is_nil(w.group_id))
    else
      max_priority = user |> User.get_max_priority_for_tenant(tenant)
      Ecto.Query.from(w in Widget,
        where: w.tenant_id == ^tenant_id,
        join: ug in UserGroup, where: (not is_nil(w.group_id) and ug.priority <= ^max_priority and ug.id == w.group_id) or is_nil(w.group_id),
        distinct: w.id)
      |> Repo.all
    end
  end

  @doc """
  Gets a single widget.

  Raises `Ecto.NoResultsError` if the Widget does not exist.

  ## Examples

      iex> get_widget!(123)
      %Widget{}

      iex> get_widget!(456)
      ** (Ecto.NoResultsError)

  """
  def get_widget!(id), do: Repo.get!(Widget, id)

  @doc """
  Creates a widget.

  ## Examples

      iex> create_widget(%{field: value})
      {:ok, %Widget{}}

      iex> create_widget(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_widget(attrs \\ %{}) do
    %Widget{}
    |> Widget.create_changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a widget.

  ## Examples

      iex> update_widget(widget, %{field: new_value})
      {:ok, %Widget{}}

      iex> update_widget(widget, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_widget(%Widget{} = widget, attrs) do
    widget
    |> Widget.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a Widget.

  ## Examples

      iex> delete_widget(widget)
      {:ok, %Widget{}}

      iex> delete_widget(widget)
      {:error, %Ecto.Changeset{}}

  """
  def delete_widget(%Widget{} = widget) do
    Repo.delete(widget)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking widget changes.

  ## Examples

      iex> change_widget(widget)
      %Ecto.Changeset{source: %Widget{}}

  """
  def change_widget(%Widget{} = widget) do
    Widget.changeset(widget, %{})
  end
end
