defmodule Api.Accounts.AuthenticationTest do
  @moduledoc false

  use Api.DataCase

  import Api.Accounts.Authentication

  alias Api.Repo.Seeder
  alias Api.Accounts.User

  setup do
    Seeder.seed()

    user = Repo.get_by!(User, email: "eike.wiewiorra@lotta.schule")

    {:ok, %{user: user}}
  end

  describe "login_with_username_pass/2" do
    test "should login the user with correct username and password" do
      assert {:ok, _} = login_with_username_pass("eike.wiewiorra@lotta.schule", "test123")
    end

    test "should not login when the password is wrong" do
      assert {:error, "Falsche Zugangsdaten."} ==
               login_with_username_pass("eike.wiewiorra@lotta.schule", "ABCSichersPW")
    end

    test "should login the user when he gave the email in mixed case" do
      assert {:ok, _} = login_with_username_pass("Eike.WieWiorra@lotta.schule", "test123")
    end
  end
end
