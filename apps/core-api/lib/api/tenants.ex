defmodule Api.Tenants do
  @moduledoc """
  The Tenants context.
  """

  import Ecto.Query
  alias Api.Repo

  alias Api.Tenants.{Category,CustomDomain,Tenant,Widget}
  alias Api.Accounts.{User,UserGroup}

  def data() do
    Dataloader.Ecto.new(Repo, query: &query/2)
  end
  def query(queryable, _params) do
    queryable
  end

  def resolve_widgets(_args, %{context: context, source: category}) do
    user_group_ids = context[:user_group_ids] || []
    user_is_admin = context[:user_is_admin]
    widgets = from(w in Widget,
      left_join: wug in "widgets_user_groups",
      on: wug.widget_id == w.id,
      join: cw in "categories_widgets",
      on: w.id == cw.widget_id,
      where: (^user_is_admin or (wug.group_id in ^user_group_ids) or is_nil(wug.group_id)) and
             cw.category_id == ^(category.id),
      distinct: w.id
    )
    |> Repo.all()
    {:ok, widgets}
  end

  @doc """
  Returns the list of tenants.

  ## Examples

      iex> list_tenants()
      [%Tenant{}, ...]

  """
  def list_tenants do
    Repo.all from t in Tenant,
      order_by: :slug
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

  Returns nil if no tenant is found

  ## Examples

      iex> get_tenant_by_slug("test123")
      %Tenant{}

      iex> get_tenant_by_slug("doesnotexist")
      nil

  """
  def get_tenant_by_slug(slug), do: Repo.get_by(Tenant, [slug: slug])

  def get_tenant_by_origin(origin) do
    with %URI{host: host} <- URI.parse(origin),
        false <- is_nil(host) do
      case get_tenant_by_custom_domain_host(host) do
        nil ->
          IO.inspect("custom domain is not found with #{host}. Trying to recognize lotta slug")
          base_url_without_port = Regex.replace(~r/:\d*$/, Application.fetch_env!(:api, :base_url), "")
          with {:ok, regex} <- Regex.compile("^(?<slug>.*)#{Regex.escape(base_url_without_port)}"),
              %{"slug" => slug} <- Regex.named_captures(regex, host) do
            get_tenant_by_slug(slug)
          else
            error ->
              if System.get_env("APP_ENVIRONMENT") == "staging" do
                host
                |> String.split(".")
                |> Enum.fetch!(0)
                |> get_tenant_by_slug()
              else
                IO.inspect(error)
                IO.inspect("tenant not found by slug or host, host is #{host}")
                nil
              end
          end
        tenant ->
          tenant
      end
    else
      error ->
        IO.inspect("could not parse origin header")
        IO.inspect(error)
        nil
    end
  end

  @doc """
  Gets a single tenant by its custom domain's host.

  Returns nil if no tenant is found

  ## Examples

      iex> get_tenant_by_custom_domain_host("meinlotta.de")
      %Tenant{}

      iex> get_tenant_by_custom_domain_host("doesnotexist.com")
      nil

  """
  def get_tenant_by_custom_domain_host(host) when is_binary(host) do
    with %CustomDomain{tenant_id: tenant_id} <- Repo.get_by(CustomDomain, host: host),
        tenant <- Repo.get(Tenant, tenant_id),
        false <- is_nil(tenant) do
      tenant
    else
      error ->
        IO.inspect(error)
        nil
    end
  end
  def get_tenant_by_custom_domain_host(nil), do: nil

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
    with {:ok, tenant} <- %Tenant{} |> Tenant.create_changeset(attrs) |> Repo.insert() do
      %Category{
        title: "Startseite",
        sort_key: 0,
        is_sidenav: false,
        is_homepage: true,
        tenant_id: tenant.id
      }
      |> Repo.insert()

      {:ok, admin_group} = %UserGroup{
        name: "Administrator",
        sort_key: 0,
        is_admin_group: true,
        tenant_id: tenant.id
      }
      |> Repo.insert()

      ["Lehrer", "Schüler"]
      |> Enum.with_index()
      |> Enum.each(fn ({name, i}) ->
        %UserGroup{
          name: name,
          sort_key: 10 + i * 10,
          tenant_id: tenant.id
        }
        |> Repo.insert()
      end)

      {:ok, tenant, admin_group}
    else
      result ->
        result
    end
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
  def list_categories_by_tenant(%Tenant{} = tenant, _user, user_group_ids, user_is_admin) do
    from(c in Category,
      left_join: cug in "categories_user_groups",
      on: cug.category_id == c.id,
      where: c.tenant_id == ^tenant.id and
             ((cug.group_id in ^user_group_ids) or is_nil(cug.group_id) or ^user_is_admin),
      order_by: [asc: :sort_key, asc: :category_id],
      distinct: true
    )
    |> Repo.all
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
  def create_category(%Tenant{} = tenant, attrs \\ %{}) do
    %Category{ tenant_id: tenant.id, sort_key: Category.get_max_sort_key(tenant) + 10 }
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
    |> Repo.update
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
  def list_widgets_by_tenant(%Tenant{} = tenant, user, user_group_ids) do
    {
      :ok,
      from(w in Widget,
        left_join: wug in "widgets_user_groups",
        on: wug.widget_id == w.id,
        where: w.tenant_id == ^tenant.id and
              (wug.group_id in ^user_group_ids or is_nil(wug.group_id) or ^User.is_admin?(user, tenant)),
        distinct: w.id
      )
      |> Repo.all()
    }
  end

  @doc """
  Returns the list of widgets for a given category id.

  ## Examples

      iex> list_widgets_by_tenant_and_category_id()
      [%Category{}, ...]

  """
  def list_widgets_by_tenant_and_category_id(%Tenant{} = tenant, category_id, user, user_group_ids) do
    category = get_category!(category_id)
    cond do
      category == nil ->
        {:error, "Die Kategorie existiert nicht."}
      category.tenant_id != tenant.id ->
        {:error, "Die Kategorie ist nicht gültig."}
      true ->
        {
          :ok,
          from(w in Widget,
            left_join: wug in "widgets_user_groups",
            on: wug.widget_id == w.id,
            join: cw in "categories_widgets",
            on: cw.widget_id == w.id,
            where: cw.category_id == ^category_id and
                  (wug.group_id in ^user_group_ids or is_nil(wug.group_id) or ^User.is_admin?(user, tenant)),
            distinct: w.id
          )
          |> Repo.all()
        }
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
