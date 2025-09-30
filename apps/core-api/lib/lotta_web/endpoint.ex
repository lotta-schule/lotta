defmodule LottaWeb.Endpoint do
  @moduledoc """
  Phoenix endpoint configuration
  """

  use Sentry.PlugCapture
  use Phoenix.Endpoint, otp_app: :lotta
  use Absinthe.Phoenix.Endpoint

  plug(Plug.Telemetry,
    event_prefix: [:phoenix, :endpoint]
  )

  plug(LottaWeb.TenantPlug)
  plug(:use_cookie_as_header)
  plug(LottaWeb.Auth.Pipeline)
  plug(LottaWeb.Context)

  socket("/api/user-socket", LottaWeb.UserSocket,
    websocket: [check_origin: false],
    longpoll: [check_origin: false]
  )

  socket("/api/graphql-socket", LottaWeb.GraphQLSocket,
    websocket: [check_origin: false],
    longpoll: [check_origin: false]
  )

  socket("/live", Phoenix.LiveView.Socket,
    websocket: [check_origin: false],
    longpoll: [check_origin: false]
  )

  # Serve at "/" the static files from "priv/static" directory.
  #
  # You should set gzip to true if you are running phx.digest
  # when deploying your static files in production.
  plug(Plug.Static,
    at: "/",
    from: :lotta,
    gzip: false,
    only: LottaWeb.static_paths()
  )

  # Code reloading can be explicitly enabled under the
  # :code_reloader configuration of your endpoint.
  if code_reloading? do
    plug(Phoenix.CodeReloader)
  end

  plug(Phoenix.LiveDashboard.RequestLogger,
    param_key: "request_logger",
    cookie_key: "request_logger"
  )

  plug(Plug.RequestId)
  plug(Plug.Logger)

  plug(Plug.Parsers,
    parsers: [:urlencoded, :multipart, :json, Absinthe.Plug.Parser],
    pass: ["*/*"],
    length: trunc(1.5 * 1024 * 1024 * 1024),
    json_decoder: Jason
  )

  plug(Sentry.PlugContext)

  plug(Plug.MethodOverride)
  plug(Plug.Head)

  plug(Corsica,
    max_age: 7200,
    origins: "*",
    allow_headers: [
      "Authorization",
      "Content-Type",
      "Accept",
      "Origin",
      "User-Agent",
      "DNT",
      "Cache-Control",
      "X-Mx-ReqToken",
      "Keep-Alive",
      "X-Requested-With",
      "If-Modified-Since",
      "X-CSRF-Token",
      "tenant"
    ],
    allow_credentials: true
  )

  plug(LottaWeb.Router)

  defp use_cookie_as_header(conn, _opts) do
    conn =
      conn
      |> Plug.Conn.fetch_cookies()

    cookie_access_token = conn.cookies["SignInAccessToken"]

    header_access_token =
      conn
      |> Plug.Conn.get_req_header("authorization")
      |> List.first()

    cond do
      is_nil(cookie_access_token) || byte_size(cookie_access_token) < 2 ->
        conn

      not is_nil(header_access_token) ->
        conn

      true ->
        conn
        |> Plug.Conn.put_req_header("authorization", "Bearer " <> cookie_access_token)
    end
  end
end
