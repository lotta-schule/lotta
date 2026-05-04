defmodule LottaWeb.SessionJSON do
  @moduledoc false
  use LottaWeb, :html

  def refresh(%{access_token: access_token}) do
    %{
      success: true,
      accessToken: access_token
    }
  end
end
