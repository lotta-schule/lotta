defmodule Api.System do
  import Ecto.Query
  import Api.Accounts.Permissions

  alias Api.Repo
  alias Api.Accounts.File
  alias Api.System.{Category, Configuration, CustomDomain, Widget}

  @allowed_configuration_keys [
    "title",
    "custom_theme",
    "logo_image_file",
    "background_image_file"
  ]

  def data() do
    Dataloader.Ecto.new(Repo, query: &query/2)
  end

  def query(queryable, _params) do
    queryable
  end

  def resolve_widgets(_args, %{context: context, source: category}) do
    user_group_ids = context[:user_group_ids] || []
    user_is_admin = context[:user_is_admin]

    widgets =
      from(w in Widget,
        left_join: wug in "widgets_user_groups",
        on: wug.widget_id == w.id,
        join: cw in "categories_widgets",
        on: w.id == cw.widget_id,
        where:
          (^user_is_admin or wug.group_id in ^user_group_ids or is_nil(wug.group_id)) and
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

    iex> get_configuration()
    iex> |> put_configuration("title", "Meine Schule")
    %{title: "Meine Schule"}
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

  @doc """
  """
  @doc since: "2.0.0"

  @spec update_configuration(map(), map()) :: map()

  def update_configuration(system, attributes) do
    Enum.reduce(attributes, system, fn {key, value}, system ->
      {:ok, system} = put_configuration(system, ensure_atom(key), value)
      system
    end)
  end

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

  @spec ensure_atom(String.t() | atom()) :: atom()

  defp ensure_atom(value) when is_atom(value), do: value
  defp ensure_atom(value) when is_binary(value), do: String.to_atom(value)

  def get_main_url(options \\ []) do
    config = get_configuration()
    protocol = unless options[:skip_protocol], do: "https://", else: ""
    "#{protocol}#{config[:slug]}#{Application.fetch_env!(:api, :base_url)}"
  end

  def list_custom_domains() do
    Repo.all(CustomDomain)
  end

  @doc """
  Returns the list of categories.

  ## Examples

      iex> list_categories()
      [%Category{}, ...]

  """
  def list_categories(_user, user_group_ids, user_is_admin) do
    from(c in Category,
      left_join: cug in "categories_user_groups",
      on: cug.category_id == c.id,
      where: cug.group_id in ^user_group_ids or is_nil(cug.group_id) or ^user_is_admin,
      order_by: [asc: :sort_key, asc: :category_id],
      distinct: true
    )
    |> Repo.all()
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
    %Category{sort_key: Category.get_max_sort_key() + 10}
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

  @doc """
  Returns the list of widgets.

  ## Examples

      iex> list_widgets()
      [%Category{}, ...]

  """
  def list_widgets(user, user_group_ids) do
    {
      :ok,
      from(w in Widget,
        left_join: wug in "widgets_user_groups",
        on: wug.widget_id == w.id,
        where: wug.group_id in ^user_group_ids or is_nil(wug.group_id) or ^user_is_admin?(user),
        distinct: w.id
      )
      |> Repo.all()
    }
  end

  @doc """
  Returns the list of widgets for a given category id.

  ## Examples

      iex> list_widgets_by_category_id()
      [%Category{}, ...]

  """
  def list_widgets_by_category_id(
        category_id,
        user,
        user_group_ids
      ) do
    category = get_category!(String.to_integer(category_id))

    cond do
      category == nil ->
        {:error, "Die Kategorie existiert nicht."}

      true ->
        {
          :ok,
          from(w in Widget,
            left_join: wug in "widgets_user_groups",
            on: wug.widget_id == w.id,
            join: cw in "categories_widgets",
            on: cw.widget_id == w.id,
            where:
              cw.category_id == ^String.to_integer(category_id) and
                (is_nil(wug.group_id) or ^user_is_admin?(user) or wug.group_id in ^user_group_ids),
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
