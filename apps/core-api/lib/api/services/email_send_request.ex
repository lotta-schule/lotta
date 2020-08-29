defmodule Api.Services.EmailSendRequest do
  @moduledoc """
    struct representing an email which is requested to be sent
  """

  alias Api.System

  @derive [Poison.Encoder]
  defstruct [:to, :sender_name, :subject, :template, :templatevars]

  def get_tenant_info(), do: System.get_configuration()
end
