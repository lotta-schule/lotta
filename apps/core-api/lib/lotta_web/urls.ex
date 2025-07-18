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
  alias Lotta.Accounts.User
  alias Lotta.Content.Article
  alias Lotta.Storage.{File, FileConversion}
  alias Lotta.Tenants.Tenant

  @type url_options() :: [skip_protocol: boolean()]

  @doc """
  Returns the primary URI to the start page
  of a given tenant.
  If the tenant has a custom domain, it will be used.
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
  Returns the URI for a given file or file conversion.

  Returns an URI object. For a string representation,
  see `LottaWeb.Urls.get_file_url/1`.
  """
  @doc since: "5.0.0"
  @spec get_file_uri(FileConversion.t()) :: URI.t()
  @spec get_file_uri(File.t()) :: URI.t()
  @spec get_file_uri(File.t(), String.t()) :: URI.t()
  def get_file_uri(file_or_conversion, format \\ "original") do
    tenant =
      file_or_conversion
      |> Ecto.get_meta(:prefix)
      |> Tenants.get_tenant_by_prefix()

    Map.put(get_tenant_uri(tenant), :path, get_file_path(file_or_conversion, format))
  end

  @doc """
  Like `LottaWeb.Urls.get_file_uri/1`, but returns
  an URL string.
  """
  @doc since: "5.0.0"
  @spec get_file_url(FileConversion.t()) :: String.t()
  @spec get_file_url(File.t()) :: String.t()
  @spec get_file_url(File.t(), String.t()) :: String.t()
  def get_file_url(file_or_conversion, format \\ "original") do
    URI.to_string(get_file_uri(file_or_conversion, format))
  end

  @doc """
  Returns the path to the given file.
  """
  @doc since: "5.0.0"
  @spec get_file_path(FileConversion.t()) :: String.t()
  @spec get_file_path(File.t()) :: String.t()
  @spec get_file_path(File.t(), String.t()) :: String.t()
  def get_file_path(file_or_conversion, format \\ "original") do
    case file_or_conversion do
      %File{} ->
        "/data/storage/f/#{file_or_conversion.id}/#{format}"

      %FileConversion{} ->
        "/data/storage/f/#{file_or_conversion.file_id}/#{file_or_conversion.format}"
    end
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
  Returns the host identifier of the given tenant.
  This will be the tenant's slug, followed by the
  base host of the lotta installation, regardless
  of whether the tenant has a custom domain or not.

  This is useful not so much for generating URLs, but
  for identifying the tenant in a multi-tenant setup,
  where a uniform identifier is preferred.

  ### Example

      iex> Urls.get_tenant_identifier(%Tenant{slug: "example"})
      "example.lotta.schule"
  """
  @doc since: "5.0.0"
  @spec get_tenant_identifier(Tenant.t()) :: String.t()
  def get_tenant_identifier(tenant) do
    "#{tenant.slug}.#{config()[:host]}"
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
    tenant
    |> Tenants.get_custom_domains()
    |> Enum.filter(& &1.is_main_domain)
    |> case do
      [] ->
        struct(URI, config())
        |> Map.update(
          :host,
          nil,
          &"#{tenant.slug}.#{&1}"
        )

      [%{host: host} | []] ->
        struct(URI, Application.get_env(:lotta, :base_uri, []))
        |> Map.put(:host, host)
    end
  end

  defp config() do
    Application.get_env(:lotta, :base_uri, [])
  end
end
