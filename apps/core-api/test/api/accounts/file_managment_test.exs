defmodule Api.Accounts.FileManagmentTest do
  @moduledoc false

  use Api.DataCase

  alias Api.Accounts.{FileManagment, User}

  setup do
    user = Repo.get_by!(User, email: "eike.wiewiorra@lotta.schule")

    {:ok, %{user: user}}
  end

  describe "total_user_files_size/1" do
    test "should return the correct size of total files for a user", %{user: user} do
      assert FileManagment.total_user_files_size(user) == 86016
    end
  end
end
