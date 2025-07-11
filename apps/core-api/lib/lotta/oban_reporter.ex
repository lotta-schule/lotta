defmodule Lotta.ObanReporter do
  @moduledoc """
  A module to report Oban job errors to Sentry.
  """
  def attach do
    :telemetry.attach("oban-errors", [:oban, :job, :exception], &__MODULE__.handle_event/4, [])
  end

  def handle_event([:oban, :job, :exception], _measure, _meta, _) do
    # TODO: LAter
    #
    # extra =
    #   meta.job
    #   |> Map.take([:id, :args, :meta, :queue, :worker])
    #   |> Map.merge(measure)

    # Sentry.capture_exception(meta.reason, stacktrace: meta.stacktrace, extra: extra)
  end
end
