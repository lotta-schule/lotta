defmodule ApiWeb.EmailView do
  @moduledoc """
  View with helpers for emails
  """
  require Logger

  use ApiWeb, :view

  import Phoenix.HTML.Tag
  import Phoenix.HTML.Link

  alias Api.System
  alias Api.Storage
  alias Api.Content.Article

  @doc """
  Gets a property from theme if it exists.
  If the property does not exist, fallback is returned.
  The property name understands paths divided by ".".

  ## Examples
  iex> theme_prop("palette.primary", "green")
  "green"
  """
  @doc since: "2.2.0"
  @spec theme_prop(String.t(), String.t()) :: String.t() | number()
  def theme_prop(prop_name, fallback) do
    value =
      System.get_configuration()
      |> Map.get(:custom_theme, %{})
      |> get_in(String.split(prop_name, "."))

    value || fallback
  end

  @doc """
  Returns the main url of the instance.
  """
  @doc since: "2.2.0"
  @spec main_url() :: String.t()
  def main_url do
    System.get_main_url()
  end

  @doc """
  Returns the title of the instance.
  """
  @doc since: "2.2.0"
  @spec title() :: String.t()
  def title do
    System.get_configuration()
    |> Map.get(:title, main_url())
  end

  @doc """
  Returns the complete usable URL to the logo image.
  If any custom logo is set, its remote location is used.
  If not, a data url of the default logo is returned, read
  from priv/static/logo.png
  """
  @doc since: "2.2.0"
  @spec logo_url() :: String.t()
  def logo_url do
    System.get_configuration()
    |> Map.get(:logo_image_file, nil)
    |> case do
      nil ->
        default_logo_data_url()

      file ->
        file
        |> Storage.get_http_url()
    end
  end

  @doc """
  Returns a string representing a list of users.
  This is simply achieved by a comma separated list of the users' nickname or name
  """
  @doc since: "2.2.0"
  @spec users_list(Article.t()) :: String.t()
  def users_list(article) do
    article
    |> Api.Repo.preload(:users)
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

  defp default_logo_data_url do
    Application.app_dir(:api, "priv/static/logo.png")
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
