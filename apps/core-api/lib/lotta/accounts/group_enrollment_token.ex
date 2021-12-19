defmodule Lotta.Accounts.GroupEnrollmentToken do
  @moduledoc """
    Ecto Schema for user group enrollment tokens.
    A GroupEnrollmentToken is a token which will grant permission to a UserGroup
  """

  use Ecto.Schema

  alias Lotta.Accounts.UserGroup

  @timestamps_opts [type: :utc_datetime]

  schema "group_enrollment_tokens" do
    field :token, :string

    belongs_to :group, UserGroup, foreign_key: :group_id

    timestamps()
  end

  @type id :: number()

  @type t :: %__MODULE__{id: id, token: String.t(), group_id: UserGroup.t()}
end
