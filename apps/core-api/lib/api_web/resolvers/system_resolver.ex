defmodule ApiWeb.SystemResolver do
  @moduledoc """
    GraphQL Resolver Module for configuring system
  """

  import Api.Accounts.Permissions

  alias Api.System

  def get(_args, _info) do
    {:ok, System.get_configuration()}
  end

  def update(%{system: system_input}, %{context: context}) do
    if context[:current_user] && user_is_admin?(context.current_user) do
      {:ok, System.update_configuration(System.get_configuration(), system_input)}
    else
      {:error, "Nur Administratoren dürfen das."}
    end
  end

  def usage(_args, %{context: %{current_user: current_user}}) do
    if user_is_admin?(current_user) do
      System.Usage.get_usage()
    else
      {:error, "Nur Administratoren dürfen das."}
    end
  end

  def usage(_, _), do: {:error, "Nur Administratoren dürfen das."}

  def custom_domains(_, _), do: {:ok, System.list_custom_domains()}

  def host(_, _), do: {:ok, System.get_main_url(skip_protocol: true)}
end
