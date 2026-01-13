import Config

config :lotta,
  plans: %{
    "test" => %{
      is_default: true,
      title: "Test",
      default_duration: [month: 3],
      default_next_plan: nil
    },
    "free" => %{
      title: "Free",
      default_duration: [month: 12],
      default_next_plan: "free"
    },
    # specials
    "ehrenberg" => %{
      title: "Lotta",
      base_price: "39.00",
      user_max_storage: 1,
      media_conversion_minutes: 30,
      active_user_price: "0.10",
      exceeding_storage_price: "1.00",
      exceeding_conversion_price: "1.00",
      default_duration: [month: 1],
      default_next_plan: "ehrenberg"
    },
    "jp" => %{
      title: "Lotta",
      base_price: "20.00",
      user_max_storage: 1,
      media_conversion_minutes: 15,
      active_user_price: "0.00",
      exceeding_storage_price: "0.00",
      exceeding_conversion_price: "0.00",
      default_duration: [month: 1],
      default_next_plan: "jp"
    },
    "supporter" => %{
      title: "Lotta",
      base_price: "39.00",
      user_max_storage: 1,
      media_conversion_minutes: 15,
      active_user_price: "0.10",
      exceeding_storage_price: "1.00",
      exceeding_conversion_price: "1.00",
      default_duration: [month: 1],
      default_next_plan: "supporter"
    },
    # standard plans
    "default_2025" => %{
      title: "Lotta",
      base_price: "39.00",
      user_max_storage: 1,
      media_conversion_minutes: 15,
      active_user_price: "0.15",
      exceeding_storage_price: "1.00",
      exceeding_conversion_price: "1.00",
      default_duration: [month: 1],
      default_next_plan: "default_2025"
    }
  }
