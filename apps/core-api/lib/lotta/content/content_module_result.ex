defmodule Lotta.Content.ContentModuleResult do
  @moduledoc false

  @type id() :: number()

  @type t() :: %{id: id(), result: map()}

  use Ecto.Schema

  @timestamps_opts [type: :utc_datetime]

  schema "content_module_results" do
    field :result, :map

    belongs_to :content_module, Lotta.Content.ContentModule
    belongs_to :user, Lotta.Accounts.User

    timestamps()
  end
end
