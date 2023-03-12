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
    uri = URI.parse(url)

    if should_be_processed?(uri) do
      params =
        []
        |> add_width(processing_opts)
        |> add_height(processing_opts)
        |> add_fit(processing_opts)
        |> add_defaults()

      uri
      |> Map.put(
        :query,
        if Enum.empty?(params) do
          nil
        else
          URI.encode_query(params)
        end
      )
      |> URI.to_string()
    else
      url
    end
  end

  defp should_be_processed?(%{host: host}) do
    Keyword.get(
      Application.get_env(:lotta, __MODULE__, []),
      :hosts,
      []
    )
    |> Enum.member?(host)
  end

  defp add_width(params, %{width: width}) when not is_nil(width),
    do: Keyword.put(params, :width, width)

  defp add_width(params, _), do: params

  defp add_height(params, %{height: height}) when not is_nil(height),
    do: Keyword.put(params, :height, height)

  defp add_height(params, _), do: params

  defp add_fit(params, %{fn: :fit}), do: Keyword.put(params, :fit, "contain")
  defp add_fit(params, %{fn: :bound}), do: Keyword.put(params, :fit, "contain")
  defp add_fit(params, %{fn: :cover}), do: Keyword.put(params, :crop, "smart")
  defp add_fit(params, _), do: params

  defp add_defaults(params = [_ | _]), do: Keyword.put(params, :metadata, 1)
  defp add_defaults(_), do: []
end
