defmodule Lotta.Administration.Notification.Slack do
  @moduledoc """
  Send notifications to Slack for Lotta administrative events.
  """
  alias Lotta.Accounts.User
  alias Lotta.Tenants.Tenant
  alias LottaWeb.Urls

  require Logger

  @doc """
  Creates a Slack notification payload for a new Lotta system.
  """
  @doc since: "6.1.0"
  @spec new_lotta_notification(Tenant.t(), admin_users :: list(User.t())) :: map()
  def new_lotta_notification(%Tenant{} = tenant, admin_users \\ []) do
    %{
      blocks:
        [
          %{
            type: :header,
            text: %{
              type: :plain_text,
              emoji: true,
              text: ":partying_face: Neues Lotta-System wurde angelegt"
            }
          },
          %{
            type: :context,
            elements: [
              %{
                type: :mrkdwn,
                text:
                  "*#{Calendar.strftime(DateTime.utc_now(), "%d.%m.%y")}* | #{environment_name()}"
              }
            ]
          },
          %{
            type: :section,
            text: %{
              type: :mrkdwn,
              text: "**Name:**\n#{tenant.title}"
            },
            accessory: %{
              type: :button,
              text: %{
                type: :plain_text,
                emoji: true,
                text: "öffnen"
              },
              url: Urls.get_tenant_url(tenant)
            }
          },
          %{
            type: :section,
            text: %{
              type: :mrkdwn,
              text: "**Kürzel:**\n#{tenant.slug}"
            }
          }
        ]
        |> Enum.concat(
          Enum.map(
            admin_users,
            &%{
              type: :section,
              text: %{
                type: :mrkdwn,
                text: ":teacher::skin-tone-2: **Nutzer:**\n- #{&1.name}\n- #{&1.email}"
              }
            }
          )
        )
    }
  end

  @doc """
  Sends a notification to the configured Slack webhook URL.
  """
  @doc since: "6.1.0"
  @spec send(map()) :: {:ok, Tesla.Env.result()} | {:error, any()}
  def send(notification) do
    if url = webhook_url() do
      Tesla.post(create_client(), url, notification)
    else
      Logger.error("Slack webhook URL is not configured")
      {:error, "Slack webhook URL is not configured"}
    end
  end

  defp create_client() do
    middleware = [
      Tesla.Middleware.JSON
    ]

    Lotta.Tesla.create_client(middleware)
  end

  defp webhook_url,
    do:
      config()
      |> Keyword.get(:webhook)

  defp config do
    Application.get_env(:lotta, Lotta.Administration.Notification.Slack, [])
  end

  defp environment_name do
    Application.get_env(:lotta, :environment, "development")
  end
end
