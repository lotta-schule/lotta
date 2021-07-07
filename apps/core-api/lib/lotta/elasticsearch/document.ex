defimpl Elasticsearch.Document, for: Lotta.Content.Article do
  @moduledoc """
    Elasticsearch representation of an Article
  """

  alias Lotta.Content.ContentModule
  alias Lotta.{Repo, Tenants}

  def id(article) do
    tenant =
      article
      |> Ecto.get_meta(:prefix)
      |> Tenants.get_tenant_by_prefix()

    "#{tenant.id}--#{article.id}"
  end

  def routing(_article), do: false

  def encode(article) do
    article =
      article
      |> Repo.preload([:content_modules, :users])

    tenant = Tenants.get_tenant_by_prefix(Ecto.get_meta(article, :prefix))

    if tenant do
      %{
        category_id: article.category_id,
        title: article.title,
        preview: article.preview,
        published: article.published,
        tags: article.tags,
        updated_at: article.updated_at,
        inserted_at: article.inserted_at,
        tenant_id: tenant.id,
        users:
          Enum.map(article.users, fn user ->
            %{
              id: user.id,
              email: user.email,
              nickname: user.nickname,
              name: unless(user.hide_full_name, do: user.name)
            }
          end),
        content_modules:
          Enum.map(article.content_modules, fn content_module ->
            %{
              type: content_module.type,
              content: content_module_content(content_module),
              inserted_at: content_module.inserted_at,
              updated_at: content_module.updated_at
            }
          end)
      }
    end
  end

  defp content_module_content(%ContentModule{type: type, content: content}) do
    case type do
      "title" ->
        content["title"]

      "audio" ->
        Enum.join(content["captions"] || [], " || ")

      "video" ->
        Enum.join(content["captions"] || [], " || ")

      "image_collection" ->
        Enum.join(content["captions"] || [], " || ")

      "text" ->
        find_text_from_slate_node(content)

      "image" ->
        content["caption"]

      _ ->
        nil
    end
  end

  def find_text_from_slate_node(%{"nodes" => nodes}) when is_list(nodes) do
    nodes
    |> Enum.map(&find_text_from_slate_node/1)
    |> Enum.join()
  end

  def find_text_from_slate_node(%{"children" => children}) when is_list(children) do
    children
    |> Enum.map(&find_text_from_slate_node/1)
    |> Enum.join()
  end

  def find_text_from_slate_node(%{"document" => document}) do
    find_text_from_slate_node(document)
  end

  def find_text_from_slate_node(%{"text" => text}) do
    text
  end

  def find_text_from_slate_node(_node), do: ""
end
