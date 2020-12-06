defmodule Api.Content do
  @moduledoc """
  The Content context.
  """

  import Ecto.Query

  alias Api.Repo
  alias Api.Accounts.{User, UserGroup}
  alias Api.Content.{Article, ContentModule, ContentModuleResult}
  alias Api.System.Category

  @type filter() :: %{
          optional(:first) => pos_integer(),
          optional(:updated_before) => NaiveDateTime.t()
        }

  def data() do
    Dataloader.Ecto.new(Repo, query: &query/2)
  end

  def query(queryable, _params) do
    queryable
  end

  @doc """
  Returns the list of articles for a category page or start page,
  given a user and an optional filter

  ## Examples

      iex> list_articles(nil, %User{id: 1}, [], false)
      [%Article{}, ...]

  """
  @doc since: "1.0.0"
  @spec list_articles(Article.id(), User.t(), list(UserGroup.t()), boolean(), filter()) :: [
          Article.t()
        ]
  def list_articles(category_id, user, user_groups, user_is_admin, filter) do
    query = list_public_articles(user, user_groups, user_is_admin)

    case category_id do
      nil ->
        from [..., c] in query, where: c.hide_articles_from_homepage != true

      category_id ->
        from a in query, where: a.category_id == ^category_id
    end
    |> filter_query(filter)
    |> Repo.all()
  end

  @doc """
  Get all the available topic

  ## Examples
      
      iex> list_topics(nil, [], false)
      ["Topic 1", "Topic 2", ...]
  """
  @doc since: "1.2.0"
  @spec list_topics(User.t(), list(UserGroup.t()), boolean()) :: [String.t()]
  def list_topics(user, groups, is_admin) do
    query = list_public_articles(user, groups, is_admin)

    Ecto.Query.from([a, ...] in query,
      where: not is_nil(a.topic),
      select: a.topic
    )
    |> Repo.all()
  end

  @doc """
  Returns the list of articles belonging to a topic, regarding user.

  ## Examples

      iex> list_articles(topic)
      [%Article{}, ...]

  """
  @doc since: "1.0.0"
  @spec list_articles_by_topic(User.t(), list(UserGroup.t()), boolean(), String.t()) ::
          list(Article.t())
  def list_articles_by_topic(user, user_groups, user_is_admin, topic) do
    query = list_public_articles(user, user_groups, user_is_admin)

    from(a in query,
      where: a.topic == ^topic,
      order_by: [desc: :updated_at]
    )
    |> Repo.all()
  end

  @doc """
  Returns the list of all unpublished articles that are ready to publish but miss admin confirmation

  ## Examples

      iex> list_unpublished_articles()
      [%Article{}, ...]

  """
  @doc since: "1.0.0"
  @spec list_unpublished_articles() :: [Article.t()]
  def list_unpublished_articles() do
    Ecto.Query.from(a in Article,
      where: a.ready_to_publish == true and is_nil(a.category_id)
    )
    |> Repo.all()
  end

  @doc """
  Returns the list of articles a given user is author or co-author

  ## Examples

      iex> list_user_articles(topic)
      [%Article{}, ...]

  """
  @doc since: "1.0.0"
  @spec list_user_articles(User.t()) :: [Article.t()]
  def list_user_articles(user) do
    Ecto.Query.from(a in Article,
      join: au in "article_users",
      on: au.article_id == a.id,
      where: au.user_id == ^user.id,
      order_by: :id
    )
    |> Repo.all()
  end

  @doc """
  Gets a single article.

  Raises `Ecto.NoResultsError` if the Article does not exist.

  ## Examples

      iex> get_article(123)
      %Article{}

      iex> get_article(456)
      ** (Ecto.NoResultsError)

  """
  def get_article(id) do
    Repo.get(Article, id)
  end

  @doc """
  Creates an article for a given user

  ## Examples

      iex> create_article(%{field: value}, %User{id: 1})
      {:ok, %Article{}}

      iex> create_article(%{field: bad_value}, %User{id: 1})
      {:error, %Ecto.Changeset{}}

  """
  @doc since: "1.0.0"
  @spec create_article(map(), User.t()) :: {:ok, Article.t()} | {:error, Ecto.Changeset.t()}
  def create_article(attrs, user) do
    %Article{}
    |> Article.create_changeset(attrs)
    |> Ecto.Changeset.put_assoc(:users, [user])
    |> Repo.insert()
  end

  @doc """
  Updates a article.

  ## Examples

      iex> update_article(article, %{field: new_value})
      {:ok, %Article{}}

      iex> update_article(article, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  @doc since: "1.0.0"
  @spec update_article(Article.t(), map()) :: {:ok, Article.t()} | {:error, Ecto.Changeset.t()}
  def update_article(%Article{} = article, attrs) do
    article
    |> Article.changeset(attrs)
    |> Repo.update()
    |> case do
      {:ok, article} = result ->
        Elasticsearch.put_document(Api.Elasticsearch.Cluster, article, "articles")
        result

      result ->
        result
    end
  end

  @doc """
  Deletes a Article.

  ## Examples

      iex> delete_article(article)
      {:ok, %Article{}}

      iex> delete_article(article)
      {:error, %Ecto.Changeset{}}

  """
  @doc since: "1.0.0"
  @spec delete_article(Article.t()) :: {:ok, Article.t()} | {:error, Ecto.Changeset.t()}
  def delete_article(%Article{} = article) do
    case Repo.delete(article) do
      {:ok, article} = result ->
        Elasticsearch.delete_document(Api.Elasticsearch.Cluster, article, "articles")
        result

      result ->
        result
    end
  end

  @doc """
  Gets a single content_module.
  Returns nil if no result is found.

  ## Examples

      iex> get_content_module(123)
      %ContentModule{}

      iex> get_content_module(456)
      nil

  """
  @doc since: "1.0.0"
  @spec get_content_module(ContentModule.t()) :: ContentModule.t() | nil
  def get_content_module(id), do: Repo.get(ContentModule, id)

  @doc """
  Save a given result set for a given content module, optionally setting user
  """
  @doc since: "1.4.0"
  @spec save_content_module_result(ContentModule.t(), map(), User.t() | nil) ::
          {:ok, ContentModuleResult.t()} | {:error, Ecto.Changeset.t()}
  def save_content_module_result(%ContentModule{} = content_module, result, user) do
    content_module
    |> Ecto.build_assoc(:results, %{result: result, user_id: user && user.id})
    |> Repo.insert()
  end

  def toggle_article_pin(article) do
    article
    |> Ecto.Changeset.change(%{is_pinned_to_top: !article.is_pinned_to_top})
    |> Repo.update()
  end

  def list_public_articles(_user, user_groups, user_is_admin) do
    from(a in Article,
      left_join: aug in "articles_user_groups",
      on: aug.article_id == a.id,
      join: c in Category,
      on: c.id == a.category_id,
      where:
        not is_nil(a.category_id) and
          (is_nil(aug.group_id) or aug.group_id in ^Enum.map(user_groups, & &1.id) or
             ^user_is_admin),
      distinct: true
    )
  end

  defp filter_query(query, filter) do
    query = from q in query, order_by: [desc: :updated_at, desc: :id]

    (filter || %{})
    |> Enum.reduce(query, fn
      {_, nil}, query ->
        query

      {:first, limit}, query ->
        from q in query, limit: ^limit

      {:updated_before, updated_before}, query ->
        from q in query, where: q.updated_at < ^updated_before
    end)
  end
end
