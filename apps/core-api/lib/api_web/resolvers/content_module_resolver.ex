defmodule ApiWeb.ContentModuleResolver do
  @moduledoc false

  import Api.Accounts.Permissions

  alias Api.{Accounts, Content, Email, Mailer, Repo}
  alias ApiWeb.Context
  alias Bamboo.Attachment

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
            {response, attachment} =
              format_response(response[element["name"]], element, current_user)

            acc
            |> Map.put(element["name"], response)
            |> Map.put(
              "attachments",
              Map.get(acc, "attachments", []) ++
                if(!is_nil(attachment), do: [attachment], else: [])
            )
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
              responses:
                responses
                |> Map.delete("attachments")
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

  defp format_response(response, element, user) do
    if element["element"] == "file" do
      format_response_file(response, element, user)
    else
      {response || "(LEER)", nil}
    end
  end

  defp format_response_file(response, _element, user) do
    case response do
      "file-upload://" <> file_description ->
        case Jason.decode(file_description) do
          {:ok, %{"data" => data, "filename" => filename} = file_description} ->
            data =
              data
              |> String.split(",")
              |> List.last()
              |> Base.decode64!()

            {filename,
             %Attachment{
               content_id: List.last(String.split(Map.get(file_description, "blob", ""), "/")),
               content_type: Map.get(file_description, "filetype"),
               data: data,
               filename: filename
             }}

          _ ->
            {"(Datei nicht gültig)", nil}
        end

      "lotta-file-id://" <> file_description ->
        with {:ok, %{"id" => file_id}} <- Jason.decode(file_description),
             %{
               id: file_id,
               mime_type: mime_type,
               filename: filename,
               remote_location: remote_location
             } = file
             when not is_nil(file) <- Accounts.get_file(String.to_integer(file_id)),
             true <- can_read?(user, file) do
          data =
            remote_location
            |> HTTPoison.get!()
            |> Map.fetch!(:body)

          {filename,
           %Attachment{
             content_id: file_id,
             content_type: mime_type,
             data: data,
             filename: filename
           }}
        else
          res ->
            {"(Datei nicht gültig)", nil}
        end

      _ ->
        {"(LEER)", nil}
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
