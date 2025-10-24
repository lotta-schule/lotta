defmodule LottaWeb.ErrorJSON do
  @moduledoc """
  This module is invoked by your endpoint in case of errors on JSON requests.

  See config/config.exs.
  """

  def render(template, %{}) do
    error_map =
      %{name: Phoenix.Controller.status_message_from_template(template)}

    %{success: false, error: error_map}
  end
end
