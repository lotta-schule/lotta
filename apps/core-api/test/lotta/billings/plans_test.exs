defmodule Lotta.Billings.PlansTest do
  @moduledoc false

  use ExUnit.Case, async: true

  alias Lotta.Billings.Plans

  describe "all/0" do
    test "returns all configured plans" do
      plans = Plans.all()

      assert is_map(plans)
      assert Map.has_key?(plans, "test")
      assert Map.has_key?(plans, "supporter")
      assert Map.has_key?(plans, "default_2025")
    end
  end

  describe "get/1" do
    test "returns a plan by name" do
      plan = Plans.get("test")

      assert is_map(plan)
      assert plan.title == "Test"
      assert plan.is_default == true
      assert plan.default_duration == [months: 3]
    end

    test "returns supporter plan" do
      plan = Plans.get("supporter")

      assert is_map(plan)
      assert plan.title == "Lotta"
      assert plan.user_max_storage == 1
      assert plan.media_conversion_minutes == 15
      assert plan.active_user_price == "0.12"
    end

    test "returns nil for non-existent plan" do
      assert Plans.get("non_existent") == nil
    end

    test "returns nil for invalid input" do
      assert Plans.get(nil) == nil
      assert Plans.get(123) == nil
    end
  end

  describe "get_default/0" do
    test "returns the default plan" do
      assert {"test", plan} = Plans.get_default()
      assert plan.is_default == true
      assert plan.title == "Test"
    end
  end

  describe "get_default_name/0" do
    test "returns the default plan name" do
      assert Plans.get_default_name() == "test"
    end
  end

  describe "exists?/1" do
    test "returns true for existing plans" do
      assert Plans.exists?("test") == true
      assert Plans.exists?("supporter") == true
      assert Plans.exists?("default_2025") == true
    end

    test "returns false for non-existent plans" do
      assert Plans.exists?("non_existent") == false
    end

    test "returns false for nil" do
      assert Plans.exists?(nil) == false
    end

    test "returns false for invalid input" do
      assert Plans.exists?(123) == false
      assert Plans.exists?(%{}) == false
    end
  end

  describe "calculate_expiration/2" do
    test "calculates expiration date based on plan duration" do
      from_date = ~D[2025-01-01]
      expires_at = Plans.calculate_expiration("test", from_date)

      # Test plan has 3 months duration
      assert expires_at == ~D[2025-04-01]
    end

    test "calculates expiration for supporter plan" do
      from_date = ~D[2025-01-01]
      expires_at = Plans.calculate_expiration("supporter", from_date)

      # Supporter plan has 1 month duration
      assert expires_at == ~D[2025-02-01]
    end

    test "uses current date when not specified" do
      expires_at = Plans.calculate_expiration("test")

      # Should be approximately 3 months from today
      assert is_struct(expires_at, Date)
      assert Date.compare(expires_at, Date.utc_today()) == :gt
    end

    test "returns nil for non-existent plan" do
      assert Plans.calculate_expiration("non_existent") == nil
    end
  end

  describe "get_next_plan_name/1" do
    test "returns next plan name for test plan" do
      assert Plans.get_next_plan_name("test") == nil
    end

    test "returns next plan name for supporter plan" do
      assert Plans.get_next_plan_name("supporter") == "supporter"
    end

    test "returns next plan name for default_2025 plan" do
      assert Plans.get_next_plan_name("default_2025") == "default_2025"
    end

    test "returns nil for non-existent plan" do
      assert Plans.get_next_plan_name("non_existent") == nil
    end
  end
end
