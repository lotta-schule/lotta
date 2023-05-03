defmodule Lotta.Storage.ImageProcessingUrl do
  @moduledoc """
  For a given image url, construct an url that outputs the image in a given format
  """

  @type processing_options :: %{
          width: integer(),
          height: integer(),
          fn: :cover | :fit | :bound
        }

  @doc """
  Given the http URL of an asset, return the http url to the transformed asset, as per the options
  """
  @spec get_url(String.t() | nil, processing_options() | nil) :: String.t() | nil
  def get_url(nil, _), do: nil
  def get_url(url, nil), do: url

  def get_url(url, processing_opts) do
    api_url = cloudimage_url()

    if is_nil(api_url) do
      url
    else
      params =
        []
        |> add_width(processing_opts)
        |> add_height(processing_opts)
        |> add_fit(processing_opts)

      if length(params) > 0 do
        api_url
        |> Map.put(
          :query,
          if Enum.empty?(params) do
            nil
          else
            URI.encode_query(params)
          end
        )
        |> Map.put(
          :path,
          Enum.join([api_url.path, url], "/")
        )
        |> URI.to_string()
      else
        url
      end
    end
  end

  defp cloudimage_token() do
    Keyword.get(
      Application.get_env(:lotta, __MODULE__, []),
      :cloudimage_token,
      nil
    )
  end

  defp cloudimage_url() do
    token = cloudimage_token()

    unless is_nil(token) do
      URI.parse("https://#{cloudimage_token()}.cloudimg.io/v7")
    end
  end

  defp add_width(params, %{width: width}) when not is_nil(width),
    do: Keyword.put(params, :width, width)

  defp add_width(params, _), do: params

  defp add_height(params, %{height: height}) when not is_nil(height),
    do: Keyword.put(params, :height, height)

  defp add_height(params, _), do: params

  defp add_fit(params, %{fn: "cover"}), do: Keyword.put(params, :func, "crop")
  defp add_fit(params, %{fn: "contain"}), do: Keyword.put(params, :func, "cropfit")
  defp add_fit(params, %{fn: "inside"}), do: Keyword.put(params, :func, "bound")
  defp add_fit(params, _), do: params
end
