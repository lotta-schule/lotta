defmodule Api.Accounts.AuthenticationTest do
  @moduledoc false

  use Api.DataCase

  import Api.Accounts.Authentication

  alias Ecto.Changeset
  alias Api.Repo
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

  describe "Legacy BCrypt Passwords" do
    test "should login user with bcrypt password", %{user: user} do
      user
      |> Changeset.change(%{
        password_hash: "$2b$12$JRSbnsBSoAART.8174TOM.23bCOykoiVc0DjNgOzRrbOyDHZbx8EO",
        password_hash_format: 0
      })
      |> Repo.update()
      assert {:ok, _} = login_with_username_pass(user.email, "test123")
    end

    test "should migrate the password hash to argon2 hash", %{user: user} do
      user
      |> Changeset.change(%{
        password_hash: "$2b$12$JRSbnsBSoAART.8174TOM.23bCOykoiVc0DjNgOzRrbOyDHZbx8EO",
        password_hash_format: 0
      })
      |> Repo.update!()
      assert {:ok, saved_user} = maybe_migrate_password_hashing_format(Repo.get(User, user.id), "test123")
      assert %{password_hash_format: 1} = saved_user
      refute user.updated_at == saved_user.updated_at
    end

    test "should NOT migrate the password hash to argon2 hash if password is already argon2", %{user: user} do
      assert {:ok, saved_user} = maybe_migrate_password_hashing_format(user, "blablapassiertnicht")
      assert %{password_hash_format: 1} = user
      assert user.updated_at == saved_user.updated_at
    end

    test "should convert the password hash to argon2 hash on login", %{user: user} do
      user
      |> Changeset.change(%{
        password_hash: "$2b$12$JRSbnsBSoAART.8174TOM.23bCOykoiVc0DjNgOzRrbOyDHZbx8EO",
        password_hash_format: 0
      })
      |> Repo.update!()
      assert {:ok, login_user} = login_with_username_pass("eike.wiewiorra@lotta.schule", "test123")
      assert %{password_hash_format: 1} = login_user
      refute user.updated_at == login_user.updated_at
    end

    test "should NOT migrate the password hash to argon2 hash if password is already argon2 on login", %{user: user} do
      assert {:ok, saved_user} = login_with_username_pass("eike.wiewiorra@lotta.schule", "test123")
      assert %{password_hash_format: 1} = saved_user
      assert user.updated_at == saved_user.updated_at
    end

  end
end
