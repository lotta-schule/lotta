defmodule Lotta.Accounts.FileManagmentTest do
  @moduledoc false

  use Lotta.DataCase

  import Ecto.Query

  alias Lotta.Accounts.{FileManagment, User}

  @prefix "tenant_test"

  setup do
    user =
      Repo.one!(
        from(u in User, where: u.email == ^"eike.wiewiorra@lotta.schule"),
        prefix: @prefix
      )

    {:ok, %{user: user}}
  end

  describe "total_user_files_size/1" do
    test "should return the correct size of total files for a user", %{user: user} do
      assert FileManagment.total_user_files_size(user) == 86_016
    end
  end
end
