defmodule Lotta.Accounts.AuthenticationTest do
  @moduledoc false

  use Lotta.DataCase, async: true

  import Lotta.Accounts.Authentication
  import Lotta.Factory

  alias Ecto.Changeset
  alias Lotta.{Repo, Tenants}
  alias Lotta.Accounts.User

  @prefix "tenant_test"

  setup do
    tenant = Tenants.get_tenant_by_prefix(@prefix)

    Repo.put_prefix(@prefix)

    user =
      insert(:user, email: "auth-eike@lotta.schule", name: "Eike Wiewiorra", nickname: "Chef")
      |> Ecto.Changeset.change(%{
        password_hash: Argon2.hash_pwd_salt("password"),
        password_hash_format: 1
      })
      |> Repo.update!()

    {:ok,
     %{
       user: user,
       tenant: tenant
     }}
  end

  describe "login_with_username_pass/2" do
    test "should login the user with correct username and password", %{tenant: t} do
      assert {:ok, _} = login_with_username_pass("auth-eike@lotta.schule", "password", t)
    end

    test "should not login when the password is wrong", %{tenant: t} do
      assert {:error, "Falsche Zugangsdaten."} ==
               login_with_username_pass("auth-eike@lotta.schule", "ABCSichersPW", t)
    end

    test "should login the user when he gave the email in mixed case", %{tenant: t} do
      assert {:ok, _} = login_with_username_pass("Auth-Eike@lotta.schule", "password", t)
    end
  end

  describe "Legacy BCrypt Passwords" do
    test "should login user with bcrypt password", %{user: user, tenant: t} do
      user
      |> Changeset.change(%{
        password_hash: "$2b$12$JRSbnsBSoAART.8174TOM.23bCOykoiVc0DjNgOzRrbOyDHZbx8EO",
        password_hash_format: 0
      })
      |> Repo.update!()

      assert {:ok, _} = login_with_username_pass(user.email, "test123", t)
    end

    test "should migrate the password hash to argon2 hash", %{user: user, tenant: t} do
      user
      |> Changeset.change(%{
        password_hash: "$2b$12$JRSbnsBSoAART.8174TOM.23bCOykoiVc0DjNgOzRrbOyDHZbx8EO",
        password_hash_format: 0
      })
      |> Repo.update!()

      assert {:ok, saved_user} =
               maybe_migrate_password_hashing_format(
                 Repo.get(User, user.id, prefix: t.prefix),
                 "test123"
               )

      assert %{password_hash_format: 1} = saved_user

      assert saved_user.password_hash !=
               "$2b$12$JRSbnsBSoAART.8174TOM.23bCOykoiVc0DjNgOzRrbOyDHZbx8EO"
    end

    test "should NOT migrate the password hash to argon2 hash if password is already argon2", %{
      user: user
    } do
      assert {:ok, saved_user} =
               maybe_migrate_password_hashing_format(user, "blablapassiertnicht")

      assert %{password_hash_format: 1} = user
      assert user.updated_at == saved_user.updated_at
    end

    test "should convert the password hash to argon2 hash on login", %{user: user, tenant: t} do
      user
      |> Changeset.change(%{
        password_hash: "$2b$12$JRSbnsBSoAART.8174TOM.23bCOykoiVc0DjNgOzRrbOyDHZbx8EO",
        password_hash_format: 0
      })
      |> Repo.update!()

      assert {:ok, login_user} =
               login_with_username_pass("auth-eike@lotta.schule", "test123", t)

      assert %{password_hash_format: 1} = login_user

      assert login_user.password_hash !=
               "$2b$12$JRSbnsBSoAART.8174TOM.23bCOykoiVc0DjNgOzRrbOyDHZbx8EO"
    end

    test "should NOT migrate the password hash to argon2 hash if password is already argon2 on login",
         %{user: user, tenant: t} do
      assert {:ok, saved_user} =
               login_with_username_pass("auth-eike@lotta.schule", "password", t)

      assert %{password_hash_format: 1} = saved_user
      assert user.updated_at == saved_user.updated_at
    end
  end
end
