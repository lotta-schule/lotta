defmodule LottaWeb.ContentModuleResolver do
  @moduledoc false

  import Lotta.Accounts.Permissions

  alias Lotta.{Content, Email, Mailer, Repo, Storage}
  alias Bamboo.Attachment

  require Logger

  def send_form_response(
        %{content_module_id: content_module_id, response: response},
        %{context: %{current_user: current_user}}
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
                if(is_nil(attachment), do: [], else: [attachment])
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
        with {:ok, %{"id" => file_id}} <-
               Jason.decode(file_description),
             file when not is_nil(file) <-
               Storage.get_file(file_id),
             true <-
               can_read?(user, file),
             {:ok, status, _headers, client_ref} when status < 400 <-
               :hackney.get(Storage.get_http_url(file, signed: true)),
             {:ok, data} <- :hackney.body(client_ref) do
          {file.filename,
           %Attachment{
             content_id: file_id,
             content_type: file.mime_type,
             data: data,
             filename: file.filename
           }}
        else
          nil ->
            {"(Datei nicht gefunden)", nil}

          false ->
            Logger.warning(
              "User #{user.id} is not allowed to access file with id #{file_description}"
            )

            {"(Datei nicht gültig)", nil}

          error ->
            {"(Datei nicht gültig)", nil}
        end

      _ ->
        {"(LEER)", nil}
    end
  end

  def get_responses(%{content_module_id: content_module_id}, %{
        context: %{current_user: current_user}
      }) do
    case Content.get_content_module(content_module_id) do
      nil ->
        {:error, "Modul nicht gefunden."}

      cm ->
        cm = Repo.preload(cm, [:results, :article])

        if can_write?(current_user, cm.article) do
          {:ok, cm.results}
        else
          {:error, "Du darfst die Antworten für dieses Modul nicht lesen."}
        end
    end
  end
end
