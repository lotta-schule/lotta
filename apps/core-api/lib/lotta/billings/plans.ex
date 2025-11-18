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

    default_plan =
      Enum.find(plans, fn {_name, plan} ->
        Map.get(plan, :is_default, false)
      end)

    with plan when not is_nil(plan) <- default_plan, do: plan
  end

  @doc """
  Returns the name of the default plan.
  """
  @spec get_default_name() :: String.t() | nil
  def get_default_name do
    with {name, _plan} <- get_default(), do: name
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
        from_date
        |> Date.shift(Map.get(plan, :default_duration, month: 1))
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
end
