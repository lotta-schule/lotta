defmodule LottaWeb.EmailView do
  @moduledoc """
  View with helpers for emails
  """
  require Logger

  use LottaWeb, :view

  import Phoenix.HTML.Tag
  import Phoenix.HTML.Link

  alias Lotta.{Repo, Storage, Tenants}
  alias Lotta.Tenants.Tenant
  alias Lotta.Content.Article

  @doc """
  Gets a property from theme if it exists.
  If the property does not exist, fallback is returned.
  The property name understands paths divided by ".".

  ## Examples
  iex> theme_prop(%Tenant{}, "palette.primary", "green")
  "green"
  """
  @doc since: "2.2.0"
  @spec theme_prop(Tenant.t(), String.t(), String.t()) :: String.t() | number()
  def theme_prop(nil, _prop_name, fallback), do: fallback

  def theme_prop(tenant, prop_name, fallback) do
    value =
      tenant
      |> Tenants.get_configuration()
      |> Map.get(:custom_theme, %{})
      |> get_in(String.split(prop_name, "."))

    value || fallback
  end

  @doc """
  Returns the complete usable URL to the logo image.
  If any custom logo is set, its remote location is used.
  If not, a data url of the default logo is returned, read
  from priv/static/logo.png
  """
  @doc since: "2.2.0"
  @spec logo_url(Tenant.t()) :: String.t()
  def logo_url(nil), do: default_logo_data_url()

  def logo_url(tenant) do
    image_file =
      tenant
      |> Tenants.get_configuration()
      |> Map.get(:logo_image_file, nil)

    if is_nil(image_file) do
      default_logo_data_url()
    else
      Storage.get_http_url(image_file)
    end
  end

  @doc """
  Returns the tenant title
  """
  @doc since: "2.6.0"
  @spec title(Tenant.t() | nil) :: String.t()
  def title(nil), do: "Lotta"
  def title(tenant), do: tenant.title

  @doc """
  Returns the tenant URL
  """
  @doc since: "2.6.0"
  @spec tenant_url(Tenant.t() | nil) :: String.t()
  def tenant_url(nil), do: "https://lotta.schule"
  def tenant_url(tenant), do: LottaWeb.Urls.get_tenant_url(tenant)

  @doc """
  Returns a string representing a list of users.
  This is simply achieved by a comma separated list of the users' nickname or name
  """
  @doc since: "2.2.0"
  @spec users_list(Article.t()) :: String.t()
  def users_list(article) do
    article
    |> Repo.preload(:users)
    |> Map.get(:users, [])
    |> Enum.map(fn user ->
      if not is_nil(user.nickname) && String.length(user.nickname) > 0 do
        user.nickname
      else
        user.name
      end
    end)
    |> Enum.join(", ")
  end

  defp default_logo_data_url() do
    Application.app_dir(:lotta, "priv/static/lotta.png")
    |> File.read()
    |> case do
      {:ok, binary} ->
        "data:image/png;base64,#{Base.encode64(binary)}"

      {:error, reason} ->
        Logger.error(inspect(reason))
        ""
    end
  end
end
