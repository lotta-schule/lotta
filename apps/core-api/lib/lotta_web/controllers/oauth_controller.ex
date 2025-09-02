defmodule LottaWeb.OAuthController do
  use LottaWeb, :controller

  alias Lotta.{Accounts, Tenants}
  alias Lotta.Eduplaces.{AuthCodeStrategy, UserInfo}
  alias LottaWeb.Urls
  alias LottaWeb.Auth.AccessToken

  require Logger

  def login(conn, %{"provider" => "eduplaces"} = params) do
    state = UUID.uuid4()

    conn
    |> put_resp_cookie("ep_login_state", state,
      http_only: true,
      signed: true,
      same_site: "Lax",
      # 10 minutes max_age
      max_age: 10 * 60
    )
    |> redirect(
      external: AuthCodeStrategy.authorize_url!(state: state, login_hint: params["login_hint"])
    )
  end

  def callback(conn, %{"provider" => "eduplaces", "state" => received_login_state} = params) do
    persisted_state = conn.cookies["ep_login_state"]

    conn =
      conn
      |> delete_resp_cookie("ep_login_state",
        http_only: true,
        signed: true,
        same_site: "Lax"
      )

    cond do
      is_nil(received_login_state) || is_nil(persisted_state) ||
        bit_size(received_login_state) == 0 || bit_size(persisted_state) == 0 ->
        conn
        |> put_status(:bad_request)
        |> render(:bad_request,
          title: gettext("Missing or invalid state parameter."),
          message:
            gettext("The state parameter is missing or invalid. Please try logging in again.")
        )

      persisted_state != received_login_state ->
        conn
        |> put_status(:bad_request)
        |> render(:bad_request,
          title: gettext("State parameter mismatch."),
          message: gettext("The state parameter does not match. Please try logging in again.")
        )

      true ->
        {_token, user} =
          AuthCodeStrategy.get_token!(params)

        with {:ok, {tenant, user}} <-
               get_or_create_user_from_eduplaces_userinfo(user),
             {:ok, token, _claims} <- AccessToken.encode_and_sign(user, %{}, token_type: "hisec") do
          target_uri =
            tenant
            |> Urls.get_tenant_uri()
            |> URI.append_path("/auth/callback")
            |> URI.append_query("token=#{token}")
            |> URI.to_string()

          conn
          |> redirect(external: target_uri)
        else
          {:error, _} ->
            # You could either being to early and just wait for your tenant to be created
            Logger.warning("Tenant not found or user info is invalid.")
            # Make it more user-friendly later
            # conn
            # |> put_status(:not_found)
            # |> render(:no_tenant)
            conn
            |> put_status(:not_found)
            |> render(:not_found,
              title: gettext("Tenant not found"),
              message:
                gettext(
                  "The tenant associated with your account could not be found. It maybe is not registered. Please contact support."
                )
            )
        end
    end
  end

  def callback(conn, %{"provider" => "eduplaces"}),
    do:
      conn
      |> put_status(:bad_request)
      |> render(:"400")

  def callback(conn, _),
    do:
      conn
      |> put_status(:not_found)
      |> render(:"404")

  def request_login(conn, %{"iss" => "https://auth.sandbox.eduplaces.dev"} = params) do
    query =
      params
      |> Map.take(["login_hint"])
      |> URI.encode_query()

    redirect(
      conn,
      to: Enum.join(["/auth/oauth/eduplaces/login", query], "?")
    )
  end

  def request_login(_, _), do: {:error, :not_found}

  def tenant_callback(%{private: %{lotta_tenant: tenant}} = conn, %{"token" => token}) do
    with {:ok, claims} <- AccessToken.decode_and_verify(token, %{"typ" => "hisec"}),
         {:ok, user} <- AccessToken.resource_from_claims(claims),
         true <- claims["tid"] == tenant.id || {:error, :no_tenant_match},
         {:ok, refresh_token, _claims} <-
           AccessToken.encode_and_sign(user, %{}, token_type: "refresh") do
      conn
      |> delete_resp_cookie("SignInAccessToken",
        same_site: "Lax"
      )
      |> put_resp_cookie("SignInRefreshToken", refresh_token,
        max_age: 21 * 24 * 60 * 60,
        http_only: true,
        same_site: "Lax"
      )
      |> redirect(to: "/")
    else
      {:error, reason} ->
        Logger.warning("Invalid access token: #{inspect(reason)}")

        conn
        |> put_status(:unauthorized)
        |> render(:bad_request,
          title: gettext("Unauthorized"),
          message: gettext("You are not authorized to access this resource.")
        )

      false ->
        conn
        |> put_status(:unauthorized)
        |> render(:bad_request,
          title: gettext("Unauthorized"),
          message: gettext("You are not authorized to access this resource.")
        )
    end
  end

  defp get_or_create_user_from_eduplaces_userinfo(
         %UserInfo{id: eduplaces_id, school: %{id: eduplaces_school_id}} = user_info
       ) do
    tenant = Tenants.get_tenant_by_eduplaces_id(eduplaces_school_id)

    if tenant do
      Lotta.Repo.put_prefix(tenant.prefix)
    end

    cond do
      is_nil(tenant) ->
        {:error, :tenant_not_found}

      is_nil(eduplaces_id) ->
        {:error, :invalid_user_info}

      true ->
        Accounts.get_or_create_eduplaces_user(tenant, user_info)
    end
    |> case do
      {:ok, user} ->
        {:ok, {tenant, user}}

      {:error, reason} ->
        {:error, reason}
    end
  end
end
