defmodule LottaWeb.UserDeviceResolver do
  @moduledoc false

  alias Lotta.Accounts

  def get_devices(_args, %{context: %{current_user: current_user}}) do
    current_user
    |> Accounts.list_devices()
    |> then(&{:ok, &1})
  end

  def register_device(%{device: args}, %{context: %{current_user: current_user}}) do
    current_user
    |> Accounts.register_device(flatten_input_map(args))
  end

  def register_device(_, _), do: {:error, "Geräteinformationen fehlen."}

  def update_device(%{id: id, device: args}, %{context: %{current_user: current_user}}) do
    device = Accounts.get_device(id)

    if is_nil(device) || device.user_id != current_user.id do
      {:error, "Du hast nicht die nötigen Rechte, um das zu tun."}
    else
      Accounts.update_device(device, args)
    end
  end

  def delete_device(%{id: id}, %{context: %{current_user: current_user}}) do
    device = Accounts.get_device(id)

    if is_nil(device) || device.user_id != current_user.id do
      {:error, "Du hast nicht die nötigen Rechte, um das zu tun."}
    else
      Accounts.delete_device(device)
    end
  end

  defp flatten_input_map(map), do: map
end
