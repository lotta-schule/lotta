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
end
