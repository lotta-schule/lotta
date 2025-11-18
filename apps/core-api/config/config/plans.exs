import Config

config :lotta,
  plans: %{
    "test" => %{
      is_default: true,
      title: "Test",
      default_duration: [months: 3],
      default_next_plan: nil
    },
    "supporter" => %{
      title: "Lotta",
      base_price: "39.00",
      user_max_storage: 1,
      media_conversion_minutes: 15,
      active_user_price: "0.12",
      exceeding_storage_price: "1.00",
      exceeding_conversion_price: "1.00",
      default_duration: [months: 1],
      default_next_plan: "supporter"
    },
    "default_2025" => %{
      title: "Lotta",
      base_price: "39.00",
      user_max_storage: 1,
      media_conversion_minutes: 15,
      active_user_price: "0.12",
      exceeding_storage_price: "1.00",
      exceeding_conversion_price: "1.00",
      default_duration: [months: 1],
      default_next_plan: "default_2025"
    }
  }
