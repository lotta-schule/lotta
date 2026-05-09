defmodule CockpitWeb.TenantComponents do
  @moduledoc """
  Core components for tenant management.
  """

  use Phoenix.Component
  use Gettext, backend: LottaWeb.Gettext

  require Logger

  def monthly_usage_logs_list(assigns) do
    ~H"""
    <Backpex.HTML.Layout.main_container>
      <table class="table w-full">
        <thead>
          <tr>
            <th colspan="4">{gettext("monthly usage logs")}</th>
          </tr>
          <tr>
            <th>{gettext("year")}-{gettext("month")}</th>
            <th>{gettext("active users")}</th>
            <th>{gettext("total storage")}</th>
            <th>{gettext("media conversion")}</th>
          </tr>
        </thead>
        <tbody>
          <tr :for={usage <- @usages}>
            <td>{usage.year}-{usage.month}</td>
            <td>{usage.active_user_count[:value] |> round(0)}</td>
            <td>{usage.total_storage_count[:value] |> format_filesize()}</td>
            <td>{usage.media_conversion_seconds[:value] |> format_duration()}</td>
          </tr>
        </tbody>
      </table>
    </Backpex.HTML.Layout.main_container>
    """
  end

  defp format_duration(%Decimal{} = value) do
    value
    |> Decimal.round(0)
    |> Decimal.to_integer()
    |> Timex.Duration.from_seconds()
    |> Timex.format_duration(:humanized)
  rescue
    e ->
      Logger.error("Failed to format duration: #{inspect(e)}")
      nil
  end

  defp format_duration(nil), do: nil

  defp format_filesize(%Decimal{} = value),
    do:
      value
      |> Decimal.round(0)
      |> Decimal.to_integer()
      |> FileSize.from_bytes(:gb)
      |> FileSize.format()

  defp format_filesize(nil), do: nil

  defp round(%Decimal{} = value, precision), do: Decimal.round(value, precision)
  defp round(nil, _), do: nil
end
