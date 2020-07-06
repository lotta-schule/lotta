defmodule Api.Tenants.Usage do
  @moduledoc """
  This module bundles all the necessery
  functions for usage calculation
  """

  require Logger

  import Ecto.Query

  alias Api.Repo
  alias Api.Accounts.{File, FileConversion}
  alias Api.Tenants.Tenant

  @doc """
  Return the usage statistics for the tenant
  """
  def get_usage(tenant) do
    usages =
      0..5
      |> Enum.map(fn month ->
        period_start =
          Timex.now()
          |> Timex.shift(months: -month)
          |> Timex.beginning_of_month()
          |> Timex.to_naive_datetime()

        period_end =
          case month do
            0 ->
              Timex.now()

            _ ->
              period_start
              |> Timex.end_of_month()
              |> Timex.to_naive_datetime()
          end

        with {:ok, storage_usage} <- get_storage_usage(tenant),
             {:ok, media_usage} <- get_media_usage(tenant, period_start, period_end) do
          {:ok,
           %{
             period_start: period_start,
             period_end: period_end,
             storage: storage_usage,
             media: media_usage
           }}
        else
          {:error, reason} ->
            Logger.error("Could not fetch data for month now - #{month}: #{inspect(reason)}")
            nil
        end
      end)
      |> Enum.filter(&(!is_nil(&1)))
      |> Enum.map(&elem(&1, 1))
      |> Enum.filter(fn %{period_start: start_date} ->
        NaiveDateTime.compare(start_date, tenant.inserted_at) == :gt
      end)

    {:ok, usages}
  end

  defp get_storage_usage(%Tenant{id: tenant_id}) do
    tenant_file_ids =
      from f in File,
        select: [:id],
        where: f.tenant_id == ^tenant_id

    all_files_size =
      from f in File,
        select: %{all_files_size: sum(f.filesize), files_total: count(f.id)},
        where: f.tenant_id == ^tenant_id

    file_conversions =
      from f in FileConversion,
        select: %{all_conversions_size: sum(f.filesize)},
        where: f.file_id in subquery(tenant_file_ids)

    with %{files_total: files_total, all_files_size: files_size} <- Repo.one(all_files_size),
         %{all_conversions_size: conversions_size} <- Repo.one(file_conversions) do
      {:ok,
       %{
         used_total: files_size + conversions_size,
         files_total: files_total
       }}
    else
      _ ->
        {:error, "Could not find usage information"}
    end
  end

  defp get_media_usage(%Tenant{id: tenant_id}, start_date, end_date) do
    media_total =
      from(f in File,
        # join: fc in FileConversion, on: fc.file_id == f.id,
        where: f.tenant_id == ^tenant_id and not is_nil(f.media_duration),
        select: %{
          media_files_total: count(f.id),
          media_files_total_duration: sum(f.media_duration)
        }
      )

    current_period_conversions =
      from(f in File,
        where:
          f.tenant_id == ^tenant_id and f.inserted_at >= ^start_date and
            f.inserted_at <= ^end_date,
        select: %{
          media_conversion_current_period: sum(f.media_duration)
        }
      )

    with media_total when not is_nil(media_total) <- Repo.one(media_total),
         current_period_conversions when not is_nil(current_period_conversions) <-
           Repo.one(current_period_conversions) do
      {:ok, Map.merge(media_total, current_period_conversions)}
    else
      nil ->
        {:error, "Could not find usage information"}
    end
  end
end
