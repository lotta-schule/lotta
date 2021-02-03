defmodule Api.Email do
  import Bamboo.Email

  use Bamboo.Phoenix,
    view: ApiWeb.EmailView

  alias Api.Repo
  alias Api.System
  alias Api.Accounts.User
  alias Api.Content.{Article, ContentModule}

  @doc """
  Send new user an email confirming their registration
  """
  @doc since: "2.2.0"

  @spec registration_mail(User.t()) :: Bamboo.Email.t()
  def registration_mail(%User{} = user) do
    base_mail()
    |> to(user.email)
    |> subject("Deine Registrierung bei #{system().title}")
    |> render(:registration, user: user)
  end

  @doc """
  Send a user a link to a presonalized "change password" page
  """
  @doc since: "2.2.0"

  @spec request_password_reset_mail(User.t(), String.t()) :: Bamboo.Email.t()
  def request_password_reset_mail(%User{} = user, token) do
    link =
      %{e: Base.encode64(user.email), t: token}
      |> URI.encode_query()
      |> String.replace_prefix("", "#{System.get_main_url()}/password/reset?")

    base_mail()
    |> to(user.email)
    |> subject("Passwort zurücksetzen")
    |> render(:request_password_reset, user: user, link: link)
  end

  @doc """
  Send a user a notification that has password has been changed
  """
  @doc since: "2.2.0"

  @spec password_changed_mail(User.t()) :: Bamboo.Email.t()
  def password_changed_mail(%User{} = user) do
    base_mail()
    |> to(user.email)
    |> subject("Dein Passwort wurde geändert")
    |> render(:password_changed, user: user)
  end

  @doc """
  Send a notification about an article's status changed to 'ready'
  """
  @doc since: "2.2.0"

  @spec article_ready_mail(User.t(), Article.t()) :: Bamboo.Email.t()
  def article_ready_mail(%User{} = user, %Article{} = article) do
    base_mail()
    |> to(user.email)
    |> subject("Ein Beitrag wurde fertiggestellt.")
    |> render(:article_ready, user: user, article: article)
  end

  @doc """
  Send a notification about the system being ready to start.
  """
  @doc since: "2.3.0"

  @spec lotta_ready_mail(User.t()) :: Bamboo.Email.t()
  def lotta_ready_mail(%User{} = user) do
    base_mail()
    |> to(user.email)
    |> subject("Lotta steht nun für #{system().title} bereit.")
    |> put_attachment(Application.app_dir(:api, "priv/default_content/files/lotta_1x1.pdf"))
    |> render(:lotta_ready, user: user)
  end

  @doc """
  Send content module form data
  """
  @doc since: "2.2.0"

  @spec content_module_form_response_mail(ContentModule.t(), map()) :: Bamboo.Email.t()
  def content_module_form_response_mail(%ContentModule{} = content_module, responses) do
    article =
      Repo.preload(content_module, :article)
      |> Map.fetch!(:article)

    mail =
      base_mail()
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

  defp base_mail do
    new_email()
    |> from(mailer_config!(:default_sender))
    |> put_layout({ApiWeb.EmailView, :email})
  end

  defp system do
    System.get_configuration()
  end

  defp mailer_config!(key) do
    :api
    |> Application.fetch_env!(Api.Mailer)
    |> Keyword.fetch!(key)
  end
end
