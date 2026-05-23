defmodule CockpitWeb.ItemActions.IssueInvoice do
  @moduledoc """
    Item action to issue an invoice.
  """

  use BackpexWeb, :item_action

  import Ecto.Changeset

  @impl Backpex.ItemAction
  def icon(assigns, _item) do
    ~H"""
    <Backpex.HTML.CoreComponents.icon
      name="hero-building-storefront"
      class="h-5 w-5 cursor-pointer transition duration-75 hover:scale-110 hover:text-green-600"
    />
    """
  end

  @impl Backpex.ItemAction
  def handle(socket, [item | _items], _data) do
    case Lotta.Billings.issue_invoice(item) do
      {:ok, _invoice} ->
        {:ok,
         socket
         |> clear_flash()
         |> put_flash(:info, "Invoice successfully issued.")}

      {:error, error} ->
        {:error,
         add_error(
           Ecto.Changeset.change(item),
           :base,
           "Failed to issue invoice: #{inspect(error)}"
         )}
    end
  end

  @impl Backpex.ItemAction
  def confirm(_assigns),
    do: "Are you sure you want to issue the invoice?"

  @impl Backpex.ItemAction
  def label(_assigns, _item), do: "Issue"

  @impl Backpex.ItemAction
  def confirm_label(_assigns), do: "Issue"

  @impl Backpex.ItemAction
  def cancel_label(_assigns), do: "Cancel"
end
