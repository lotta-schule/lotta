defmodule Api.System do
  import Ecto.Query

  alias Api.Repo
  alias Api.Accounts.{File, User}
  alias Api.System.{Category, Configuration, Widget}

  @allowed_configuration_keys [
    "title",
    "custom_theme",
    "logo_image_file",
    "background_image_file",
    "user_max_storage_config"
  ]

  @type get_url_options() :: [skip_protocol: boolean()]

  def data() do
    Dataloader.Ecto.new(Repo, query: &query/2)
  end

  def query(queryable, _params) do
    queryable
  end

  @doc false
  def resolve_widgets(_args, %{
        context: %ApiWeb.Context{current_user: %User{all_groups: groups, is_admin?: is_admin}},
        source: %Category{} = category
      }) do
    widgets =
      from(w in Widget,
        left_join: wug in "widgets_user_groups",
        on: wug.widget_id == w.id,
        join: cw in "categories_widgets",
        on: w.id == cw.widget_id,
        where:
          (^is_admin or wug.group_id in ^Enum.map(groups, & &1.id) or is_nil(wug.group_id)) and
            cw.category_id == ^category.id,
        distinct: w.id
      )
      |> Repo.all()

    {:ok, widgets}
  end

  @doc """
  Gets system configuration.
  Merges static application default configuration with custom config from database.
  The configuration from the database overwrites the default configuration.
  Always returns an object.

  ## Examples

    iex> get_configuration()
    %{title: "Meine Schule"}
  """
  @doc since: "2.0.0"

  @spec get_configuration() :: map()

  def get_configuration() do
    custom_configuration =
      Repo.all(Configuration)
      |> Enum.reduce(%{}, fn configuration_line, system ->
        %{name: name, file_value: file, string_value: string, json_value: json} =
          Repo.preload(configuration_line, [:file_value])

        system
        |> Map.put(ensure_atom(name), file || string || json)
      end)

    Application.get_env(:api, :default_configuration, %{})
    |> Map.merge(custom_configuration)
  end

  @doc """
  Adds or alters a config line of the systems and persists it.
  Returns a tuple with either :ok and the new system configuration, or :error and the reason

  ## Examples

    iex> Api.System.get_configuration()
    iex> |> put_configuration("title", "Meine Schule")
    {:ok, %{title: "Meine Schule"}}
  """
  @doc since: "2.0.0"

  @spec put_configuration(map(), String.t() | atom(), Configuration.value()) ::
          {:ok, map()} | {:error, term()}

  def put_configuration(system, name, value) when is_atom(name),
    do: put_configuration(system, to_string(name), value)

  def put_configuration(system, name, value) when name in @allowed_configuration_keys do
    configline = make_configuration_line(name, value)

    configline
    |> Repo.insert(
      conflict_target: :name,
      on_conflict: [
        set: [
          string_value: configline.string_value,
          json_value: configline.json_value,
          file_value_id: configline.file_value_id
        ]
      ]
    )
    |> case do
      {:ok, _} ->
        {:ok, Map.put(system, ensure_atom(name), value)}

      error ->
        error
    end
  end

  def put_configuration(_, name, _), do: {:error, "key #{name} is not allowed"}

  @doc false
  @doc since: "2.0.0"

  @spec update_configuration(map(), map()) :: map()

  def update_configuration(system, attributes) do
    Enum.reduce(attributes, system, fn {key, value}, system ->
      {:ok, system} = put_configuration(system, ensure_atom(key), value)
      system
    end)
  end

  @doc false
  @spec make_configuration_line(String.t() | atom(), Configuration.value()) :: Configuration.t()

  defp make_configuration_line(name, nil) do
    %Configuration{
      name: to_string(name),
      string_value: nil,
      json_value: nil,
      file_value_id: nil,
      file_value: nil
    }
  end

  defp make_configuration_line(name, %File{id: id} = file) do
    %Configuration{name: to_string(name), file_value_id: id, file_value: file}
  end

  defp make_configuration_line(name, %{id: id})
       when binary_part(name, byte_size(name), -4) == "file" do
    %Configuration{
      name: to_string(name),
      file_value_id: String.to_integer(id),
      file_value: Repo.get(File, String.to_integer(id))
    }
  end

  defp make_configuration_line(name, map) when is_map(map) do
    %Configuration{name: to_string(name), json_value: map}
  end

  defp make_configuration_line(name, string) when is_binary(string) do
    %Configuration{name: to_string(name), string_value: string}
  end

  @doc false
  @spec ensure_atom(String.t() | atom()) :: atom()
  defp ensure_atom(value) when is_atom(value), do: value
  defp ensure_atom(value) when is_binary(value), do: String.to_atom(value)

  @doc """
  Return the main URL of this instance
  """
  @spec get_main_url(get_url_options() | nil) :: String.t()
  def get_main_url(options \\ []) do
    protocol =
      if options[:skip_protocol] do
        ""
      else
        "https://"
      end

    "#{protocol}#{Application.fetch_env!(:api, :hostname)}"
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
  @doc since: "1.0.0"

  @spec update_category(Category.t(), map()) :: {:ok, Category.t()} | {:error, Ecto.Changeset.t()}

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
    |> Repo.insert()
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
  @doc since: "1.0.0"
  @spec delete_widget(Widget.t()) :: {:ok, Widget.t()} | {:error, Ecto.Changeset.t()}
  def delete_widget(widget) do
    Repo.delete(widget)
  end

  @doc """
  Returrns the limit configured for *private* user folders content.
  If no limit is set, returns -1.
  If a limit is set, returrn the limit in bytes.
  """

  @doc since: "2.4.0"

  @spec get_user_max_storage() :: -1 | pos_integer()

  def get_user_max_storage() do
    with config <- Api.System.get_configuration(),
         {:ok, storage_mb} <- Map.fetch(config, :user_max_storage_config),
         {storage_mb, _} <- Integer.parse(storage_mb) do
      storage_mb * 1024 * 1024
    else
      _ ->
        -1
    end
  end
end
