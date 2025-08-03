defmodule LottaWeb.OAuthController do
  use LottaWeb, :controller

  alias Lotta.Eduplaces.OAuthStrategy

  def login(conn, %{"provider" => "eduplaces"}) do
    state = UUID.uuid4()

    conn
    |> put_resp_cookie("ep_login_state", state,
      http_only: true,
      signed: true,
      same_site: "Lax",
      # 10 minutes max_age
      max_age: 10 * 60
    )
    |> redirect(external: OAuthStrategy.authorize_url!(state: state))
  end

  def callback(conn, %{"provider" => "eduplaces", "state" => received_login_state} = params) do
    persisted_state = conn.cookies["ep_login_state"]

    conn =
      delete_resp_cookie(conn, "ep_login_state",
        http_only: true,
        signed: true,
        same_site: "Lax"
      )

    cond do
      is_nil(persisted_state) ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "Missing or invalid state parameter."})

      persisted_state != received_login_state ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "State parameter mismatch."})

      true ->
        OAuthStrategy.get_token!(params)

        conn
        |> put_status(:ok)
        |> json(%{alles: :ok})
    end
  end
end
