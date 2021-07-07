defmodule LottaWeb.Auth.Pipeline do
  @moduledoc """
    Phoenix Authentication pipeline
  """

  use Guardian.Plug.Pipeline,
    otp_app: :lotta,
    error_handler: LottaWeb.Auth.ErrorHandler,
    module: LottaWeb.Auth.AccessToken

  plug Guardian.Plug.VerifyHeader, verify_type_one_of: ["access", "hisec"]

  plug Guardian.Plug.LoadResource, allow_blank: true
end
