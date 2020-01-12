defmodule Api.ContentModuleResolver do

  alias Api.Content
  alias Api.Content.ContentModule

  def send_form_response(%{content_module_id: content_module_id, response: response}, _info) do
    content_module = Content.get_content_module!(content_module_id)
    try do
      %{configuration: %{"destination" => destination, "elements" => elements}} = content_module

      responses =
        elements
        |> Enum.reduce(%{}, fn element, acc ->
          Map.put(acc, element["name"], response[element["name"]] || "(LEER)")
        end)
      Api.EmailPublisherWorker.send_content_module_form_response(content_module, responses)
      {:ok, true}
    rescue
      MatchError ->
        {:error, "Formular ist falsch konfiguriert. Anfrage konnte nicht versendet werden."}
    end
  end
end