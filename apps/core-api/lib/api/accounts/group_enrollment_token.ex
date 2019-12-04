defmodule Api.Accounts.GroupEnrollmentToken do
  use Ecto.Schema

  alias Api.Accounts.User

  schema "group_enrollment_tokens" do
    field :token, :string

    belongs_to :group, Api.Accounts.UserGroup,
      foreign_key: :group_id
    
    timestamps()
  end
end