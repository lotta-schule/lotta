defmodule Lotta.Content do
  @moduledoc """
  The Content context.
  """

  import Ecto.Query

  alias LottaWeb.Schema.Accounts.UserGroup
  alias Lotta.Repo
  alias Lotta.Accounts.{User, UserGroup}
  alias Lotta.Storage.File
  alias Lotta.Content.{Article, ArticleReaction, ContentModule, ContentModuleResult}
  alias Lotta.Tenants.Category

  @type filter() :: %{
          optional(:first) => pos_integer(),
          optional(:updated_before) => DateTime.t()
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

      iex> list_articles(%Category{id: 1}, %User{id: 1}, [])
      [%Article{}, ...]

  """
  @doc since: "1.0.0"
  @spec list_articles(Category.t(), User.t(), filter()) :: [
          Article.t()
        ]
  def list_articles(category, user, filter) do
    query =
      user
      |> Article.get_published_articles_query()

    case category do
      %Category{is_homepage: true} ->
        from([..., c] in query, where: c.hide_articles_from_homepage != true)

      %Category{id: category_id} ->
        from(a in query, where: a.category_id == ^category_id)
    end
    |> filter_query(filter)
    |> Repo.all()
  end

  @doc """
  Get all the available tags

  ## Examples

      iex> list_all_tags(nil)
      ["Tag 1", "Tag 2", ...]
  """
  @doc since: "2.5.0"
  @spec list_all_tags(User.t() | nil) :: [String.t()]
  def list_all_tags(user) do
    query = Article.get_published_articles_query(user)

    from([a, ...] in query,
      where: not is_nil(a.tags),
      select: a.tags
    )
    |> Repo.all()
  end

  @doc """
  Returns the list of articles having a given tag, regarding user.

  ## Examples

      iex> list_articles_by_tag(tag)
      [%Article{}, ...]

  """
  @doc since: "2.5.0"
  @spec list_articles_by_tag(User.t() | nil, String.t()) :: list(Article.t())
  def list_articles_by_tag(user, tag) do
    query =
      user
      |> Article.get_published_articles_query()

    from(a in query,
      where: ^tag in a.tags,
      order_by: [desc: :updated_at]
    )
    |> Repo.all()
  end

  @doc """
  Returns the list of articles being authored by a given user

  ## Examples

      iex> list_articles_by_user(Repo.get(User, 1))
      [%Article{}, ...]

  """
  @doc since: "4.2.0"
  @spec list_articles_by_user(User.t() | nil, User.id()) :: [Article.t()]
  def list_articles_by_user(current_user, user) do
    base_query =
      Article.get_published_articles_query(current_user)

    list_user_articles(user, base_query: base_query)
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
    from(a in Article,
      where: a.ready_to_publish == true and a.published == false
    )
    |> Repo.all()
  end

  @doc """
  Returns the list of articles a given user is author or co-author

  ## Examples

      iex> list_user_articles(user)
      [%Article{}, ...]

  You can also use this  function to get all of the published articles from a given user

  """
  @doc since: "1.0.0"
  @spec list_user_articles(User.t()) :: list(Article.t())
  @spec list_user_articles(User.t(), [{:base_query, Ecto.Query.t()}]) :: list(Article.t())
  def list_user_articles(user, opts \\ []) do
    base_query = Keyword.get(opts, :base_query, Article)

    from(a in base_query,
      join: au in "article_users",
      on: au.article_id == a.id,
      where: au.user_id == ^user.id,
      order_by: [desc: :updated_at, desc: :id],
      limit: 75
    )
    |> Repo.all()
  end

  @doc """
  """
  @doc since: "3.2.0"
  @spec list_articles_with_files_from_user(User.t()) :: [
          {String.t(), Article.t()}
        ]
  def list_articles_with_files_from_user(%User{} = user) do
    articles_with_preview =
      from(a in Article,
        join: f in File,
        on: f.id == a.preview_image_file_id,
        where: f.user_id == ^user.id and a.published == true,
        distinct: true,
        order_by: [desc: :updated_at, asc: :title]
      )
      |> Repo.all()
      |> Enum.map(&{"preview", &1})

    articles_with_contentmodule =
      from(a in Article,
        join: cm in ContentModule,
        on: cm.article_id == a.id,
        join: cmf in "content_module_file",
        on: cmf.content_module_id == cm.id,
        join: f in File,
        on: f.id == cmf.file_id,
        where: f.user_id == ^user.id and a.published == true,
        distinct: true,
        order_by: [desc: :updated_at, asc: :title]
      )
      |> Repo.all()
      |> Enum.map(&{"content_module", &1})

    articles_with_preview ++ articles_with_contentmodule
  end

  @doc """
  Gets a single article.

  Returns nil if article is not found

  ## Examples

      iex> get_article(123)
      %Article{}

      iex> get_article(456)
      nil

  """

  @spec get_article(Article.id()) :: Article.t() | nil

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
    |> Article.create_changeset(attrs, [user])
    |> Repo.insert(prefix: Ecto.get_meta(user, :prefix))
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
    |> Repo.update(prefix: Ecto.get_meta(article, :prefix))
  end

  @doc """
  This function unpublishes all articles of a single given group.
  """
  @doc since: "4.2.0"
  @spec unpublish_articles_of_single_group(UserGroup.t()) ::
          {:ok, [Article.t()]} | {:error, Ecto.Changeset.t()}
  def unpublish_articles_of_single_group(%UserGroup{id: group_id}) do
    article_ids_with_only_one_group =
      from(aug in "articles_user_groups",
        select: aug.article_id,
        group_by: aug.article_id,
        having: count(aug.article_id) == 1
      )

    articles_to_unpublish =
      from(a in Article,
        left_join: aug in "articles_user_groups",
        on: aug.article_id == a.id,
        right_join: aug2 in subquery(article_ids_with_only_one_group),
        on: aug2.article_id == a.id,
        where:
          a.published == true and
            aug.group_id == ^group_id,
        order_by: [desc: a.updated_at, desc: a.inserted_at, desc: a.id]
      )
      |> Repo.all()

    updated_at = DateTime.utc_now()

    Repo.update_all(
      from(a in Article,
        where: a.id in ^Enum.map(articles_to_unpublish, & &1.id)
      ),
      set: [published: false, ready_to_publish: true, updated_at: updated_at]
    )

    {:ok,
     articles_to_unpublish
     |> Enum.map(fn article ->
       article
       |> Map.put(:published, false)
       |> Map.put(:ready_to_publish, true)
       |> Map.put(:updated_at, updated_at)
     end)}
  end

  @doc """
  Deletes an Article.

  ## Examples

      iex> delete_article(article)
      {:ok, %Article{}}

      iex> delete_article(article)
      {:error, %Ecto.Changeset{}}

  """
  @doc since: "1.0.0"
  @spec delete_article(Article.t()) :: {:ok, Article.t()} | {:error, Ecto.Changeset.t()}
  def delete_article(%Article{} = article) do
    Repo.delete(article)
  end

  @doc """
  Adds a user reaction to an article.
  If the user has already reacted to the article, the reaction will be updated.
  If the user has already reacted with the same reaction, the reaction will be removed.
  """
  @doc since: "5.0.0"
  @spec create_article_reaction(Article.t(), User.t(), String.t()) ::
          {:ok, ArticleReaction.t()} | {:error, Ecto.Changeset.t()} | {:error, String.t()}
  def create_article_reaction(article, user, type) do
    type = String.upcase(type)

    Ecto.Multi.new()
    |> Ecto.Multi.one(
      :existing_like,
      from(ar in ArticleReaction,
        where: ar.article_id == ^article.id and ar.user_id == ^user.id and ar.type == ^type
      ),
      prefix: Ecto.get_meta(article, :prefix)
    )
    |> Ecto.Multi.delete_all(
      :delete_existing_reactions,
      from(ar in ArticleReaction,
        where: ar.article_id == ^article.id and ar.user_id == ^user.id
      ),
      prefix: Ecto.get_meta(article, :prefix)
    )
    |> Ecto.Multi.run(
      :insert_reaction,
      fn
        repo, %{existing_like: nil} ->
          ArticleReaction.changeset(%ArticleReaction{}, %{
            article_id: article.id,
            user_id: user.id,
            type: type
          })
          |> repo.insert(prefix: Ecto.get_meta(article, :prefix))

        _repo, _changes ->
          {:ok, nil}
      end
    )
    |> Repo.transaction()
    |> case do
      {:ok, %{insert_reaction: reaction}} -> {:ok, reaction}
      {:error, _, failed_value, _} -> {:error, failed_value}
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
    |> Repo.build_prefixed_assoc(:results, %{result: result, user_id: user && user.id})
    |> Repo.insert()
  end

  def toggle_article_pin(article) do
    article
    |> Ecto.Changeset.change(%{is_pinned_to_top: !article.is_pinned_to_top})
    |> Repo.update()
  end

  defp filter_query(query, filter) do
    query = from(q in query, order_by: [desc: :updated_at, desc: :id])

    (filter || %{})
    |> Enum.reduce(query, fn
      {_, nil}, query ->
        query

      {:first, limit}, query ->
        from(q in query, limit: ^limit)

      {:updated_before, updated_before}, query ->
        from(q in query, where: q.updated_at < ^updated_before)
    end)
  end
end
