defmodule ApiWeb.ContentModuleResolver do
  @moduledoc false

  alias Api.{Content, Email, Mailer, Repo}
  alias ApiWeb.Context

  def send_form_response(
        %{content_module_id: content_module_id, response: response},
        %{context: %Context{current_user: current_user}}
      ) do
    content_module = Content.get_content_module(content_module_id)

    if content_module do
      try do
        %{configuration: %{"elements" => elements} = configuration} = content_module

        responses =
          elements
          |> Enum.reduce(%{}, fn element, acc ->
            Map.put(acc, element["name"], response[element["name"]] || "(LEER)")
          end)

        if not is_nil(configuration["destination"]) do
          content_module
          |> Email.content_module_form_response_mail(responses)
          |> Mailer.deliver_now()
        end

        if !is_nil(configuration["save_internally"]) do
          Content.save_content_module_result(
            content_module,
            %{
              responses: responses
            },
            current_user
          )
        end

        {:ok, true}
      rescue
        MatchError ->
          {:error, "Formular ist falsch konfiguriert. Anfrage konnte nicht versendet werden."}
      end
    end
  end

  def get_responses(%{content_module_id: content_module_id}, _info) do
    case Content.get_content_module(content_module_id) do
      nil ->
        {:error, "Modul nicht gefunden."}

      cm ->
        results =
          cm
          |> Repo.preload([:results, :article])
          |> Map.fetch!(:results)

        {:ok, results}
    end
  end
end
