defmodule Lotta.Tenants do
  @moduledoc """
  This module is for managing the tenants.
  """
  require Logger

  import Ecto.Query

  alias LottaWeb.Schema.Tenants.Tenant
  alias Lotta.Administration.Cockpit
  alias LottaWeb.Schema.Tenants.Tenant
  alias Ecto.Multi
  alias Lotta.{Accounts, Email, Mailer, Repo, Storage}
  alias Lotta.Accounts.{User, UserGroup}
  alias Lotta.Content.Article
  alias Lotta.Storage.File

  alias Lotta.Tenants.{
    Category,
    CustomDomain,
    Feedback,
    Tenant,
    TenantDbManager,
    Usage,
    UsageLog,
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
  List all tenants that have an eduplaces_id set.
  """
  @doc since: "6.1.0"
  @spec list_eduplaces_tenants() :: [Tenant.t()]
  def list_eduplaces_tenants() do
    from(t in Tenant,
      where: not is_nil(t.eduplaces_id)
    )
    |> Repo.all(prefix: "public")
  end

  @doc """
  Wether a given slug is available.
  A slug is available if it is not already taken by another tenant
  and it is not reserved.
  """
  @doc since: "6.1.0"
  @spec slug_available?(String.t()) :: boolean()
  def slug_available?(slug),
    do: slug not in get_occupied_slugs() and slug not in get_reserved_slugs()

  @doc """
  List all non-available slugs.
  A slug is available if it is not already taken by another tenant.
  """
  @doc since: "6.1.0"
  @spec get_occupied_slugs() :: [String.t()]
  def get_occupied_slugs() do
    from(t in Tenant, select: t.slug)
    |> Lotta.Repo.all()
  end

  @doc """
  List all reserved slugs.
  A slug is reserved if it is not allowed to be used by a tenant.
  """
  @doc since: "6.1.0"
  @spec get_reserved_slugs() :: [String.t()]
  def get_reserved_slugs(),
    do: [
      "www",
      "admin",
      "api",
      "mail",
      "ftp",
      "smtp",
      "pop3",
      "imap",
      "webmail",
      "blog",
      "shop",
      "test",
      "staging",
      "preview",
      "demo",
      "support",
      "help",
      "status",
      "secure",
      "portal",
      "intranet",
      "intern",
      "internal",
      "static",
      "assets",
      "files",
      "data"
    ]

  @doc """
  Create a new tenant.
  """
  @doc since: "2.6.0"
  @spec create_tenant(tenant :: Tenant.empty(), user :: User.empty()) ::
          {:ok, Tenant.t()} | {:error, Ecto.Changese.t()} | {:error, String.t()}
  def create_tenant(tenant, user) do
    with {:ok, tenant, user} <- setup_tenant(tenant, user),
         {:ok, _job} <- Lotta.Worker.Tenant.setup_default_content(tenant, user) do
      {:ok, tenant}
    else
      {:error, %Ecto.Changeset{} = changeset} ->
        {:error, changeset}

      error ->
        Logger.error("Error creating tenant: #{inspect(error)}")
        {:error, "Error creating default content"}
    end
  end

  @spec setup_tenant(tenant :: Tenant.empty(), user :: User.empty()) ::
          {:ok, Tenant.t()} | {:error, term()}
  defp setup_tenant(tenant, user) do
    tenant_params = Map.from_struct(tenant)
    user_params = Map.from_struct(user)

    Multi.new()
    |> Multi.put(:user_params, user_params)
    |> Multi.insert(:new_tenant_without_prefix, Tenant.create_changeset(tenant_params))
    |> Multi.update(:new_tenant, fn %{new_tenant_without_prefix: tenant} ->
      Ecto.Changeset.change(tenant, prefix: "tenant_#{tenant.id}")
    end)
    |> Multi.update(:tenant, fn %{new_tenant: tenant} ->
      Tenant.update_changeset(tenant, %{prefix: tenant.prefix || "tenant_#{tenant.id}"})
    end)
    |> Multi.run(:migrations, fn _repo, %{tenant: tenant} ->
      TenantDbManager.create_tenant_database_schema(tenant)
    end)
    |> Multi.run(:user, fn _repo, %{tenant: tenant, user_params: user_params} ->
      register_and_setup_admin_user(tenant, user_params)
    end)
    |> Repo.transaction()
    |> case do
      {:ok, %{tenant: tenant, user: user}} ->
        {:ok, tenant, user}

      {:error, failed_operation, failed_value, _changes_so_far} ->
        msg =
          "Error creating new tenant: while #{inspect(failed_operation)}: #{inspect(failed_value)}"

        Logger.error(msg)

        Sentry.capture_message(msg)

        message =
          if is_struct(failed_value, Ecto.Changeset),
            do: failed_value,
            else: "#{failed_operation}: #{failed_value}"

        {:error, message}
    end
  end

  @spec register_and_setup_admin_user(Tenant.t(), map()) :: {:ok, User.t()} | {:error, term()}
  defp register_and_setup_admin_user(tenant, user_params) do
    with {:ok, user} <- register_user_for_tenant(user_params, tenant) do
      user
      |> User.update_changeset(%{
        groups: [
          %UserGroup{
            name: "Administrator",
            sort_key: 0,
            is_admin_group: true
          }
        ]
      })
      |> Repo.update(prefix: tenant.prefix)
    end
  end

  @spec register_user_for_tenant(map(), Tenant.t()) :: {:ok, User.t()} | {:error, term()}
  defp register_user_for_tenant(user_params, tenant) do
    case user_params do
      %{eduplaces_id: eduplaces_id}
      when not is_nil(eduplaces_id) and byte_size(eduplaces_id) > 0 ->
        Accounts.register_eduplaces_user(tenant, %Lotta.Eduplaces.UserInfo{
          id: eduplaces_id,
          username: user_params[:name]
        })

      %{email: email} when not is_nil(email) and byte_size(email) > 0 ->
        Accounts.register_user_by_mail(tenant, user_params)

      _ ->
        {:error, "Either email or eduplaces_id must be set for the user"}
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

    TenantDbManager.delete_tenant_schema(tenant)

    result
  end

  @doc """
  Get a Tenant by id. Return nil if no tenant is found
  """
  @doc since: "2.6.0"
  @spec get_tenant(Tenant.id()) :: Tenant.t() | nil
  def get_tenant(id), do: Repo.get(Tenant, id, prefix: "public")

  @doc """
  Get a tenant by its slug.
  """
  @doc since: "2.6.0"
  @spec get_tenant_by_slug(String.t()) :: Tenant.t() | nil
  def get_tenant_by_slug(slug), do: Repo.get_by(Tenant, %{slug: slug}, prefix: "public")

  @doc """
  Get a tenant by its prefix.
  """
  @doc since: "2.6.0"
  @spec get_tenant_by_prefix(String.t()) :: Tenant.t() | nil
  def get_tenant_by_prefix(prefix), do: Repo.get_by(Tenant, %{prefix: prefix}, prefix: "public")

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
  Get a tenant by its eduplaces school id.
  """
  @doc since: "6.1.0"
  @spec get_tenant_by_eduplaces_id(String.t()) :: Tenant.t() | nil
  def get_tenant_by_eduplaces_id(eduplaces_id) do
    from(t in Tenant,
      where: t.eduplaces_id == ^eduplaces_id
    )
    |> Repo.one(prefix: "public")
  end

  @doc """
  Get all custom domains for a tenant
  """
  @doc since: "4.2.0"
  @spec get_custom_domains(Tenant.t()) :: CustomDomain.t()
  def get_custom_domains(tenant) do
    tenant
    |> Repo.preload(:custom_domains, prefix: "public")
    |> Map.get(:custom_domains)
    |> Enum.sort_by(& &1.is_main_domain)
  end

  @doc """
  Update a tenant.
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
  Set the tenant's state to `:active` or `:readonly`.
  """
  @doc since: "6.1.0"
  @spec update_state(Tenant.t(), :active | :readonly) ::
          {:ok, Tenant.t()} | {:error, Ecto.Changeset.t(Tenant.t())}
  def update_state(tenant, state) when state in [:active, :readonly] do
    tenant
    |> Ecto.Changeset.change(state: state)
    |> Repo.update()
  end

  @doc """
  Get a few interesting stats for a given tenant.
  These are:
  - user count
  - article count
  - category count
  - file count

  ## Examples

    iex> get_stats(tenant)
    %{user_count: 123, article_count: 456, category_count: 789, file_count: 1011}

  """
  @doc since: "4.2.0"
  @spec get_stats(Tenant.t()) :: Tenant.stats()
  def get_stats(%Tenant{prefix: prefix}) do
    %{
      user_count: Repo.aggregate(User, :count, prefix: prefix),
      article_count: Repo.aggregate(Article, :count, prefix: prefix),
      category_count: Repo.aggregate(Category, :count, prefix: prefix),
      file_count: Repo.aggregate(File, :count, prefix: prefix)
    }
  end

  @doc """
  Get media and storage usage for a given tenant.
  """
  @spec get_usage(Tenant.t() | nil) :: {:ok, list(map())} | {:error, term()}
  def get_usage(tenant \\ current()), do: Usage.get_usage(tenant)

  @doc """
  Creates a usage log entry for a tenant.
  The date is automatically set to today's date.
  """
  @doc since: "6.1.0"
  @spec create_usage_log_entry(
          tenant :: Tenant.t(),
          type :: atom(),
          value :: String.t(),
          unique_identifier :: String.t() | nil
        ) ::
          {:ok, UsageLog.t()} | {:error, Ecto.Changeset.t()}
  def create_usage_log_entry(tenant, type, value, unique_identifier \\ nil) do
    %UsageLog{}
    |> UsageLog.changeset(%{
      tenant_id: tenant.id,
      type: type,
      value: value,
      date: Date.utc_today(),
      unique_identifier: unique_identifier
    })
    |> Repo.insert(prefix: "public")
  end

  @doc """
  Creates a usage log entry for total storage used by a tenant.
  Sums all file sizes (excluding file conversions) and creates a log entry.
  """
  @doc since: "6.1.0"
  @spec create_total_storage_log(tenant :: Tenant.t()) ::
          {:ok, UsageLog.t()} | {:error, Ecto.Changeset.t()}
  def create_total_storage_log(tenant) do
    total_storage =
      from(f in File, select: sum(f.filesize))
      |> Repo.one(prefix: tenant.prefix)
      |> case do
        nil -> 0
        sum -> sum
      end

    create_usage_log_entry(tenant, :total_storage_count, to_string(total_storage))
  end

  @doc """
  Creates a usage log entry for active user count (users with at least one group).
  Calculates total users minus users without groups.
  """
  @doc since: "6.1.0"
  @spec create_active_user_count_log(tenant :: Tenant.t()) ::
          {:ok, UsageLog.t()} | {:error, Ecto.Changeset.t()}
  def create_active_user_count_log(tenant) do
    total_user_count =
      from(u in User, select: count(u.id))
      |> Repo.one(prefix: tenant.prefix)

    users_without_groups =
      Repo.put_prefix(tenant.prefix)
      |> then(fn _ -> Accounts.list_users_without_groups() end)

    users_with_groups = total_user_count - length(users_without_groups)

    create_usage_log_entry(tenant, :active_user_count, to_string(users_with_groups))
  end

  @doc """
  Creates both total storage and active user count usage logs for a tenant.
  """
  @doc since: "6.1.0"
  @spec create_usage_logs(tenant :: Tenant.t()) :: :ok | {:error, term()}
  def create_usage_logs(tenant) do
    with {:ok, _storage_log} <- create_total_storage_log(tenant),
         {:ok, _user_log} <- create_active_user_count_log(tenant) do
      :ok
    end
  end

  @doc """
  Returns the list of all categories accessible by the user.

  ## Examples

      iex> list_categories()
      [%Category{}, ...]

  """
  @doc since: "1.0.0"
  @spec list_categories(User.t() | nil) :: list(Category.t())
  def list_categories(user) do
    group_ids = if user, do: Enum.map(user.all_groups, & &1.id), else: []
    is_admin = if user, do: user.is_admin?, else: false

    from(c in Category,
      left_join: g in assoc(c, :groups),
      where:
        ^is_admin or
          is_nil(g.id) or
          g.id in ^group_ids,
      order_by: [asc: c.sort_key, asc: c.category_id],
      preload: [groups: g]
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
  def get_feedback(id) do
    Repo.get(Feedback, id)
  rescue
    e in Ecto.Query.CastError ->
      Logger.error("error casting id : #{inspect(e)}")
      nil
  end

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
      case Cockpit.send_feedback(feedback) do
        :ok ->
          {:ok, feedback}

        {:error, error} ->
          Logger.error("Error sending feedback to lotta team:", %{sentry: %{error: error}})

          feedback
          |> Email.send_feedback_to_lotta_mail(user, message)
          |> Mailer.deliver_now()
      end
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
    case Cockpit.send_message(user, subject, message) do
      :ok ->
        :ok

      {:error, error} ->
        Logger.error("Error sending feedback to lotta team:", %{sentry: %{error: error}})

        Email.create_feedback_for_lotta(subject, message, user)
        |> Mailer.deliver_now()
        |> case do
          {:ok, _} ->
            :ok

          {:error, error} ->
            Logger.error("Error sending feedback to lotta team:", %{sentry: %{error: error}})
            :error
        end
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

  @doc """
  Deletes a feedback permanently.
  """
  @doc since: "4.2.0"
  @spec delete_feedback(Feedback.t()) ::
          {:ok, Feedback.t()} | {:error, Ecto.Changeset.t()}
  def delete_feedback(feedback) do
    Repo.delete(feedback)
  end

  def data() do
    Dataloader.Ecto.new(Repo, query: &query/2)
  end

  def query(queryable, _params) do
    queryable
  end
end
