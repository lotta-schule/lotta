defmodule Lotta.Administration.Cockpit do
  @moduledoc """
  Interact with Cockpit for the administration of Lotta.
  """
  alias Lotta.Accounts.User
  alias LottaWeb.Urls
  alias Lotta.Tenants.Feedback
  alias Lotta.{Tenants, Repo}

  require Logger

  @doc """
  Forward a feedback
  """
  @spec send_feedback(Feedback.t()) :: :ok | {:error, any()}
  def send_feedback(feedback) do
    feedback = Repo.preload(feedback, :user)

    tenant =
      feedback
      |> Ecto.get_meta(:prefix)
      |> Tenants.get_tenant_by_prefix()

    create_client()
    |> Tesla.post("/api/feedback", %{
      feedback: %{
        tenant_id: tenant.id,
        name: feedback.user.name,
        email: feedback.user.email,
        title: "FWD: #{feedback.topic}",
        message: """
          Ein Admin hat eben Feedback für #{tenant.title} erstellt.

          Nutzername: #{feedback.user.name}
          Email: #{feedback.user.email}
          Kunde: #{tenant.title} (#{Urls.get_tenant_url(tenant)})

          #{feedback.topic}
          ---
          #{feedback.content}
        """
      }
    })
    |> case do
      {_, %{status: status}} when status >= 200 and status < 300 ->
        :ok

      {:ok, %{status: status, body: body}} ->
        Logger.error("Failed to send message: #{inspect({status, body})}")
        {:error, status}

      {:error, reason} ->
        Logger.error("Failed to send feedback: #{inspect(reason)}")
        {:error, reason}
    end
  end

  @doc """
  Send a message to Lotta
  """
  @spec send_message(User.t(), topic :: String.t(), message :: String.t()) ::
          :ok | {:error, any()}
  def send_message(user, topic, message) do
    tenant = Tenants.get_tenant_by_prefix(Ecto.get_meta(user, :prefix))

    create_client()
    |> Tesla.post("/api/feedback", %{
      feedback: %{
        tenant_id: tenant.id,
        name: user.name,
        email: user.email,
        title: topic,
        message: message
      }
    })
    |> case do
      {_, %{status: status}} when status >= 200 and status < 300 ->
        :ok

      {:ok, %{status: status, body: body}} ->
        Logger.error("Failed to send message: #{inspect({status, body})}")
        {:error, status}

      {:error, reason} ->
        Logger.error("Failed to send message: #{inspect(reason)}")
        {:error, reason}
    end
  end

  defp create_client() do
    middleware = [
      {Tesla.Middleware.BaseUrl, config(:endpoint)},
      Tesla.Middleware.PathParams,
      Tesla.Middleware.JSON,
      {Tesla.Middleware.BasicAuth, username: config(:username), password: config(:password)}
    ]

    Lotta.Tesla.create_client(middleware)
  end

  defp config(key), do: Keyword.get(config(), key)

  defp config() do
    Application.fetch_env!(:lotta, :cockpit)
  end
end
