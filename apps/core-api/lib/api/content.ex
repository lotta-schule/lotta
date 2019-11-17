defmodule Api.Content do
  @moduledoc """
  The Content context.
  """

  import Ecto.Query
  import Ecto.Changeset
  alias Api.Repo

  alias Api.Content.Article
  alias Api.Tenants.{Category,Tenant}
  alias Api.Accounts.{User}

  def data() do
    Dataloader.Ecto.new(Api.Repo, query: &query/2)
  end

  def query(queryable, _params) do
    queryable
  end

  @doc """
  Returns the list of articles for the start page

  ## Examples

      iex> list_articles()
      [%Article{}, ...]

  """
  def list_articles(%Tenant{} = tenant, category_id, user, filter) do
    query = list_public_articles(tenant, user)
    case category_id do
      nil ->
        from(a in query,
          join: c in Category,
          on: c.id == a.category_id,
          where: c.hide_articles_from_homepage != true
        )
      category_id ->
        from a in query, where: a.category_id == ^category_id
    end
    |> filter_query(filter)
    |> Repo.all()
  end
    
  @doc """
  Returns the list of articles belonging to a topic.

  ## Examples

      iex> list_articles(topic)
      [%Article{}, ...]

  """
  def list_articles_by_topic(%Tenant{} = tenant, user, topic) do
    query = list_public_articles(tenant, user)
    from(a in query,
      where: a.topic == ^topic,
      order_by: [desc: :updated_at]
    )
    |> Repo.all
  end
  
  @doc """
  Returns the list of unpublished articles belonging to a tenant.

  ## Examples

      iex> list_unpublished_articles(topic)
      [%Article{}, ...]

  """
  def list_unpublished_articles(%Api.Tenants.Tenant{} = tenant) do
    Repo.all(Ecto.Query.from a in Article, where: a.tenant_id == ^tenant.id and a.ready_to_publish == true and is_nil(a.category_id))
  end
  
  @doc """
  Returns the list of articles for a user (given a tenant's scope).

  ## Examples

      iex> list_user_articles(topic)
      [%Article{}, ...]

  """
  def list_user_articles(%Api.Tenants.Tenant{} = tenant, %Api.Accounts.User{} = user) do
    user_id = user.id
    Repo.all(Ecto.Query.from a in Article,
      where: a.tenant_id == ^tenant.id,
      join: au in "article_users", where: au.article_id == a.id and au.user_id == ^user_id,
      order_by: :id
    )
  end

  @doc """
  Gets a single article.

  Raises `Ecto.NoResultsError` if the Article does not exist.

  ## Examples

      iex> get_article!(123)
      %Article{}

      iex> get_article!(456)
      ** (Ecto.NoResultsError)

  """
  def get_article!(id) do
    Repo.get!(Article, id)
  end

  @doc """
  Creates a article.

  ## Examples

      iex> create_article(%{field: value})
      {:ok, %Article{}}

      iex> create_article(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_article(attrs \\ %{}, tenant, user) do
    %Article{}
    |> Article.create_changeset(attrs)
    |> put_assoc(:tenant, tenant)
    |> put_assoc(:users, [user])
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
  def update_article(%Article{} = article, attrs) do
    article
    |> Article.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a Article.

  ## Examples

      iex> delete_article(article)
      {:ok, %Article{}}

      iex> delete_article(article)
      {:error, %Ecto.Changeset{}}

  """
  def delete_article(%Article{} = article) do
    Repo.delete(article)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking article changes.

  ## Examples

      iex> change_article(article)
      %Ecto.Changeset{source: %Article{}}

  """
  def change_article(%Article{} = article) do
    Article.changeset(article, %{})
  end

  alias Api.Content.ContentModule

  @doc """
  Returns the list of content_modules.

  ## Examples

      iex> list_content_modules()
      [%ContentModule{}, ...]

  """
  def list_content_modules do
    Repo.all(ContentModule)
  end

  @doc """
  Gets a single content_module.

  Raises `Ecto.NoResultsError` if the Content module does not exist.

  ## Examples

      iex> get_content_module!(123)
      %ContentModule{}

      iex> get_content_module!(456)
      ** (Ecto.NoResultsError)

  """
  def get_content_module!(id), do: Repo.get!(ContentModule, id)

  @doc """
  Creates a content_module.

  ## Examples

      iex> create_content_module(%{field: value})
      {:ok, %ContentModule{}}

      iex> create_content_module(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_content_module(article_id, attrs \\ %{}) do
    %ContentModule{}
    |> ContentModule.changeset(Map.put(attrs, :article_id, article_id ))
    |> Repo.insert()
  end

  @doc """
  Updates a content_module.

  ## Examples

      iex> update_content_module(content_module, %{field: new_value})
      {:ok, %ContentModule{}}

      iex> update_content_module(content_module, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_content_module(%ContentModule{} = content_module, attrs) do
    content_module
    |> ContentModule.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a ContentModule.

  ## Examples

      iex> delete_content_module(content_module)
      {:ok, %ContentModule{}}

      iex> delete_content_module(content_module)
      {:error, %Ecto.Changeset{}}

  """
  def delete_content_module(%ContentModule{} = content_module) do
    Repo.delete(content_module)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking content_module changes.

  ## Examples

      iex> change_content_module(content_module)
      %Ecto.Changeset{source: %ContentModule{}}

  """
  def change_content_module(%ContentModule{} = content_module) do
    ContentModule.changeset(content_module, %{})
  end

  def toggle_article_pin(article_id) do
    article = Repo.get(Article, article_id)
    article
    |> Ecto.Changeset.cast(%{is_pinned_to_top: !article.is_pinned_to_top}, [:is_pinned_to_top])
    |> Repo.update()
  end

  defp list_public_articles(%Tenant{} = tenant, user) do
    user_group_ids = User.group_ids(user)
    from(a in Article,
      left_join: aug in "articles_user_groups",
      on: aug.article_id == a.id,
      join: c in Category,
      on: c.id == a.category_id,
      where: a.tenant_id == ^tenant.id and not is_nil(a.category_id) and
             (is_nil(aug.group_id) or aug.group_id in ^user_group_ids or ^User.is_admin?(user, tenant)),
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
