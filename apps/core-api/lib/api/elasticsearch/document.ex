defimpl Elasticsearch.Document, for: Api.Content.Article do
  alias Api.Content.ContentModule
  use Api.ReadRepoAliaser

  def id(article), do: article.id
  def routing(_), do: false
  def encode(article) do
    article =
      article
      |> ReadRepo.preload([:content_modules, :users])
    %{
      title: article.title,
      preview: article.preview,
      topic: article.topic,
      updated_at: article.updated_at,
      inserted_at: article.inserted_at,
      users: Enum.map(article.users, fn user ->
        %{
          id: user.id,
          email: user.email,
          nickname: user.nickname,
          name: user.name
        }
      end),
      content_modules: Enum.map(article.content_modules, fn content_module ->
        %{
          type: content_module.type,
          content: content_module_content(content_module),
          inserted_at: content_module.inserted_at,
          updated_at: content_module.updated_at
        }
      end)
    }
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
      "image" ->
        content["caption"]
      _ ->
        nil
    end
  end
end
