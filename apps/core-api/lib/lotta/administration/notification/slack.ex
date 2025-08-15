defmodule Lotta.Administration.Notification.Slack do
  alias Lotta.Accounts
  alias Lotta.Tenants.Tenant
  alias LottaWeb.Urls

  require Logger

  def new_lotta_notification(%Tenant{} = tenant) do
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
            Accounts.list_admins(tenant),
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

  defp config, do: Application.get_env(:lotta, Lotta.Administration.Notification.Slack, [])

  defp environment_name do
    Application.get_env(:cockpit, :env, "DEV")
  end
end
