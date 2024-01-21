defmodule Lotta.Notification.PushNotificationRequestTest do
  alias Lotta.Notification.PushNotificationRequest

  use Lotta.DataCase

  @prefix "tenant_test"

  setup do
    Repo.put_prefix(@prefix)

    [tenant | _] = Repo.all(Lotta.Tenants.Tenant, prefix: "public")

    {:ok, %{tenant: tenant}}
  end

  describe "PushNotificationRequest" do
    test "new/1", %{tenant: tenant} do
      assert %PushNotificationRequest{
               tenant: ^tenant
             } = PushNotificationRequest.new(tenant)
    end

    test "put_XX/2", %{tenant: tenant} do
      assert %PushNotificationRequest{
               title: "title",
               subtitle: "subtitle",
               body: "body",
               category: "category",
               thread_id: "thread_id",
               data: %{"key" => "val"}
             } =
               PushNotificationRequest.new(tenant)
               |> PushNotificationRequest.put_title("title")
               |> PushNotificationRequest.put_subtitle("subtitle")
               |> PushNotificationRequest.put_body("body")
               |> PushNotificationRequest.put_category("category")
               |> PushNotificationRequest.put_thread_id("thread_id")
               |> PushNotificationRequest.put_data(%{"key" => "val"})
    end

    test "create_apns_notification", %{tenant: tenant} do
      assert %Pigeon.APNS.Notification{
               device_token: "token",
               payload: %{
                 "aps" => %{
                   "alert" => "",
                   "category" => "category",
                   "content-available" => 1,
                   "thread-id" => nil
                 },
                 "key" => "val"
               }
             } =
               PushNotificationRequest.new(tenant)
               |> PushNotificationRequest.put_category("category")
               |> PushNotificationRequest.put_data(%{"key" => "val"})
               |> PushNotificationRequest.create_apns_notification("token")

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
               PushNotificationRequest.new(tenant)
               |> PushNotificationRequest.put_title("title")
               |> PushNotificationRequest.put_subtitle("subtitle")
               |> PushNotificationRequest.put_body("body")
               |> PushNotificationRequest.put_category("category")
               |> PushNotificationRequest.put_thread_id("thread_id")
               |> PushNotificationRequest.put_data(%{"key" => "val"})
               |> PushNotificationRequest.create_apns_notification("token")
    end

    test "create_fcm_notification", %{tenant: tenant} do
      assert %Pigeon.FCM.Notification{
               target: {:token, "token"},
               notification: nil,
               data: %{
                 "key" => "val"
               }
             } =
               PushNotificationRequest.new(tenant)
               |> PushNotificationRequest.put_category("category")
               |> PushNotificationRequest.put_data(%{"key" => "val"})
               |> PushNotificationRequest.create_fcm_notification({:token, "token"})

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
               PushNotificationRequest.new(tenant)
               |> PushNotificationRequest.put_title("title")
               |> PushNotificationRequest.put_subtitle("subtitle")
               |> PushNotificationRequest.put_body("body")
               |> PushNotificationRequest.put_category("category")
               |> PushNotificationRequest.put_thread_id("thread_id")
               |> PushNotificationRequest.put_data(%{"key" => "val"})
               |> PushNotificationRequest.create_fcm_notification({:token, "token"})
    end
  end
end
