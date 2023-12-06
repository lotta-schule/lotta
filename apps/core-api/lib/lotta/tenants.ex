defmodule Lotta.Tenants do
  @moduledoc """
  This module is for managing the tenants.
  """
  require Logger

  import Ecto.Query

  alias Ecto.Multi
  alias Lotta.{Email, Mailer, Repo, Storage, TenantSelector}
  alias Lotta.Accounts.User
  alias Lotta.Storage.File

  alias Lotta.Tenants.{
    Category,
    CustomDomain,
    Configuration,
    DefaultContent,
    Feedback,
    Tenant,
    TenantSelector,
    Usage,
    Widget
  }

  defmodule TenantNotSetError, do: defexception(message: "No tenant set for the current process.")

  @doc """
  Get the current context set in the process.
  The process will be identified by its prefix.

  Will raise a TenantNotSetError if no tenant is set in the current process.
  """
  @doc since: "2.6.0"
  @spec current() :: Tenant.t()
  def current() do
    prefix = Repo.get_prefix()

    if is_nil(prefix) do
      raise TenantNotSetError
    else
      from(t in Tenant,
        prefix: "public",
        where: t.prefix == ^Repo.get_prefix()
      )
      |> Repo.one!()
    end
  end

  @doc """
  List all tenants
  """
  @doc since: "2.6.0"
  @spec list_tenants() :: [Tenant.t()]
  def list_tenants() do
    Repo.all(Tenant, prefix: "public")
  end

  @doc """
  Create a new tenant.
  """
  @doc since: "2.6.0"
  @spec create_tenant(user_params: map(), tenant: map()) ::
          {:ok, Tenant.t()} | {:error, term(), term()}
  def create_tenant(params) do
    user_params = Keyword.get(params, :user_params)
    tenant_params = Keyword.get(params, :tenant)

    Multi.new()
    |> Multi.put(:user_params, user_params)
    |> Multi.insert(:new_tenant, Tenant.create_changeset(%Tenant{}, tenant_params))
    |> Multi.update(:tenant, fn %{new_tenant: tenant} ->
      Tenant.create_changeset(tenant, %{prefix: tenant.prefix || "tenant_#{tenant.id}"})
    end)
    |> Multi.run(:migrations, fn _repo, %{tenant: tenant} ->
      TenantSelector.create_tenant_database_schema(tenant)
    end)
    |> Multi.merge(&DefaultContent.create_default_content/1)
    |> Repo.transaction(timeout: 120_000)
    |> case do
      {:ok, %{tenant: tenant}} ->
        {:ok, tenant}

      {:error, failed_operation, failed_value, _changes_so_far} ->
        msg =
          "Error creating new tenant: while #{inspect(failed_operation)}: #{inspect(failed_value)}"

        Logger.error(msg)

        Sentry.capture_message(msg)

        {:error, failed_operation, failed_value}
    end
  end

  @doc """
  Deletes a tenant.
  """
  @doc since: "3.3.0"
  @spec delete_tenant(Tenant.t()) ::
          {:ok, Tenant.t()} | {:error, term()}
  def delete_tenant(tenant) do
    Enum.each(
      Repo.all(File, prefix: tenant.prefix),
      fn file ->
        Storage.delete_file(file)
      end
    )

    result = Repo.delete(tenant, prefix: "public")

    TenantSelector.delete_tenant_schema(tenant)

    result
  end

  @doc """
  Get a Tenant by id. Return nil if no tenant is found
  """
  @doc since: "2.6.0"
  @spec get_tenant(Tenant.id()) :: Tenant.t() | nil
  def get_tenant(id) do
    Repo.get(Tenant, id, prefix: "public")
  end

  @doc """
  Get a tenant by its slug.
  """
  @doc since: "2.6.0"
  @spec get_tenant_by_slug(String.t()) :: Tenant.t() | nil
  def get_tenant_by_slug(slug) do
    from(t in Tenant,
      where: t.slug == ^slug
    )
    |> Repo.one(prefix: "public")
  end

  @doc """
  Get a tenant by its prefix.
  """
  @doc since: "2.6.0"
  @spec get_tenant_by_prefix(String.t()) :: Tenant.t() | nil
  def get_tenant_by_prefix(prefix) do
    from(t in Tenant,
      where: t.prefix == ^prefix
    )
    |> Repo.one(prefix: "public")
  end

  @doc """
  Get a tenant by its custom domain
  """
  @doc since: "2.6.0"
  @spec get_by_custom_domain(String.t()) :: Tenant.t() | nil
  def get_by_custom_domain(host) do
    from(t in Tenant,
      join: d in CustomDomain,
      on: d.tenant_id == t.id,
      where: d.host == ^host
    )
    |> Repo.one(prefix: "public")
  end

  @doc """
  Update a tenant. Does *only* update the tenant data
  in the public schema. Does not update the configuration.
  This will effectively only change the title.
  The configuration will have to be updated separatly.
  For more information, see `Lotta.Tenants.update_configuration`
  and `Lotta.Tenant.update_changeset`.
  """
  @doc since: "2.6.0"
  @spec update_tenant(Tenant.t(), map()) ::
          {:ok, Tenant.t()} | {:error, Ecto.Changeset.t(Tenant.t())}
  def update_tenant(tenant, args) do
    tenant
    |> Tenant.update_changeset(args)
    |> Repo.update()
  end

  @doc """
  Gets system configuration from the tenant's schema.
  Always returns an object.

  If no configuration is passed, the process's current
  tenant is used to determine the correct prefix.
  ## Examples

    iex> get_configuration()
    %{title: "Meine Schule"}

    iex> get_configuration(tenant)
    %{title: "Meine Schule"}
  """
  @doc since: "2.0.0"

  @spec get_configuration(Tenant.t() | nil) :: Tenant.configuration()

  def get_configuration(tenant \\ nil)

  def get_configuration(%Tenant{configuration: configuration}) when not is_nil(configuration) do
    configuration
  end

  def get_configuration(tenant) do
    from(c in Configuration)
    |> Tenant.put_query_prefix(tenant)
    |> Repo.all()
    |> Repo.preload(:file_value)
    |> Enum.reduce(
      %{},
      &Map.put(
        &2,
        ensure_atom(&1.name),
        &1.file_value || &1.string_value || &1.json_value
      )
    )
  end

  @doc """
  Update the tenant configuration.
  This function expects a map and will construct the
  configuration lines accordingly and update the database.
  """
  @doc since: "2.0.0"
  @spec update_configuration(Tenant.t(), Tenant.configuration()) ::
          {:ok, %{__struct__: Tenant, configuration: Tenant.configuration()}}
          | {:error, Ecto.Changeset.t()}
  def update_configuration(tenant, configuration) do
    Enum.reduce(configuration, Multi.new(), fn {key, value}, multi ->
      key = to_string(key)

      if Enum.member?(Configuration.possible_keys(), key) do
        configline = make_configuration_line(key, value)

        Multi.insert(
          multi,
          String.to_atom(key),
          Configuration.changeset(configline),
          conflict_target: :name,
          on_conflict: [
            set: [
              string_value: configline[:string_value],
              json_value: configline[:json_value],
              file_value_id: configline[:file_value_id]
            ]
          ],
          prefix: tenant.prefix
        )
      else
        multi
      end
    end)
    |> Repo.transaction()
    |> case do
      {:ok, changes} ->
        config =
          changes
          |> Map.values()
          |> Repo.preload(:file_value)
          |> Enum.reduce(
            %{},
            &Map.put(
              &2,
              ensure_atom(&1.name),
              &1.file_value || &1.string_value || &1.json_value
            )
          )

        {:ok, Map.put(tenant, :configuration, config)}

      {:error, changeset, _} ->
        {:error, changeset}
    end
  end

  @spec make_configuration_line(String.t(), Configuration.value()) :: map()

  defp make_configuration_line(name, nil) do
    %{
      name: name,
      string_value: nil,
      json_value: nil,
      file_value_id: nil
    }
  end

  defp make_configuration_line(name, %File{} = file) do
    %{
      name: name,
      file_value: file,
      file_value_id: Map.get(file, :id)
    }
  end

  defp make_configuration_line(name, %{id: id})
       when binary_part(name, byte_size(name), -4) == "file" do
    %{
      name: name,
      file_value: Repo.get(File, id),
      file_value_id: id
    }
  end

  defp make_configuration_line(name, map) when is_map(map) do
    %{name: to_string(name), json_value: map}
  end

  defp make_configuration_line(name, string) when is_binary(string) do
    %{name: to_string(name), string_value: string}
  end

  defp make_configuration_line(name, number) when is_number(number) do
    %{
      name: name,
      string_value: Integer.to_string(number)
    }
  end

  @doc false
  @spec ensure_atom(String.t() | atom()) :: atom()
  defp ensure_atom(value) when is_atom(value), do: value
  defp ensure_atom(value) when is_binary(value), do: String.to_atom(value)

  @doc """
  Get media and storage usage for a given tenant.
  """
  @spec get_usage(Tenant.t() | nil) :: {:ok, list(map())} | {:error, term()}
  def get_usage(tenant \\ current()), do: Usage.get_usage(tenant)

  @doc """
  Returns the list of all categories accessible by the user.

  ## Examples

      iex> list_categories()
      [%Category{}, ...]

  """
  @doc since: "1.0.0"
  @spec list_categories(User.t() | nil) :: list(Category.t())
  def list_categories(user) do
    groups = if user, do: user.all_groups, else: []
    is_admin = if user, do: user.is_admin?, else: false

    from(c in Category,
      left_join: cug in "categories_user_groups",
      on: cug.category_id == c.id,
      where: cug.group_id in ^Enum.map(groups, & &1.id) or is_nil(cug.group_id) or ^is_admin,
      order_by: [asc: :sort_key, asc: :category_id],
      distinct: true
    )
    |> Repo.all()
  end

  @doc """
  Gets a single category.
  Returns `nil` if no result is found.

  ## Examples

      iex> get_category(123)
      %Category{}

      iex> get_category(456)
      nil

  """
  @doc since: "1.0.0"

  @spec get_category(Category.id()) :: Category.t() | nil

  def get_category(id), do: Repo.get(Category, id)

  @doc """
  Creates a category.

  ## Examples

      iex> create_category(%{field: value})
      {:ok, %Category{}}

      iex> create_category(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  @doc since: "1.0.0"
  @spec create_category(map()) :: {:ok, Category.t()} | {:error, Ecto.Changeset.t()}
  def create_category(attrs \\ %{}) do
    %Category{}
    |> Map.put(:sort_key, Category.get_max_sort_key() + 10)
    |> Category.changeset(attrs)
    |> Repo.insert(prefix: Repo.get_prefix())
  end

  @doc """
  Updates a category.

  ## Examples

      iex> update_category(category, %{field: new_value})
      {:ok, %Category{}}

      iex> update_category(category, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  @doc since: "1.0.0"

  @spec update_category(Category.t(), map()) :: {:ok, Category.t()} | {:error, Ecto.Changeset.t()}

  def update_category(%Category{} = category, attrs) do
    category
    |> Category.changeset(attrs)
    |> Repo.update(prefix: Repo.get_prefix())
  end

  @doc """
  Deletes a Category.

  ## Examples

      iex> delete_category(category)
      {:ok, %Category{}}

      iex> delete_category(category)
      {:error, %Ecto.Changeset{}}

  """
  @doc since: "1.0.0"
  @spec delete_category(Category.t()) :: {:ok, Category.t()} | {:error, Ecto.Changeset.t()}
  def delete_category(%Category{} = category) do
    Repo.delete(category)
  end

  @doc """
  Returns the list of widgets for a given user

  ## Examples

      iex> list_widgets(%User{id: 1}, [])
      [%Category{}, ...]

  """
  @doc since: "1.0.0"
  @spec list_widgets(User.t() | nil) :: list(Widget.t())
  def list_widgets(user) do
    groups = if user, do: user.all_groups, else: []
    is_admin = if user, do: user.is_admin?, else: false

    from(w in Widget,
      left_join: wug in "widgets_user_groups",
      on: wug.widget_id == w.id,
      where:
        wug.group_id in ^Enum.map(groups, & &1.id) or is_nil(wug.group_id) or
          ^is_admin,
      distinct: w.id
    )
    |> Repo.all()
  end

  @doc """
  Returns the list of widgets for a category for a given user

  ## Examples

      iex> list_widgets_by_category_id(%Category{id: 1}, %User{id: 1}, [])
      [%Category{}, ...]

  """
  @doc since: "1.7.0"
  @spec list_widgets_by_category(Category.t(), User.t() | nil) ::
          list(Widget.t())
  def list_widgets_by_category(category, user) do
    groups = if user, do: user.all_groups, else: []
    is_admin = if user, do: user.is_admin?, else: false

    from(w in Widget,
      left_join: wug in "widgets_user_groups",
      on: wug.widget_id == w.id,
      join: cw in "categories_widgets",
      on: cw.widget_id == w.id,
      where:
        cw.category_id == ^category.id and
          (is_nil(wug.group_id) or ^is_admin or
             wug.group_id in ^Enum.map(groups, & &1.id)),
      distinct: w.id
    )
    |> Repo.all()
  end

  @doc """
  Gets a single widget by id.
  Returns `nil` if the widget is not found.

  ## Examples

      iex> get_widget(123)
      %Widget{}

      iex> get_widget(456)
      nil

  """
  @doc since: "1.0.0"
  @spec get_widget(Widget.id()) :: Widget.t()
  def get_widget(id), do: Repo.get(Widget, id)

  @doc """
  Creates a widget.

  ## Examples

      iex> create_widget(%{field: value})
      {:ok, %Widget{}}

      iex> create_widget(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  @doc since: "1.0.0"
  @spec create_widget(map()) :: {:ok, Widget.t()} | {:error, Ecto.Changeset.t()}
  def create_widget(attrs \\ %{}) do
    %Widget{}
    |> Widget.create_changeset(attrs)
    |> Repo.insert(prefix: Repo.get_prefix())
  end

  @doc """
  Updates a given widget.

  ## Examples

      iex> update_widget(widget, %{field: new_value})
      {:ok, %Widget{}}

      iex> update_widget(widget, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  @doc since: "1.0.0"
  @spec update_widget(Widget.t(), map()) :: {:ok, Widget.t()} | {:error, Ecto.Changeset.t()}
  def update_widget(widget, attrs) do
    widget
    |> Widget.changeset(attrs)
    |> Repo.update(prefix: Repo.get_prefix())
  end

  @doc """
  Deletes a Widget.

  ## Examples

      iex> delete_widget(widget)
      {:ok, %Widget{}}

      iex> delete_widget(widget)
      {:error, %Ecto.Changeset{}}

  """
  @doc since: "1.0.0"
  @spec delete_widget(Widget.t()) :: {:ok, Widget.t()} | {:error, Ecto.Changeset.t()}
  def delete_widget(widget) do
    Repo.delete(widget)
  end

  @doc """
  Get a feedback by its id
  """
  @doc since: "4.1.0"
  @spec get_feedback(Feedback.id()) :: Feedback.t() | nil
  def get_feedback(id), do: Repo.get(Feedback, id)

  @doc """
  List all feedbacks for the current tenant.
  """
  @doc since: "4.1.0"
  @spec list_feedbacks() :: [Feedback.t()]
  def list_feedbacks() do
    from(f in Feedback,
      order_by: [desc: :inserted_at]
    )
    |> Repo.all()
  end

  @doc """
    Creates a Feedback, from a given user and attributes,
    for the admins of the current tenant to see.
    Returns the created Feedback or a the errored changeset.
  """
  @doc since: "4.1.0"
  @spec create_feedback(User.t(), map()) :: {:ok, Feedback.t()} | {:error, Ecto.Changeset.t()}
  def create_feedback(user, attrs \\ %{}) do
    %Feedback{}
    |> Feedback.create_changeset(user, attrs)
    |> Repo.insert(prefix: Repo.get_prefix())
  end

  @doc """
  Sends a feedback to the lotta team and sets the
  'is_forwarded' property to true.
  """
  @doc since: "4.1.0"
  @spec send_feedback_to_lotta(Feedback.t(), binary() | nil) ::
          {:ok, Feedback.t()} | {:error, Ecto.Changeset.t()}
  def send_feedback_to_lotta(feedback, user, message \\ nil) do
    Ecto.Multi.new()
    |> Ecto.Multi.update(:feedback, Ecto.Changeset.change(feedback, is_forwarded: true))
    |> Ecto.Multi.run(:send_feedback, fn _repo, %{feedback: feedback} ->
      feedback
      |> Email.send_feedback_to_lotta_mail(user, message)
      |> Mailer.deliver_now()
    end)
    |> Repo.transaction()
    |> then(fn
      {:ok, %{feedback: feedback}} ->
        {:ok, feedback}

      error ->
        error
    end)
  end

  @doc """
  Sends a message to the lotta team
  """
  @doc since: "4.1.0"
  @spec create_feedback_for_lotta(binary(), binary() | nil, User.t()) ::
          :ok | :error
  def create_feedback_for_lotta(subject, message, user) do
    Email.create_feedback_for_lotta(subject, message, user)
    |> Mailer.deliver_now()
    |> case do
      {:ok, _} ->
        :ok

      {:error, error} ->
        error
    end
  end

  @doc """
  Responds to a feedback via mail and sets the 'is_responded' property to true.
  """
  @doc since: "4.1.0"
  @spec respond_to_feedback(Feedback.t(), User.t(), binary() | nil, binary()) ::
          {:ok, Feedback.t()} | {:error, Ecto.Changeset.t()}
  def respond_to_feedback(feedback, user, subject, message) do
    Ecto.Multi.new()
    |> Ecto.Multi.update(:feedback, Ecto.Changeset.change(feedback, is_responded: true))
    |> Ecto.Multi.run(:send_response, fn _repo, %{feedback: feedback} ->
      feedback
      |> Email.send_feedback_response_mail(user, subject, message)
      |> Mailer.deliver_now()
    end)
    |> Repo.transaction()
    |> then(fn
      {:ok, %{feedback: feedback}} ->
        {:ok, feedback}

      error ->
        error
    end)
  end

  def data() do
    Dataloader.Ecto.new(Repo, query: &query/2)
  end

  def query(queryable, _params) do
    queryable
  end
end
