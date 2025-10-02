defmodule Lotta.Accounts.AuthenticationTest do
  @moduledoc false

  use Lotta.DataCase

  import Lotta.Accounts.Authentication

  alias Ecto.Changeset
  alias Lotta.{Repo, Tenants}
  alias Lotta.Accounts.User

  @prefix "tenant_test"

  setup do
    tenant = Tenants.get_tenant_by_prefix(@prefix)

    user =
      Repo.one!(
        from(u in User,
          where: u.email == ^"eike.wiewiorra@lotta.schule"
        ),
        prefix: tenant.prefix
      )

    {:ok,
     %{
       user: user,
       tenant: tenant
     }}
  end

  describe "login_with_username_pass/2" do
    test "should login the user with correct username and password", %{tenant: t} do
      assert {:ok, _} = login_with_username_pass("eike.wiewiorra@lotta.schule", "password", t)
    end

    test "should not login when the password is wrong", %{tenant: t} do
      assert {:error, "Falsche Zugangsdaten."} ==
               login_with_username_pass("eike.wiewiorra@lotta.schule", "ABCSichersPW", t)
    end

    test "should login the user when he gave the email in mixed case", %{tenant: t} do
      assert {:ok, _} = login_with_username_pass("Eike.WieWiorra@lotta.schule", "password", t)
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
      refute user.updated_at == saved_user.updated_at
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
               login_with_username_pass("eike.wiewiorra@lotta.schule", "test123", t)

      assert %{password_hash_format: 1} = login_user
      refute user.updated_at == login_user.updated_at
    end

    test "should NOT migrate the password hash to argon2 hash if password is already argon2 on login",
         %{user: user, tenant: t} do
      assert {:ok, saved_user} =
               login_with_username_pass("eike.wiewiorra@lotta.schule", "password", t)

      assert %{password_hash_format: 1} = saved_user
      assert user.updated_at == saved_user.updated_at
    end
  end
end
