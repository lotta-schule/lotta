defmodule Api.Accounts.UserEnrollmentToken do
  use Ecto.Schema

  alias Api.Accounts.User

  schema "users_enrollment_tokens" do
    field :enrollment_token, :string

    belongs_to :user, Api.Accounts.User
    
    timestamps()
  end
end