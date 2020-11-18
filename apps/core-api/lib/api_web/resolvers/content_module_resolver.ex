defmodule ApiWeb.ContentModuleResolver do
  @moduledoc """
    GraphQL Resolver Module for finding, creating, updating and deleting content modules
  """

  import Api.Accounts.Permissions

  alias Api.Repo
  alias Api.Content

  def send_form_response(%{content_module_id: content_module_id, response: response}, %{
        context: context
      }) do
    content_module = Content.get_content_module!(content_module_id)

    try do
      %{configuration: %{"elements" => elements} = configuration} = content_module

      responses =
        elements
        |> Enum.reduce(%{}, fn element, acc ->
          Map.put(acc, element["name"], response[element["name"]] || "(LEER)")
        end)

      if !is_nil(configuration["destination"]) do
        Api.Queue.EmailPublisher.send_content_module_form_response(content_module, responses)
      end

      if !is_nil(configuration["save_internally"]) do
        Content.save_content_module_result!(content_module, context[:current_user], %{
          responses: responses
        })
      end

      {:ok, true}
    rescue
      MatchError ->
        {:error, "Formular ist falsch konfiguriert. Anfrage konnte nicht versendet werden."}
    end
  end

  def get_responses(%{content_module_id: content_module_id}, %{context: context}) do
    content_module =
      Content.get_content_module!(content_module_id)
      |> Repo.preload([:results, :article])

    if !context[:current_user] || !user_is_admin?(context.current_user) do
      {:error, "Nur Administratoren dürfen Modul-Ergebnisse abrufen."}
    else
      {:ok, content_module.results}
    end
  end
end
