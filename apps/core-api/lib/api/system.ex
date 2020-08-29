defmodule Api.System do
  import Ecto.Query
  import Api.Accounts.Permissions

  alias Api.Repo
  alias Api.System.{Category, CustomDomain, Widget}

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

  def get_configuration() do
    %{
      title: "Ehrenberg-Gymnasium Delitzsch",
      slug: "ehrenberg",
      custom_theme: %{
        "overrides" => %{
          "LottaArticlePreview" => %{
            "title" => %{
              "fontFamily" => "Schoolbell"
            }
          }
        },
        "palette" => %{
          "background" => %{
            "default" => "#eee9e4"
          },
          "secondary" => %{
            "main" => "#ff5424"
          }
        },
        "typography" => %{
          "body1" => %{
            "fontFamily" => "Montserrat",
            "fontSize" => "1rem",
            "fontWeight" => 400,
            "lineHeight" => 1.5
          },
          "body2" => %{
            "fontFamily" => "Montserrat",
            "fontSize" => "0.875rem",
            "fontWeight" => 400,
            "lineHeight" => 1.43
          },
          "button" => %{
            "fontFamily" => "Montserrat",
            "fontSize" => "0.875rem",
            "fontWeight" => 500,
            "lineHeight" => 1.75,
            "textTransform" => "uppercase"
          },
          "caption" => %{
            "fontFamily" => "Montserrat",
            "fontSize" => "0.75rem",
            "fontWeight" => 400,
            "lineHeight" => 1.66
          },
          "fontFamily" => "Montserrat",
          "fontSize" => 14,
          "fontWeightBold" => 700,
          "fontWeightLight" => 300,
          "fontWeightMedium" => 500,
          "fontWeightRegular" => 400,
          "h1" => %{
            "fontFamily" => "Montserrat",
            "fontSize" => "6rem",
            "fontWeight" => 300,
            "lineHeight" => 1.167
          },
          "h2" => %{
            "fontFamily" => "Montserrat",
            "fontSize" => "3.75rem",
            "fontWeight" => 300,
            "lineHeight" => 1.2
          },
          "h3" => %{
            "fontFamily" => "Montserrat",
            "fontSize" => "3rem",
            "fontWeight" => 400,
            "lineHeight" => 1.167
          },
          "h4" => %{
            "fontFamily" => "Montserrat",
            "fontSize" => "2.125rem",
            "fontWeight" => 400,
            "lineHeight" => 1.235
          },
          "h5" => %{
            "fontFamily" => "Montserrat",
            "fontSize" => "1.5rem",
            "fontWeight" => 400,
            "lineHeight" => 1.334
          },
          "h6" => %{
            "fontFamily" => "Montserrat",
            "fontSize" => "1.25rem",
            "fontWeight" => 500,
            "lineHeight" => 1.6
          },
          "htmlFontSize" => 16,
          "overline" => %{
            "fontFamily" => "Montserrat",
            "fontSize" => "0.75rem",
            "fontWeight" => 400,
            "lineHeight" => 2.66,
            "textTransform" => "uppercase"
          },
          "subtitle1" => %{
            "fontFamily" => "Montserrat",
            "fontSize" => "1rem",
            "fontWeight" => 400,
            "lineHeight" => 1.75
          },
          "subtitle2" => %{
            "fontFamily" => "Montserrat",
            "fontSize" => "0.875rem",
            "fontWeight" => 500,
            "lineHeight" => 1.57
          }
        }
      }
    }
  end

  def get_main_url(options \\ []) do
    protocol = unless options[:skip_protocol], do: "https://", else: ""
    "#{protocol}ehrenberg.lotta.schule"
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
