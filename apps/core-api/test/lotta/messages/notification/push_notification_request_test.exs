defmodule Lotta.PushNotification.RequestTest do
  alias Lotta.PushNotification.Request

  use Lotta.DataCase

  @prefix "tenant_test"

  setup do
    Repo.put_prefix(@prefix)

    [tenant | _] = Repo.all(Lotta.Tenants.Tenant, prefix: "public")

    {:ok, %{tenant: tenant}}
  end

  describe "Request" do
    test "new/1", %{tenant: tenant} do
      assert %Request{
               tenant: ^tenant
             } = Request.new(tenant)
    end

    test "put_XX/2", %{tenant: tenant} do
      assert %Request{
               title: "title",
               subtitle: "subtitle",
               body: "body",
               category: "category",
               thread_id: "thread_id",
               data: %{"key" => "val"}
             } =
               Request.new(tenant)
               |> Request.put_title("title")
               |> Request.put_subtitle("subtitle")
               |> Request.put_body("body")
               |> Request.put_category("category")
               |> Request.put_thread_id("thread_id")
               |> Request.put_data(%{"key" => "val"})
    end

    test "create_apns_notification", %{tenant: tenant} do
      assert %Pigeon.APNS.Notification{
               device_token: "token",
               payload: %{
                 "aps" => %{
                   "alert" => nil,
                   "category" => "category",
                   "content-available" => 1,
                   "thread-id" => nil
                 },
                 "key" => "val"
               }
             } =
               Request.new(tenant)
               |> Request.put_category("category")
               |> Request.put_data(%{"key" => "val"})
               |> Request.create_apns_notification("token")

      assert %Pigeon.APNS.Notification{
               device_token: "token",
               payload: %{
                 "aps" => %{
                   "alert" => %{
                     title: "title",
                     subtitle: "subtitle",
                     body: "body"
                   },
                   "category" => "category",
                   "content-available" => 1,
                   "thread-id" => "thread_id"
                 },
                 "key" => "val"
               }
             } =
               Request.new(tenant)
               |> Request.put_title("title")
               |> Request.put_subtitle("subtitle")
               |> Request.put_body("body")
               |> Request.put_category("category")
               |> Request.put_thread_id("thread_id")
               |> Request.put_data(%{"key" => "val"})
               |> Request.create_apns_notification("token")
    end

    test "create_fcm_notification", %{tenant: tenant} do
      assert %Pigeon.FCM.Notification{
               target: {:token, "token"},
               notification: nil,
               data: %{
                 "key" => "val"
               }
             } =
               Request.new(tenant)
               |> Request.put_category("category")
               |> Request.put_data(%{"key" => "val"})
               |> Request.create_fcm_notification({:token, "token"})

      assert %Pigeon.FCM.Notification{
               target: {:token, "token"},
               notification: %{
                 "title" => "title",
                 "body" => "body"
               },
               data: %{
                 "key" => "val"
               }
             } =
               Request.new(tenant)
               |> Request.put_title("title")
               |> Request.put_subtitle("subtitle")
               |> Request.put_body("body")
               |> Request.put_category("category")
               |> Request.put_thread_id("thread_id")
               |> Request.put_data(%{"key" => "val"})
               |> Request.create_fcm_notification({:token, "token"})
    end
  end
end
