defmodule ExAws.Request.Finch do
  @behaviour ExAws.Request.HttpClient

  @moduledoc """
  Configuration for `m:Finch`.

  Options can be set for `m:Finch` with the following config:

      config :ex_aws, :req_opts,
        receive_timeout: 30_000

  The default config handles setting the above.
  """

  @default_receive_timeout 90_000

  @impl true
  def request(method, url, body \\ "", headers \\ [], http_opts \\ []) do
    merged = Keyword.merge([receive_timeout: @default_receive_timeout], http_opts)

    {request_opts, build_opts} =
      Keyword.split(merged, [:receive_timeout, :pool_timeout, :raw_headers])

    Finch.build(method, url, headers, body, build_opts)
    |> Finch.request(Lotta.Finch, request_opts)
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
