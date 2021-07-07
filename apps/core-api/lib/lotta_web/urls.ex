defmodule LottaWeb.Urls do
  @moduledoc """
  This module provides different helpers to
  build relative as well as absolute links
  pointing to pages of the web application,
  particarly to the web frontend, for use in
  emails and notifications or the sitemap
  for example.
  """
  alias Lotta.{Slugifier, Tenants}
  alias Lotta.Tenants.Tenant

  @type url_options() :: [skip_protocol: boolean()]

  @doc """
  Returns the primary URI to the start page
  of a given tenant.
  If no tenant is given, the process' current
  tenant is used.

  Returns an URI object. For a string representation,
  see `LottaWeb.Urls.get_tenant_url/1`.
  """
  @doc since: "2.6.0"
  @spec get_tenant_uri(Tenant.t() | nil) :: URI.t()
  def get_tenant_uri(tenant \\ Tenants.current()) do
    get_base_uri(tenant)
  end

  @doc """
  Like `LottaWeb.Urls.get_tenant_uri/1`, but returns
  an URL string.
  """
  @doc since: "2.6.0"
  @spec get_tenant_url(Tenant.t() | nil) :: String.t()
  def get_tenant_url(tenant \\ Tenants.current()) do
    URI.to_string(get_tenant_uri(tenant))
  end

  @doc """
  Returns the URI for a given article.

  Returns an URI object. For a string representation,
  see `LottaWeb.Urls.get_article_url/1`.
  """
  @doc since: "2.6.0"
  @spec get_article_uri(Article.t()) :: URI.t()
  def get_article_uri(article) do
    tenant =
      article
      |> Ecto.get_meta(:prefix)
      |> Tenants.get_tenant_by_prefix()

    Map.put(get_tenant_uri(tenant), :path, get_article_path(article))
  end

  @doc """
  Like `LottaWeb.Urls.get_article_uri/1`, but returns
  an URL string.
  """
  @doc since: "2.6.0"
  @spec get_article_url(Article.t()) :: String.t()
  def get_article_url(article) do
    URI.to_string(get_article_uri(article))
  end

  @doc """
  Returns the path to the given article.
  """
  @doc since: "2.6.0"
  @spec get_article_path(Article.t()) :: String.t()
  def get_article_path(article) do
    "/a/#{article.id}-#{Slugifier.slugify_string(article.title)}"
  end

  @doc """
  Returns the URI for resetting the password.

  Returns an URI object. For a string representation,
  see `LottaWeb.Urls.get_password_reset_url/1`.
  """
  @doc since: "2.6.0"
  @spec get_password_reset_uri(User.t(), token :: String.t()) :: URI.t()
  def get_password_reset_uri(user, token) do
    user
    |> Ecto.get_meta(:prefix)
    |> Tenants.get_tenant_by_prefix()
    |> get_tenant_uri()
    |> Map.put(:path, "/password/reset")
    |> Map.put(
      :query,
      URI.encode_query(%{
        e: Base.encode64(user.email),
        t: token
      })
    )
  end

  @doc """
  Like `LottaWeb.Urls.get_password_reset_uri/1`, but returns
  an URL string.
  """
  @doc since: "2.6.0"
  @spec get_password_reset_url(User.t(), token :: String.t()) :: String.t()
  def get_password_reset_url(user, token) do
    URI.to_string(get_password_reset_uri(user, token))
  end

  @doc """
  Get the pure hostname of the current instance.
  """
  @doc since: "2.6.0"
  @spec get_tenant_host(Tenant.t()) :: String.t()
  def get_tenant_host(tenant) do
    Map.get(get_tenant_uri(tenant), :host)
  end

  defp get_base_uri(tenant) do
    base_uri_config = Application.get_env(:lotta, :base_uri, [])

    Map.update(
      struct(URI, base_uri_config),
      :host,
      nil,
      &"#{tenant.slug}.#{&1}"
    )
  end
end
