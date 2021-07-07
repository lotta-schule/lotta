defmodule Lotta.Services.EmailSendRequest do
  @moduledoc """
    struct representing an email which is requested to be sent
  """

  @derive [Poison.Encoder]
  defstruct [:to, :sender_name, :subject, :template, :templatevars]
end
