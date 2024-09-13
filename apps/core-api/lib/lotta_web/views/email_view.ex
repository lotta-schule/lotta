defmodule LottaWeb.EmailView do
  @moduledoc """
  View with helpers for emails
  """
  require Logger

  use LottaWeb, :view

  alias Lotta.{Repo, Storage}
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
  def theme_prop(%Tenant{configuration: %{custom_theme: theme}}, prop_name, fallback),
    do: get_in(theme, String.split(prop_name, ".")) || fallback

  def theme_prop(_tenant, _prop_name, fallback), do: fallback

  @doc """
  Returns the complete usable URL to the logo image.
  If any custom logo is set, its remote location is used.
  If not, a data url of the default logo is returned, read
  from priv/static/logo.png
  """
  @doc since: "2.2.0"
  @spec logo_url(Tenant.t()) :: String.t()

  def logo_url(%Tenant{logo_image_file_id: id}) when not is_nil(id) do
    case Storage.get_file(id) do
      nil -> default_logo_data_url()
      image_file -> Storage.get_http_url(image_file)
    end
  end

  def logo_url(_), do: default_logo_data_url()

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
    |> Enum.map_join(
      ", ",
      fn user ->
        if not is_nil(user.nickname) && String.length(user.nickname) > 0 do
          user.nickname
        else
          user.name
        end
      end
    )
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
