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
    |> Accounts.register_device(
      flatten_input_map(args)
    )
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

  @doc ~S"""
      Flattens a map, resulting in a one-level deep app

  ## Examples

      iex> LottaWeb.UserDeviceResolver.flatten_input_map(%{
                    "customName" => nil,
                    "platform" => "safari",
                    "deviceType" => "notebook",
                    "modelName" => "Macbook",
                    "push" => %{
                      "token" => "abc",
                      "type" => "apns"
                    }
                  })
      %{
        "customName" => nil,
        "platform" => "safari",
        "deviceType" => "notebook",
        "modelName" => "Macbook",
        "push_token" => "abc",
        "push_type" => "apns"
      }
  """
  defp flatten_input_map(map) when is_map(map) do
    Enum.reduce(map, %{}, fn
      {key, value}, acc when is_map(value) ->
        Enum.reduce(value, acc, fn {subkey, subval}, acc ->
          Map.put(acc, String.to_atom(Enum.join([key, subkey], "_")), subval)
        end)
      {key, value}, acc ->
        Map.put(acc, key, value)
    end)
  end
  defp flatten_input_map(map), do: map
end
