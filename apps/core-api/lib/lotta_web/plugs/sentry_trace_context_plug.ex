defmodule LottaWeb.Plugs.SentryTraceContextPlug do
  @moduledoc """
  Adds OpenTelemetry trace context to Sentry events for distributed tracing correlation.
  """
  require OpenTelemetry.Tracer

  def init(opts), do: opts

  def call(conn, _opts) do
    case :otel_tracer.current_span_ctx() do
      :undefined ->
        conn

      span_ctx ->
        trace_id = :otel_span.trace_id(span_ctx)
        span_id = :otel_span.span_id(span_ctx)

        Sentry.Context.set_tags_context(%{
          trace_id: format_trace_id(trace_id),
          span_id: format_span_id(span_id)
        })

        conn
    end
  end

  defp format_trace_id(trace_id) when is_integer(trace_id) do
    trace_id
    |> Integer.to_string(16)
    |> String.downcase()
    |> String.pad_leading(32, "0")
  end

  defp format_span_id(span_id) when is_integer(span_id) do
    span_id
    |> Integer.to_string(16)
    |> String.downcase()
    |> String.pad_leading(16, "0")
  end
end
