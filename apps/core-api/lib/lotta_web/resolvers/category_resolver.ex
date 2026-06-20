defmodule LottaWeb.CategoryResolver do
  @moduledoc false

  import LottaWeb.ErrorHelpers
  import Absinthe.Resolution.Helpers, only: [batch: 3]

  alias Lotta.Repo
  alias Lotta.Tenants
  alias Lotta.Tenants.Category

  def resolve_widgets(_args, %{
        context: %{current_user: user},
        source: %Category{} = category
      }) do
    # Batch the widget lookups for every category in the same resolution into a
    # single query (the current user is constant within a request, so it is part
    # of the batch key), avoiding an N+1 of one `widgets` query per category.
    #
    # The tenant prefix is captured here (in the request process) and threaded
    # through the batch key, because the batch function runs in a separate
    # process where the process-local prefix is no longer available.
    batch(
      {__MODULE__, :batch_widgets_by_category, {user, Repo.get_prefix()}},
      category.id,
      fn widgets_by_category_id ->
        {:ok, Map.get(widgets_by_category_id, category.id, [])}
      end
    )
  end

  @doc false
  def batch_widgets_by_category({user, prefix}, category_ids) do
    Tenants.list_widgets_by_categories(category_ids, user, prefix)
  end

  def all(_args, %{context: %{current_user: current_user}}) do
    {:ok, Tenants.list_categories(current_user)}
  end

  def update(%{id: id, category: category_params}, _info) do
    category = Tenants.get_category(id)

    if is_nil(category) do
      {:error, "Kategorie mit der id #{id} nicht gefunden."}
    else
      category
      |> Tenants.update_category(category_params)
      |> format_errors("Bearbeiten der Kategorie fehlgeschlagen.")
    end
  end

  def create(%{category: category_params}, _info) do
    category_params
    |> Tenants.create_category()
    |> format_errors("Erstellen der Kategorie fehlgeschlagen.")
  end

  def delete(%{id: id}, _info) do
    category = Tenants.get_category(id)

    if category do
      category
      |> Tenants.delete_category()
      |> format_errors("Löschen der Kategorie fehlgeschlagen.")
    else
      {:error, "Kategorie mit der id #{id} nicht gefunden."}
    end
  end
end
