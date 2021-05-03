defmodule Api.System.Usage do
  @moduledoc """
  This module bundles all the necessery
  functions for usage calculation
  """

  require Logger

  import Ecto.Query

  alias Api.Repo
  alias Api.Storage.{File, FileConversion}

  @doc """
  Return the usage statistics
  """
  def get_usage() do
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

        with {:ok, storage_usage} <- get_storage_usage(),
             {:ok, media_usage} <- get_media_usage(period_start, period_end) do
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

    {:ok, usages}
  end

  defp get_storage_usage() do
    all_files_size =
      from f in File,
        select: %{all_files_size: sum(f.filesize), files_total: count(f.id)}

    file_conversions =
      from f in FileConversion,
        select: %{all_conversions_size: sum(f.filesize)}

    with %{files_total: files_total, all_files_size: files_size} <- Repo.one(all_files_size),
         %{all_conversions_size: conversions_size} <- Repo.one(file_conversions) do
      {:ok,
       %{
         used_total: (files_size || 0) + (conversions_size || 0),
         files_total: files_total
       }}
    else
      _ ->
        {:error, "Could not find usage information"}
    end
  end

  defp get_media_usage(start_date, end_date) do
    media_total =
      from(f in File,
        where: not is_nil(f.media_duration),
        select: %{
          media_files_total: count(f.id),
          media_files_total_duration: sum(f.media_duration)
        }
      )

    current_period_conversions =
      from(f in File,
        where: f.inserted_at >= ^start_date and f.inserted_at <= ^end_date,
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
