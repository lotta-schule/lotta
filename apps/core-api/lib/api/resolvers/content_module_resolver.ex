defmodule Api.ContentModuleResolver do
  alias Api.Content

  def get(%{id: id}, %{context: %{context: %{tenant: tenant}}}) do
    {:ok, Content.get_content_module!(id)}
  end
  def get(_args, _info) do
    {:error, "Tenant nicht gefunden."}
  end

  def create(%{article_id: article_id, content_module: content_module_input}, _info) do
    Content.create_content_module(article_id, content_module_input)
  end

  def update(%{id: id, content_module: content_module_input}, _info) do
    Content.get_content_module!(id)
    |> Content.update_content_module(content_module_input)
  end
end