defmodule LottaWeb.UserDeviceResolverTest do
  @moduledoc false

  use LottaWeb.ConnCase

  import Ecto.Query

  alias LottaWeb.Auth.AccessToken
  alias Lotta.{Repo, Tenants, Accounts}
  alias Lotta.Accounts.User

  @prefix "tenant_test"

  setup do
    tenant = Tenants.get_tenant_by_prefix(@prefix)

    user =
      Repo.one!(from(u in User, where: u.email == ^"eike.wiewiorra@lotta.schule"),
        prefix: tenant.prefix
      )

    user2 =
      Repo.one!(
        from(u in User, where: u.email == ^"billy@lotta.schule"),
        prefix: tenant.prefix
      )

    {:ok, user_jwt, _} = AccessToken.encode_and_sign(user)
    {:ok, user2_jwt, _} = AccessToken.encode_and_sign(user2)

    {:ok, device1} =
      Accounts.register_device(user, %{
        platform: "ios",
        device_type: "phone",
        model_name: "iphone16,1",
        push: %{
          token: "abcdefg",
          token_type: "apns"
        }
      })

    {:ok, device2} =
      Accounts.register_device(user, %{
        platform: "chrome",
        device_type: "desktop",
        model_name: "chrome-os 104.01",
        push: nil
      })

    {:ok,
     tenant: tenant,
     user: user,
     user_jwt: user_jwt,
     user2_jwt: user2_jwt,
     devices: [device1, device2]}
  end

  describe "get user devices query" do
    @query """
    {
      devices {
        customName
        platform
        deviceType
        modelName
      }
    }
    """
    test "returns user devices", %{
      tenant: tenant,
      user: user,
      user_jwt: user_jwt,
      devices: devices
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> get("/api", query: @query)
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "devices" => [
                   %{
                     "customName" => nil,
                     "platform" => "ios",
                     "deviceType" => "phone",
                     "modelName" => "iphone16,1"
                   },
                   %{
                     "customName" => nil,
                     "platform" => "chrome",
                     "deviceType" => "desktop",
                     "modelName" => "chrome-os 104.01"
                   }
                 ]
               }
             }
    end

    test "returns error when user is not logged in", %{
      tenant: tenant,
      user: user,
      user_jwt: user_jwt,
      devices: devices
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> get("/api", query: @query)
        |> json_response(200)

      assert %{
               "data" => %{"devices" => nil},
               "errors" => [
                 %{
                   "message" => "Du musst angemeldet sein um das zu tun.",
                   "path" => ["devices"]
                 }
               ]
             } = res
    end
  end

  describe "register user device mutation" do
    @query """
    mutation RegisterDevice($device: RegisterDeviceInput!) {
      registerDevice(device: $device) {
        customName
        platform
        deviceType
        modelName
      }
    }
    """
    test "registers user device", %{
      tenant: tenant,
      user: user,
      user_jwt: user_jwt,
      devices: devices
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            device: %{
              platform: "safari",
              deviceType: "notebook",
              modelName: "Macbook",
              push: %{
                token: "abcdefghijklmnopqrs",
                token_type: "apns"
              }
            }
          }
        )
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "registerDevice" => %{
                   "customName" => nil,
                   "platform" => "safari",
                   "deviceType" => "notebook",
                   "modelName" => "Macbook"
                 }
               }
             }
    end

    test "returns error when user is not logged in", %{
      tenant: tenant,
      user: user,
      user_jwt: user_jwt,
      devices: devices
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> post("/api",
          query: @query,
          variables: %{
            device: %{
              platform: "safari",
              deviceType: "notebook",
              modelName: "Macbook",
              push: %{
                token: "abcdefghijklmnopqrs",
                token_type: "apns"
              }
            }
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{"registerDevice" => nil},
               "errors" => [
                 %{
                   "message" => "Du musst angemeldet sein um das zu tun.",
                   "path" => ["registerDevice"]
                 }
               ]
             } = res
    end
  end

  describe "update user device mutation" do
    @query """
    mutation UpdateDevice($id: ID!, $device: UpdateDeviceInput!) {
      updateDevice(id: $id, device: $device) {
        customName
        platform
        deviceType
      }
    }
    """
    test "updates device", %{
      tenant: tenant,
      user: user,
      user_jwt: user_jwt,
      devices: devices
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            id: List.first(devices).id,
            device: %{
              customName: "My Thing",
              device_type: "tablet",
              push: nil
            }
          }
        )
        |> json_response(200)

      assert res == %{
               "data" => %{
                 "updateDevice" => %{
                   "customName" => "My Thing",
                   "platform" => "ios",
                   "deviceType" => "tablet"
                 }
               }
             }
    end

    test "returns error when user is not logged in", %{
      tenant: tenant,
      user: user,
      user_jwt: user_jwt,
      devices: devices
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> post("/api",
          query: @query,
          variables: %{
            id: List.first(devices).id,
            device: %{
              customName: "My Thing",
              device_type: "tablet",
              push: nil
            }
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{"updateDevice" => nil},
               "errors" => [
                 %{
                   "message" => "Du musst angemeldet sein um das zu tun.",
                   "path" => ["updateDevice"]
                 }
               ]
             } = res
    end

    test "returns error when user tries to edit other user's device", %{
      tenant: tenant,
      user: user,
      user2_jwt: user2_jwt,
      devices: devices
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user2_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            id: List.first(devices).id,
            device: %{
              customName: "My Thing",
              device_type: "tablet",
              push: nil
            }
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{"updateDevice" => nil},
               "errors" => [
                 %{
                   "message" => "Du hast nicht die nötigen Rechte, um das zu tun.",
                   "path" => ["updateDevice"]
                 }
               ]
             } = res
    end
  end
end
