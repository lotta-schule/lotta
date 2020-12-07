defmodule ApiWeb.SystemResolver do
  @moduledoc false

  alias ApiWeb.Context
  alias Api.System

  def get(_args, _info) do
    {:ok, System.get_configuration()}
  end

  def update(%{system: system_input}, _info) do
    {:ok, System.update_configuration(System.get_configuration(), system_input)}
  end

  def usage(_args, _info) do
    System.Usage.get_usage()
  end

  def custom_domains(_, _), do: {:ok, System.list_custom_domains()}

  def host(_, _), do: {:ok, System.get_main_url(skip_protocol: true)}
end
