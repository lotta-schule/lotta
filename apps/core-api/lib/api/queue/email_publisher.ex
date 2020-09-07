defmodule Api.Queue.EmailPublisher do
  @moduledoc """
    Outgoing queue for sending emails
  """

  require Logger

  use GenServer
  alias Api.Repo
  alias Api.Accounts
  alias Api.System
  alias Api.Accounts.User
  alias Api.Content.{Article, ContentModule}
  alias Api.Services.EmailSendRequest

  @behaviour GenRMQ.Publisher

  @exchange "email"
  @queue "email-out-queue"

  def init(_args \\ []) do
    create_rmq_resources()

    [
      queue: @queue,
      exchange: {:direct, @exchange},
      uri: rmq_uri()
    ]
  end

  def start_link(_args) do
    GenRMQ.Publisher.start_link(__MODULE__, name: __MODULE__)
  end

  def send_email(%EmailSendRequest{} = email_send_request) do
    {:ok, email_send_request} = Poison.encode(email_send_request)
    GenRMQ.Publisher.publish(Api.Queue.EmailPublisher, email_send_request, @queue)
    email_send_request
  end

  def send_registration_email(%User{} = user) do
    system = System.get_configuration()

    send_email(%EmailSendRequest{
      to: user.email,
      subject: "Deine Registrierung bei #{system.title}",
      template: "default",
      templatevars: %{
        tenant: EmailSendRequest.get_tenant_info(),
        heading: "Deine Registrierung bei #{system.title}",
        content:
          "Hallo #{user.name},<br />Du wurdest erfolgreich registriert.<br />" <>
            "Du kannst nun Beiträge erstellen.<br /> <br />"
      }
    })
  end

  def send_registration_email(%User{} = user, nil) do
    send_email(%EmailSendRequest{
      to: user.email,
      subject: "Ihre Registrierung bei lotta",
      template: "default",
      templatevars: %{
        tenant: nil,
        heading: "Ihre Registrierung bei lotta",
        content: "Hallo #{user.name},<br />Sie wurden erfolgreich registriert.<br /><br />"
      }
    })
  end

  def send_request_password_reset_email(
        %User{} = user,
        email,
        token
      ) do
    system = System.get_configuration()

    url =
      %{e: Base.encode64(email), t: token}
      |> URI.encode_query()
      |> String.replace_prefix("", "#{System.get_main_url()}/password/reset?")

    send_email(%EmailSendRequest{
      to: email,
      sender_name: system.title,
      subject: "Passwort zurücksetzen",
      template: "default",
      templatevars: %{
        tenant: EmailSendRequest.get_tenant_info(),
        heading: "Setz dein Passwort zurück",
        content:
          "Hallo #{user.name},<br />über die Seite #{System.get_main_url()} wurde eine Anfrage zum zurücksetzen deines Passworts gesendet.<br />" <>
            "Dein Passwort kannst du über folgenden Link zurücksetzen: <a href='#{url}'>#{url}</a>.<br /><br />" <>
            "Solltest du die Anfrage nicht selbst versandt haben, kannst du diese Nachricht ignorieren."
      }
    })
  end

  def send_password_changed_email(%User{} = user) do
    system = System.get_configuration()

    send_email(%EmailSendRequest{
      to: user.email,
      sender_name: system.title,
      subject: "Dein Passwort wurde geändert",
      template: "default",
      templatevars: %{
        tenant: EmailSendRequest.get_tenant_info(),
        heading: "Dein Passwort",
        content:
          "Hallo #{user.name},<br />Dein Passwort wurde über die Seite #{System.get_main_url()} erfolgreich geändert.<br />"
      }
    })
  end

  def send_article_is_ready_admin_notification(%Article{} = article) do
    system = System.get_configuration()
    article_url = Article.get_url(article)

    Accounts.get_admin_users()
    |> Enum.map(fn admin ->
      send_email(%EmailSendRequest{
        to: admin.email,
        sender_name: system.title,
        subject: "Ein Artikel wurde fertig gestellt",
        template: "default",
        templatevars: %{
          tenant: EmailSendRequest.get_tenant_info(),
          heading: "Artikel fertiggestellt",
          content:
            "Hallo #{admin.name},<br />" <>
              "Der Artikel <a href='#{article_url}'>#{article.title}</a> wurde auf #{
                System.get_main_url()
              } als \"fertig\" markiert.<br />"
        }
      })
    end)
  end

  def send_content_module_form_response(%ContentModule{} = content_module, %{} = responses) do
    system = System.get_configuration()
    content_module = Repo.preload(content_module, :article)
    article = content_module.article

    responses_list =
      responses
      |> Enum.map(fn {key, value} ->
        "<li><strong>#{key}:</strong> #{Poison.encode!(value)}</li>"
      end)
      |> Enum.join("")
      |> (&("<ul>" <> &1 <> "</ul>")).()

    send_email(%EmailSendRequest{
      to: content_module.configuration["destination"],
      sender_name: system.title,
      subject: "Formular im Beitrag \"#{article.title}\" wurde versendet",
      template: "default",
      templatevars: %{
        tenant: EmailSendRequest.get_tenant_info(),
        heading: "Formular versendet",
        content:
          "Hallo,<br />" <>
            "Das Formular im Beitrag \"#{article.title}\" wurde versendet.<br />" <>
            "Das sind die Antworten:<br /><br />" <>
            responses_list
      }
    })
  end

  defp rmq_uri do
    Application.fetch_env!(:api, :rabbitmq_url)
  end

  defp create_rmq_resources do
    {:ok, connection} = AMQP.Connection.open(rmq_uri())
    {:ok, channel} = AMQP.Channel.open(connection)

    AMQP.Queue.declare(channel, @queue, durable: true)
    GenRMQ.Binding.bind_exchange_and_queue(channel, {:direct, @exchange}, @queue, @queue)

    AMQP.Channel.close(channel)
  end
end
