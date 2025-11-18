defmodule Lotta.Billings.Plans do
  @moduledoc """
  Module for managing billing plans configuration.
  """

  @doc """
  Returns all configured plans.
  """
  @spec all() :: map()
  def all do
    Application.get_env(:lotta, :plans, %{})
  end

  @doc """
  Returns a specific plan by name.
  """
  @spec get(String.t()) :: map() | nil
  def get(plan_name) when is_binary(plan_name) do
    all()[plan_name]
  end

  def get(_), do: nil

  @doc """
  Returns the default plan.
  If no plan is marked as default, returns the first configured plan.
  """
  @spec get_default() :: {String.t(), map()} | nil
  def get_default do
    plans = all()

    # First, try to find a plan with is_default: true
    default_plan =
      Enum.find(plans, fn {_name, plan} ->
        Map.get(plan, :is_default, false)
      end)

    case default_plan do
      nil ->
        # If no default is set, return the first plan
        case Enum.to_list(plans) do
          [] -> nil
          [first | _] -> first
        end

      plan ->
        plan
    end
  end

  @doc """
  Returns the name of the default plan.
  """
  @spec get_default_name() :: String.t() | nil
  def get_default_name do
    case get_default() do
      {name, _plan} -> name
      nil -> nil
    end
  end

  @doc """
  Checks if a plan name exists in the configuration.
  """
  @spec exists?(String.t() | nil) :: boolean()
  def exists?(nil), do: false

  def exists?(plan_name) when is_binary(plan_name) do
    Map.has_key?(all(), plan_name)
  end

  def exists?(_), do: false

  @doc """
  Calculates the expiration date for a plan based on its default duration.
  Returns nil if the plan doesn't exist or has no duration configured.
  """
  @spec calculate_expiration(String.t(), Date.t()) :: Date.t() | nil
  def calculate_expiration(plan_name, from_date \\ Date.utc_today()) do
    case get(plan_name) do
      nil ->
        nil

      plan ->
        duration = Map.get(plan, :default_duration)
        add_duration(from_date, duration)
    end
  end

  @doc """
  Returns the next plan name for a given plan.
  """
  @spec get_next_plan_name(String.t()) :: String.t() | nil
  def get_next_plan_name(plan_name) do
    case get(plan_name) do
      nil -> nil
      plan -> Map.get(plan, :default_next_plan)
    end
  end

  # Private helper to add duration to a date
  defp add_duration(date, nil), do: date

  defp add_duration(date, duration) when is_list(duration) do
    months = Keyword.get(duration, :months, 0)
    days = Keyword.get(duration, :days, 0)

    date
    |> Date.shift(month: months)
    |> Date.add(days)
  end

  defp add_duration(date, _), do: date
end
