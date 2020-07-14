defmodule ApiWeb.Auth.Pipeline do
  @moduledoc """
    Phoenix Authentication pipeline
  """

  use Guardian.Plug.Pipeline,
    otp_app: :api,
    error_handler: ApiWeb.Auth.ErrorHandler,
    module: ApiWeb.Auth.AccessToken,
    token_ttl: %{
      "access" => {1, :hour},
      "high_security" => {5, :minutes}
    }

  plug Guardian.Plug.VerifyHeader, claims: %{"typ" => "access"}
  plug Guardian.Plug.VerifyCookie, claims: %{"typ" => "access"}

  plug Guardian.Plug.LoadResource, allow_blank: true
end
