defmodule Cockpit.Feedback.Zammad do
  @moduledoc """
  Communicates with Zammad to create tickets
  """

  alias Cockpit.Feedback.Feedback

  require Logger

  @spec create_ticket(Feedback.t()) :: {:ok} | {:error, String.t()}
  def create_ticket(feedback) do
    with client when not is_nil(client) <- create_client(),
         {:ok, %{status: status}} when status < 400 <-
           Tesla.post(
             client,
             "/api/v1/tickets",
             %{
               title: get_ticket_title(feedback),
               group: "Users",
               customer_id: "guess:#{feedback.user.email}",
               article: %{
                 subject: feedback.title,
                 body: feedback.message,
                 type: "web",
                 sender: "Customer",
                 internal: false
               }
             }
           ) do
      :ok
    else
      nil ->
        {:error, "Zammad is not enabled"}

      {_, %{status: status, body: body}} ->
        Logger.error("Failed to create Zammad ticket: (#{status}) #{inspect(body)}")
        {:error, "Failed to create Zammad ticket: (#{status})"}

      {:error, error_message} = error ->
        Logger.error("Failed to create Zammad ticket: #{inspect(error_message)}")
        error

      _ ->
        {:error, "Unknown error"}
    end
  end

  defp get_ticket_title(%Feedback{tenant: %Lotta.Tenants.Tenant{} = tenant}),
    do: "Feedback for \"#{tenant.title}\" (#{LottaWeb.Urls.get_tenant_url(tenant)})"

  defp get_ticket_title(_), do: "Feedback"

  defp create_client do
    unless is_nil(config(:endpoint)) or is_nil(config(:username)) or is_nil(config(:password)) do
      middleware = [
        # Tesla.Middleware.OpenTelemetry,
        {Tesla.Middleware.BaseUrl, config(:endpoint)},
        Tesla.Middleware.PathParams,
        Tesla.Middleware.JSON,
        {Tesla.Middleware.BasicAuth, username: config(:username), password: config(:password)}
      ]

      Tesla.client(middleware)
    end
  end

  defp config(key), do: Keyword.get(config(), key)

  defp config do
    Application.get_env(:lotta, :zammad, [])
  end
end
