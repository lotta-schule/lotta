defmodule ExAws.Request.Finch do
  @behaviour ExAws.Request.HttpClient

  @moduledoc """
  Configuration for `m:Finch`.

  Options can be set for `m:Finch` with the following config:

      config :ex_aws, :req_opts,
        receive_timeout: 30_000

  The default config handles setting the above.
  """

  @default_opts [receive_timeout: 90_000]

  @impl true
  def request(method, url, body \\ "", headers \\ [], http_opts \\ []) do
    opts = Keyword.merge(@default_opts, http_opts)

    Finch.build(method, url, headers, body, opts)
    |> Finch.request(Lotta.Finch)
    |> case do
      {:ok, %{status: status, headers: headers, body: body}} ->
        {:ok, %{status_code: status, headers: lowercase_headers(headers), body: body}}

      {:error, reason} ->
        {:error, %{reason: reason}}
    end
  end

  defp lowercase_headers(headers) when is_map(headers) do
    Enum.map(headers, fn {k, v} -> {String.downcase(k), v} end)
  end

  defp lowercase_headers(headers), do: headers
end
