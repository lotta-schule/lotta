defmodule Lotta.Notification.PushNotificationRequest do
  @moduledoc """
  Struct to hold all the information needed to create a push notification.
  It is used to create the actual notification for the different providers.
  """

  defstruct tenant: nil,
            title: nil,
            subtitle: nil,
            category: nil,
            thread_id: nil,
            body: nil,
            data: %{}

  @doc """
  Creates a new push notification request for a given tenant.

  ## Examples

      iex> PushNotificationRequest.new(tenant)
      %PushNotificationRequest{
        body: nil,
        category: nil,
        data: %{},
        subtitle: nil,
        tenant: tenant,
        thread_id: nil,
        title: nil
      }
  """
  @doc since: "4.1.3"
  @spec new(Tenant.t()) :: PushNotificationRequest.t()
  def new(tenant) do
    %__MODULE__{
      tenant: tenant
    }
  end

  @doc """
  Sets the title of the push notification.
  """
  @doc since: "4.1.3"
  @spec put_title(PushNotificationRequest.t(), String.t() | nil) :: PushNotificationRequest.t()
  def put_title(notification, title), do: put(notification, :title, title)

  @doc """
  Sets the subtitle of the push notification.
  """
  @doc since: "4.1.3"
  @spec put_subtitle(PushNotificationRequest.t(), String.t() | nil) :: PushNotificationRequest.t()
  def put_subtitle(notification, subtitle), do: put(notification, :subtitle, subtitle)

  @doc """
  Sets the body of the push notification.
  """
  @doc since: "4.1.3"
  @spec put_body(PushNotificationRequest.t(), String.t() | nil) :: PushNotificationRequest.t()
  def put_body(notification, body), do: put(notification, :body, body)

  @doc """
  Sets the category of the push notification.
  Only supported by the APNS provider. Other providers will add this to the data.
  """
  @doc since: "4.1.3"
  @spec put_category(PushNotificationRequest.t(), String.t() | nil) :: PushNotificationRequest.t()
  def put_category(notification, category), do: put(notification, :category, category)

  @doc """
  Sets the thread_id of the push notification.
  Only supported by the APNS provider. Other providers will add this to the data.
  """
  @doc since: "4.1.3"
  @spec put_thread_id(PushNotificationRequest.t(), String.t() | nil) ::
          PushNotificationRequest.t()
  def put_thread_id(notification, thread_id), do: put(notification, :thread_id, thread_id)

  @doc """
  Sets arbitrary data of the push notification.
  """
  @doc since: "4.1.3"
  @spec put_data(PushNotificationRequest.t(), map() | nil) :: PushNotificationRequest.t()
  def put_data(notification, nil), do: notification

  def put_data(notification, data),
    do: Map.put(notification, :data, Map.merge(notification.data, data))

  @doc """
  Creates a `Pigeon.APNS.Notification` from a given `Lotta.Notification.PushNotificationRequest`,
  which can be used to send the notification to the APNS provider.
  """
  @doc since: "4.1.3"
  def create_apns_notification(notification, target) do
    Pigeon.APNS.Notification.new(
      "",
      target,
      get_topic()
    )
    |> then(fn apns_notification ->
      if Map.get(notification, :title) do
        apns_notification
        |> Pigeon.APNS.Notification.put_alert(
          remove_nil_values(%{
            title: notification.title,
            subtitle: notification.subtitle,
            body: notification.body
          })
        )
        |> Pigeon.APNS.Notification.put_sound("default")
      else
        apns_notification
      end
    end)
    |> then(fn apns_notification ->
      if map_size(Map.get(notification, :data)) > 0 do
        apns_notification
        |> Pigeon.APNS.Notification.put_content_available()
        |> Pigeon.APNS.Notification.put_custom(notification.data)
      else
        apns_notification
      end
    end)
    |> Pigeon.APNS.Notification.put_category(notification.category)
    |> Pigeon.APNS.Notification.put_thread_id(notification.thread_id)
  end

  @doc """
  Creates a `Pigeon.FCM.Notification` from a given `Lotta.Notification.PushNotificationRequest`,
  which can be used to send the notification to the FCM provider.
  """
  @doc since: "4.1.3"
  def create_fcm_notification(notification, target) do
    alert =
      if notification.title do
        %{
          "title" => notification.title,
          "body" => notification.body
        }
      end

    merged_data =
      Map.merge(
        %{
          "category" => notification.category,
          "thread-id" => notification.thread_id
        },
        notification.data
      )
      |> remove_nil_values()

    data =
      if map_size(merged_data) > 0 do
        merged_data
        |> Enum.map(fn {key, value} -> {key, to_string(value)} end)
        |> Enum.into(%{})
      end

    Pigeon.FCM.Notification.new(target, alert, data)
  end

  defp put(notification, _, nil), do: notification
  defp put(notification, key, value), do: Map.put(notification, key, value)

  defp remove_nil_values(map) do
    Map.reject(map, fn {_, value} ->
      is_nil(value)
    end)
  end

  defp get_topic() do
    Application.get_env(:lotta, Lotta.Notification.Provider.APNS)
    |> Keyword.get(:topic, "net.einsa.lotta")
  end
end
