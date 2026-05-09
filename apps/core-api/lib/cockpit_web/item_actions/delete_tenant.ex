defmodule CockpitWeb.ItemActions.DeleteTenant do
  @moduledoc """
    Item action to delete a tenant.
  """

  use BackpexWeb, :item_action

  import Ecto.Changeset

  @impl Backpex.ItemAction
  def icon(assigns, _item) do
    ~H"""
    <Backpex.HTML.CoreComponents.icon
      name="hero-trash"
      class="h-5 w-5 cursor-pointer transition duration-75 hover:scale-110 hover:text-green-600"
    />
    """
  end

  @impl Backpex.ItemAction
  def handle(socket, [item | _items], _data) do
    case Lotta.Tenants.delete_tenant(item) do
      {:ok, _tenant} ->
        {:ok,
         socket
         |> clear_flash()
         |> put_flash(:info, "Tenant successfully deleted.")}

      {:error, error} ->
        {:error,
         add_error(
           Ecto.Changeset.change(item),
           :base,
           "Failed to delete tenant: #{inspect(error)}"
         )}
    end
  end

  @impl Backpex.ItemAction
  def confirm(_assigns),
    do: "Are you sure you want to delete the tenant? This action cannot be undone."

  @impl Backpex.ItemAction
  def label(_assigns, _item), do: "Delete"

  @impl Backpex.ItemAction
  def confirm_label(_assigns), do: "Delete"

  @impl Backpex.ItemAction
  def cancel_label(_assigns), do: "Cancel"
end
