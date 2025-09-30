defmodule LottaWeb.TokenJSON do
  @moduledoc false
  use LottaWeb, :html

  def refresh(%{access_token: access_token, refresh_token: refresh_token}) do
    %{
      success: true,
      accessToken: access_token,
      refreshToken: refresh_token
    }
  end
end
