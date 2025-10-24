defmodule Lotta.Email do
  @moduledoc """
  Handles the emails being sent by lotta.
  """
  import Bamboo.Email

  use Bamboo.Phoenix,
    view: LottaWeb.EmailView

  alias Ecto
  alias Lotta.{Repo, Tenants}
  alias Lotta.Content.{Article, ContentModule}
  alias Lotta.Accounts.User
  alias Lotta.Tenants.{Feedback, Tenant}
  alias LottaWeb.Urls

  @type email_opts :: [tenant: Tenant.t()] | nil

  @doc """
  Send new user an email confirming their registration and giving him or her his or her first password
  """
  @doc since: "2.2.0"
  @spec registration_mail(User.t(), email_opts()) :: Bamboo.Email.t()
  def registration_mail(%User{} = user, opts \\ []) do
    base_mail(opts)
    |> to(user.email)
    |> with_tenant(&subject(&1, "Deine Registrierung bei #{&2.title}"))
    |> render(:registration, user: user)
  end

  @doc """
  Send a user a link to a presonalized "change password" page
  """
  @doc since: "2.2.0"

  @spec request_password_reset_mail(User.t(), String.t(), email_opts()) :: Bamboo.Email.t()
  def request_password_reset_mail(%User{} = user, token, opts \\ []) do
    base_mail(opts)
    |> to(user.email)
    |> subject("Passwort zurücksetzen")
    |> render(
      :request_password_reset,
      user: user,
      link: Urls.get_password_reset_url(user, token)
    )
  end

  @doc """
  Send a user a notification that has password has been changed
  """
  @doc since: "2.2.0"

  @spec password_changed_mail(User.t(), email_opts()) :: Bamboo.Email.t()
  def password_changed_mail(%User{} = user, opts \\ []) do
    base_mail(opts)
    |> to(user.email)
    |> subject("Dein Passwort wurde geändert")
    |> render(:password_changed, user: user)
  end

  @doc """
  Send a notification about an article's status changed to 'ready'
  """
  @doc since: "2.2.0"

  @spec article_ready_mail(User.t(), Article.t(), email_opts()) :: Bamboo.Email.t()
  def article_ready_mail(%User{} = user, %Article{} = article, opts \\ []) do
    base_mail(opts)
    |> to(user.email)
    |> subject("Ein Beitrag wurde fertiggestellt.")
    |> render(:article_ready, user: user, article: article)
  end

  @doc """
  Send a notification about the tenant being ready.
  """
  @doc since: "2.3.0"

  @spec lotta_ready_mail(User.t(), email_opts()) :: Bamboo.Email.t()
  def lotta_ready_mail(user, opts \\ []) do
    base_mail(opts)
    |> to(user.email)
    |> with_tenant(&subject(&1, "Lotta steht nun für #{&2.title} bereit."))
    |> put_attachment(Application.app_dir(:lotta, "priv/default_content/files/lotta_1x1.pdf"))
    |> render(:lotta_ready, user: user)
  end

  @doc """
  Send content module form data
  """
  @doc since: "2.2.0"

  @spec content_module_form_response_mail(ContentModule.t(), map(), email_opts()) ::
          Bamboo.Email.t()
  def content_module_form_response_mail(%ContentModule{} = content_module, responses, opts \\ []) do
    article =
      Repo.preload(content_module, :article)
      |> Map.fetch!(:article)

    mail =
      base_mail(opts)
      |> to(content_module.configuration["destination"])
      |> subject("Formulareingabe in #{article.title}")

    mail =
      responses
      |> Map.get("attachments", [])
      |> Enum.reduce(mail, fn attachment, acc ->
        acc
        |> put_attachment(attachment)
      end)

    mail
    |> render(:content_module_response,
      content_module: content_module,
      article: article,
      responses:
        responses
        |> Map.delete("attachments")
    )
  end

  @doc """
  Send user a notification when his account has been deleted,
  either by himself, an administrator or automatically after
  a period of inactivity.
  """
  @doc since: "3.2.0"

  @spec account_closed_mail(User.t()) ::
          Bamboo.Email.t()
  def account_closed_mail(%User{} = user) do
    tenant = Tenants.get_tenant_by_prefix(Ecto.get_meta(user, :prefix))

    mail =
      base_mail(tenant: tenant)
      |> to(user.email)
      |> subject("Dein Benutzerkonto bei #{tenant.title} wurde gelöscht.")

    render(mail, :account_closed, user: user)
  end

  @doc """
  Forwards a tenant-internal feedback to lotta.
  """
  @doc since: "4.1.0"

  @spec send_feedback_to_lotta_mail(Feedback.t(), User.t(), binary() | nil) ::
          Bamboo.Email.t()
  def send_feedback_to_lotta_mail(%Feedback{} = feedback, %User{} = user, message \\ nil) do
    tenant = Tenants.get_tenant_by_prefix(Ecto.get_meta(user, :prefix))

    base_mail(tenant: tenant)
    |> from(mailer_config!(:feedback_sender, :default_sender))
    |> to(mailer_config!(:default_sender))
    |> subject("Es wurde ein Feedback von #{tenant.title} weitergeleitet.")
    |> render(:forward_feedback, user: user, feedback: feedback, message: message)
  end

  @doc """
  Sends a message to lotta
  """
  @doc since: "4.1.0"

  @spec create_feedback_for_lotta(binary() | nil, binary(), User.t()) ::
          Bamboo.Email.t()
  def create_feedback_for_lotta(subject, message, %User{} = user) do
    tenant = Tenants.get_tenant_by_prefix(Ecto.get_meta(user, :prefix))

    base_mail(tenant: tenant)
    |> from(mailer_config!(:feedback_sender, :default_sender))
    |> to(mailer_config!(:default_sender))
    |> subject("Es wurde Admin-Feedback für #{tenant.title} weitergeleitet.")
    |> render(:admin_feedback, user: user, subject: subject, message: message)
  end

  @doc """
  Responds to a tenant-internal feedback.
  """
  @doc since: "4.1.0"

  @spec send_feedback_response_mail(Feedback.t(), User.t(), binary() | nil, binary()) ::
          Bamboo.Email.t()
  def send_feedback_response_mail(%Feedback{} = feedback, %User{} = user, subject, message) do
    tenant = Tenants.get_tenant_by_prefix(Ecto.get_meta(user, :prefix))

    base_mail(tenant: tenant)
    |> from(mailer_config!(:feedback_sender, :default_sender))
    |> to(user.email)
    |> subject("Dein Feedback für #{tenant.title} wurde beantwortet.")
    |> render(
      :respond_to_feedback,
      user: user,
      feedback: feedback,
      subject: subject,
      message: message
    )
  end

  @doc """
  Send Plain Text mail.
  This can be used to send arbitrary, unformatted text.
  """
  @doc since: "2.6.0"

  @spec plain(String.t(), String.t(), String.t(), email_opts() | []) ::
          Bamboo.Email.t()
  def plain(message, subject, recipient, opts \\ []) do
    base_mail(Keyword.put_new(opts, :skip_tenant, true))
    |> to(recipient)
    |> subject(subject)
    |> render(:plain,
      message: message
    )
  end

  @spec with_tenant(Bamboo.Email.t(), (Bamboo.Email.t(), Tenant.t() -> Bamboo.Email.t())) ::
          Bamboo.Email.t()
  defp with_tenant(%Bamboo.Email{assigns: assigns} = mail, callback) do
    callback.(mail, assigns[:tenant])
  end

  defp base_mail(opts) do
    new_email()
    |> from(mailer_config!(:default_sender))
    |> put_header("Reply-To", mailer_config!(:default_sender))
    |> assign(:tenant, unless(opts[:skip_tenant], do: opts[:tenant] || Tenants.current()))
    |> put_layout({LottaWeb.EmailView, :email})
  end

  defp mailer_config!() do
    :lotta
    |> Application.fetch_env!(Lotta.Mailer)
  end

  @spec mailer_config!(atom(), atom() | nil) :: any()
  defp mailer_config!(key, fallback_key \\ nil)

  defp mailer_config!(key, nil), do: Keyword.fetch!(mailer_config!(), key)

  defp mailer_config!(key, fallback_key) do
    Keyword.get(mailer_config!(), key) || Keyword.fetch!(mailer_config!(), fallback_key)
  end
end
