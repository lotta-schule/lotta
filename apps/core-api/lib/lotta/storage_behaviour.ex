defmodule Lotta.StorageBehaviour do
  @moduledoc false
  alias Lotta.Accounts.User

  @callback create_new_user_directories(User.t()) :: [term()]
end
