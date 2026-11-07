defmodule Lotta.Observability do
  @moduledoc """
  Attaches request/job context to logs, traces and Sentry in one place,
  and adds the active trace context to every log event.

  * `put_context/1` sets tenant and user information as Logger metadata,
    attributes on the current span and Sentry context. Only IDs (and the
    tenant slug/prefix) are recorded, never personal data like names or
    email addresses.
  * `add_trace_context/2` is a `:logger` primary filter adding `trace_id`
    and `span_id` of the currently active span to every log event, so logs
    can be correlated with their trace.
  * `attach/0` installs the filter and telemetry handlers that set the
    context for GraphQL operations (HTTP and websocket) and Oban jobs.
  """
  require Logger

  alias Lotta.Accounts.User
  alias Lotta.Tenants
  alias Lotta.Tenants.Tenant

  @filter_id :otel_trace_context
  @absinthe_handler_id "lotta-observability-absinthe"
  @oban_handler_id "lotta-observability-oban"

  @type context_opt() :: {:tenant, Tenant.t() | nil} | {:user, User.t() | nil}

  @doc """
  Install the log filter and telemetry handlers.

  Must be called after the OpenTelemetry instrumentation libraries have been
  set up, so that the span they start for a GraphQL operation or Oban job
  is the current span when our handlers set attributes on it.
  """
  @spec attach() :: :ok
  def attach do
    :logger.remove_primary_filter(@filter_id)
    :ok = :logger.add_primary_filter(@filter_id, {&__MODULE__.add_trace_context/2, []})

    :telemetry.detach(@absinthe_handler_id)

    :ok =
      :telemetry.attach(
        @absinthe_handler_id,
        [:absinthe, :execute, :operation, :start],
        &__MODULE__.handle_absinthe_operation_start/4,
        nil
      )

    :telemetry.detach(@oban_handler_id)

    :ok =
      :telemetry.attach(
        @oban_handler_id,
        [:oban, :job, :start],
        &__MODULE__.handle_oban_job_start/4,
        nil
      )
  end

  @doc """
  Put tenant and/or user context on logs, the current span and Sentry.

  `nil` values are ignored.
  """
  @spec put_context([context_opt()]) :: :ok
  def put_context(opts) when is_list(opts) do
    Enum.each(opts, fn
      {:tenant, %Tenant{} = tenant} -> put_tenant(tenant)
      {:user, %User{} = user} -> put_user(user)
      _ -> :ok
    end)
  end

  defp put_tenant(%Tenant{} = tenant) do
    Logger.metadata(
      tenant_id: tenant.id,
      tenant_slug: tenant.slug,
      tenant_prefix: tenant.prefix
    )

    OpenTelemetry.Tracer.set_attributes(%{
      "tenant.id" => tenant.id,
      "tenant.slug" => tenant.slug,
      "tenant.prefix" => tenant.prefix
    })

    Sentry.Context.set_tags_context(%{
      "tenant.id" => tenant.id,
      "tenant.slug" => tenant.slug,
      "tenant.prefix" => tenant.prefix
    })

    :ok
  end

  defp put_user(%User{id: user_id} = user) do
    Logger.metadata(user_id: user_id)

    OpenTelemetry.Tracer.set_attributes(%{
      # OpenTelemetry semantic convention
      "enduser.id" => user_id,
      # kept for existing queries and dashboards
      "user.id" => user_id
    })

    Sentry.Context.set_user_context(
      %{id: user_id}
      |> maybe_put(:is_admin, Map.get(user, :is_admin?))
    )

    :ok
  end

  defp maybe_put(map, _key, nil), do: map
  defp maybe_put(map, key, value), do: Map.put(map, key, value)

  @doc """
  `:logger` primary filter adding `trace_id` and `span_id` (lowercase hex,
  as used by Tempo) of the currently active span to the log event metadata.

  Primary filters run in the process that logs, so the OpenTelemetry context
  of that process is available here.
  """
  @spec add_trace_context(:logger.log_event(), term()) :: :logger.filter_return()
  def add_trace_context(%{meta: meta} = log_event, _extra) do
    with false <- Map.has_key?(meta, :trace_id),
         span_ctx when span_ctx != :undefined <- OpenTelemetry.Tracer.current_span_ctx(),
         true <- :otel_span.is_valid(span_ctx) do
      %{
        log_event
        | meta:
            Map.merge(meta, %{
              trace_id: :otel_span.hex_trace_id(span_ctx),
              span_id: :otel_span.hex_span_id(span_ctx)
            })
      }
    else
      _ -> log_event
    end
  rescue
    # A crashing filter would be removed by :logger, so never let it fail
    _ -> log_event
  end

  def add_trace_context(log_event, _extra), do: log_event

  @doc false
  def handle_absinthe_operation_start(_event, _measurements, metadata, _config) do
    with %{options: options} when is_list(options) <- metadata,
         context when is_map(context) <- Keyword.get(options, :context) do
      put_context(
        tenant: Map.get(context, :tenant),
        user: Map.get(context, :current_user)
      )
    end

    :ok
  rescue
    # A crashing handler would be detached by :telemetry
    e ->
      Logger.warning("Could not set observability context for GraphQL operation: #{inspect(e)}")
      :ok
  end

  @doc false
  def handle_oban_job_start(_event, _measurements, %{job: %Oban.Job{} = job}, _config) do
    put_context(tenant: tenant_for_job(job))

    case job.args do
      %{"user_id" => user_id} when not is_nil(user_id) ->
        Logger.metadata(user_id: user_id)

        OpenTelemetry.Tracer.set_attributes(%{
          "enduser.id" => user_id,
          "user.id" => user_id
        })

      _ ->
        :ok
    end

    :ok
  rescue
    e ->
      Logger.warning("Could not set observability context for Oban job: #{inspect(e)}")
      :ok
  end

  def handle_oban_job_start(_event, _measurements, _metadata, _config), do: :ok

  defp tenant_for_job(%Oban.Job{args: %{"tenant_id" => tenant_id}}) when not is_nil(tenant_id),
    do: Tenants.get_tenant(tenant_id)

  defp tenant_for_job(%Oban.Job{worker: "Lotta.Worker.Tenant", args: %{"id" => tenant_id}})
       when not is_nil(tenant_id),
       do: Tenants.get_tenant(tenant_id)

  defp tenant_for_job(%Oban.Job{args: %{"prefix" => prefix}}) when is_binary(prefix),
    do: Tenants.get_tenant_by_prefix(prefix)

  defp tenant_for_job(_job), do: nil
end
