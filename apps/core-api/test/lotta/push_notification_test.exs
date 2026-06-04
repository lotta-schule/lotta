defmodule Lotta.PushNotificationTest do
  @moduledoc false

  use Lotta.DataCase, async: true

  alias Lotta.{PushNotification}

  setup do
    original = Application.get_env(:lotta, Lotta.PushNotification, [])
    on_exit(fn -> Application.put_env(:lotta, Lotta.PushNotification, original) end)
    :ok
  end

  describe "PushNotification.enabled(:fcm)" do
    test "enabled(:fcm) should return false if no google-services.json is provided" do
      assert not PushNotification.enabled?(:fcm)
      assert not PushNotification.enabled?(:goth)
    end

    test "enabled(:fcm) should return true if google-services.json" do
      Application.put_env(:lotta, Lotta.PushNotification,
        apns: [],
        fcm: [
          service_account_json: "{}",
          project_id: "123456"
        ]
      )

      assert PushNotification.enabled?(:fcm)
      assert PushNotification.enabled?(:goth)
    end
  end

  describe "PushNotification.enabled(:apns)" do
    test "enabled(:apns) should return false if keys are not set" do
      assert not PushNotification.enabled?(:apns)
    end

    test "enabled(:apns) should return true if all APNS_{KEY, KEY_ID, TEAM_ID} are set" do
      Application.put_env(:lotta, Lotta.PushNotification,
        apns: [
          key: "-----BEGIN PRIVATE KEY-----\ndwIBAQQg\n-----END PRIVATE KEY",
          key_identifier: "alsdjhawoulhejfuhu",
          team_id: "fjalskdfjalskdfj",
          topic: "schule.lotta",
          prod?: false
        ],
        fcm: []
      )

      assert PushNotification.enabled?(:apns)
    end
  end
end
