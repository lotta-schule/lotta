defmodule Api.Queue.EmailPublisher do
  @moduledoc """
    Outgoing queue for sending emails
  """

  require Logger

  use GenServer
  alias Api.Repo
  alias Api.Tenants.Tenant
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

  def send_feedback_email(content) do
    send_email(%EmailSendRequest{
      to: "kontakt@einsa.net",
      subject: "Kontaktanfrage für lotta",
      template: "default",
      templatevars: %{
        tenant: nil,
        heading: "Kontaktanfrage für lotta",
        content: content
      }
    })
  end

  def send_registration_email(%User{} = user, %Tenant{} = tenant) do
    send_email(%EmailSendRequest{
      to: user.email,
      subject: "Deine Registrierung bei #{tenant.title}",
      template: "default",
      templatevars: %{
        tenant: EmailSendRequest.get_tenant_info(tenant),
        heading: "Deine Registrierung bei #{tenant.title}",
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

  def send_tenant_creation_email(%Tenant{} = tenant, %User{} = user) do
    send_email(%EmailSendRequest{
      to: user.email,
      subject: "Ihr Lotta",
      template: "default",
      templatevars: %{
        tenant: nil,
        heading: "Ihr Lotta",
        content:
          "Hallo #{user.name},<br />Vielen Dank für Ihr Interessa an lotta.<br />" <>
            "Ihr System steht nun zum Ausprobieren unter #{Tenant.get_main_url(tenant)} zur Verfügung. <br />" <>
            "Sie können sich dort mit der Email-Adresse #{user.email} und Ihrem selbst gewählten Passwort anmelden.<br /><br />" <>
            "Sollten Sie Hilfe brauchen, finden Sie auf https://info.lotta.schule viele Informationen und Anleitungen.<br /><br />" <>
            "Sollten Sie dort nicht fündig werden, schreiben Sie uns doch eine Email an: kontakt@einsa.net<br /><br />" <>
            "Viel Spaß!<br /><br />"
      }
    })
  end

  def send_request_password_reset_email(
        %Tenant{} = tenant,
        %User{} = user,
        email,
        token
      ) do
    url =
      %{e: Base.encode64(email), t: token}
      |> URI.encode_query()
      |> String.replace_prefix("", "#{Tenant.get_main_url(tenant)}/password/reset?")

    send_email(%EmailSendRequest{
      to: email,
      sender_name: tenant.title,
      subject: "Passwort zurücksetzen",
      template: "default",
      templatevars: %{
        tenant: EmailSendRequest.get_tenant_info(tenant),
        heading: "Setz dein Passwort zurück",
        content:
          "Hallo #{user.name},<br />über die Seite #{Tenant.get_main_url(tenant)} wurde eine Anfrage zum zurücksetzen deines Passworts gesendet.<br />" <>
            "Dein Passwort kannst du über folgenden Link zurücksetzen: <a href='#{url}'>#{url}</a>.<br /><br />" <>
            "Solltest du die Anfrage nicht selbst versandt haben, kannst du diese Nachricht ignorieren."
      }
    })
  end

  def send_password_changed_email(%User{} = user) do
    tenant = Repo.preload(user, :tenant).tenant

    send_email(%EmailSendRequest{
      to: user.email,
      sender_name: tenant.title,
      subject: "Dein Passwort wurde geändert",
      template: "default",
      templatevars: %{
        tenant: EmailSendRequest.get_tenant_info(tenant),
        heading: "Dein Passwort",
        content:
          "Hallo #{user.name},<br />Dein Passwort wurde über die Seite #{
            Tenant.get_main_url(tenant)
          } erfolgreich geändert.<br />"
      }
    })
  end

  def send_article_is_ready_admin_notification(%Article{} = article) do
    article = Repo.preload(article, :tenant)
    tenant = article.tenant
    article_url = Article.get_url(article)

    tenant
    |> Tenant.get_admin_users()
    |> Enum.map(fn admin ->
      send_email(%EmailSendRequest{
        to: admin.email,
        sender_name: tenant.title,
        subject: "Ein Artikel wurde fertig gestellt",
        template: "default",
        templatevars: %{
          tenant: EmailSendRequest.get_tenant_info(tenant),
          heading: "Artikel fertiggestellt",
          content:
            "Hallo #{admin.name},<br />" <>
              "Der Artikel <a href='#{article_url}'>#{article.title}</a> wurde auf #{
                Tenant.get_main_url(tenant)
              } als \"fertig\" markiert.<br />"
        }
      })
    end)
  end

  def send_content_module_form_response(
        %ContentModule{} = content_module,
        %{} = responses
      ) do
    content_module = Repo.preload(content_module, :article)

    article =
      content_module.article
      |> Repo.preload(:tenant)

    tenant = article.tenant

    responses_list =
      responses
      |> Enum.map(fn {key, value} ->
        "<li><strong>#{key}:</strong> #{Poison.encode!(value)}</li>"
      end)
      |> Enum.join("")
      |> (&("<ul>" <> &1 <> "</ul>")).()

    send_email(%EmailSendRequest{
      to: content_module.configuration["destination"],
      sender_name: tenant.title,
      subject: "Formular im Beitrag \"#{article.title}\" wurde versendet",
      template: "default",
      templatevars: %{
        tenant: EmailSendRequest.get_tenant_info(tenant),
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
