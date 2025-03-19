defmodule ExAws.Request.Finch do
  @behaviour ExAws.Request.HttpClient

  @moduledoc """
  Configuration for `m:Req`.

  Options can be set for `m:Req` with the following config:

      config :ex_aws, :req_opts,
        receive_timeout: 30_000

  The default config handles setting the above.
  """

  @default_opts [receive_timeout: 30_000]

  @impl true
  def request(method, url, body \\ "", headers \\ [], http_opts \\ []) do
    opts = Keyword.merge(@default_opts, http_opts)

    Finch.build(method, url, headers, body, opts)
    |> Finch.request(Lotta.Finch)
    |> case do
      {:ok, %{status: status, headers: headers, body: body}} ->
        {:ok, %{status_code: status, headers: headers, body: body}}

      {:error, reason} ->
        {:error, %{reason: reason}}
    end
  end
end
