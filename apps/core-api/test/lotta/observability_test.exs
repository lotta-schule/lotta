defmodule Lotta.ObservabilityTest do
  @moduledoc false

  use Lotta.DataCase, async: false

  require OpenTelemetry.Tracer

  alias Lotta.Accounts.User
  alias Lotta.{Observability, Tenants}
  alias Lotta.Tenants.Tenant

  @prefix "tenant_test"

  setup do
    Logger.reset_metadata()
    on_exit(fn -> Logger.reset_metadata() end)
    :ok
  end

  defp log_event(meta \\ %{}),
    do: %{level: :info, msg: {:string, "test"}, meta: meta}

  describe "add_trace_context/2" do
    test "adds trace_id and span_id of the active span" do
      OpenTelemetry.Tracer.with_span "test-span" do
        span_ctx = OpenTelemetry.Tracer.current_span_ctx()

        %{meta: meta} = Observability.add_trace_context(log_event(), [])

        assert meta.trace_id == :otel_span.hex_trace_id(span_ctx)
        assert meta.span_id == :otel_span.hex_span_id(span_ctx)
        assert meta.trace_id =~ ~r/\A[0-9a-f]{32}\z/
        assert meta.span_id =~ ~r/\A[0-9a-f]{16}\z/
      end
    end

    test "uses the innermost active span" do
      OpenTelemetry.Tracer.with_span "outer" do
        OpenTelemetry.Tracer.with_span "inner" do
          inner = OpenTelemetry.Tracer.current_span_ctx()
          %{meta: meta} = Observability.add_trace_context(log_event(), [])
          assert meta.span_id == :otel_span.hex_span_id(inner)
        end
      end
    end

    test "leaves the event untouched without an active span" do
      event = log_event(%{foo: :bar})
      assert Observability.add_trace_context(event, []) == event
    end

    test "does not overwrite an explicitly set trace_id" do
      OpenTelemetry.Tracer.with_span "test-span" do
        event = log_event(%{trace_id: "explicit"})
        assert %{meta: %{trace_id: "explicit"}} = Observability.add_trace_context(event, [])
      end
    end

    test "is installed as a primary logger filter" do
      %{filters: filters} = :logger.get_primary_config()
      assert Keyword.has_key?(filters, :otel_trace_context)
    end
  end

  describe "put_context/1" do
    test "sets tenant and user metadata, ignoring personal data" do
      tenant = %Tenant{id: 42, slug: "school", prefix: "tenant_42"}
      user = %User{id: 7, name: "Jane Doe", email: "jane@example.com"}

      assert :ok = Observability.put_context(tenant: tenant, user: user)

      metadata = Logger.metadata()
      assert metadata[:tenant_id] == 42
      assert metadata[:tenant_slug] == "school"
      assert metadata[:tenant_prefix] == "tenant_42"
      assert metadata[:user_id] == 7

      sentry_context = Sentry.Context.get_all()
      assert sentry_context.user.id == 7
      refute Map.has_key?(sentry_context.user, :email)
      refute Map.has_key?(sentry_context.user, :name)
      assert sentry_context.tags["tenant.id"] == 42
    end

    test "ignores nil values" do
      assert :ok = Observability.put_context(tenant: nil, user: nil)
      assert Logger.metadata() == []
    end
  end

  describe "handle_absinthe_operation_start/4" do
    test "puts context from the Absinthe context option" do
      tenant = %Tenant{id: 1, slug: "a", prefix: "tenant_1"}
      user = %User{id: 2}

      Observability.handle_absinthe_operation_start(
        [:absinthe, :execute, :operation, :start],
        %{},
        %{options: [context: %{tenant: tenant, current_user: user}]},
        nil
      )

      assert Logger.metadata()[:tenant_id] == 1
      assert Logger.metadata()[:user_id] == 2
    end

    test "copes with missing context" do
      assert :ok =
               Observability.handle_absinthe_operation_start(
                 [:absinthe, :execute, :operation, :start],
                 %{},
                 %{options: []},
                 nil
               )

      assert Logger.metadata() == []
    end
  end

  describe "handle_oban_job_start/4" do
    test "resolves the tenant from the job's prefix" do
      tenant = Tenants.get_tenant_by_prefix(@prefix)

      Observability.handle_oban_job_start(
        [:oban, :job, :start],
        %{},
        %{job: %Oban.Job{worker: "Lotta.Worker.Conversion", args: %{"prefix" => @prefix}}},
        nil
      )

      assert Logger.metadata()[:tenant_id] == tenant.id
      assert Logger.metadata()[:tenant_prefix] == @prefix
    end

    test "resolves the tenant from the tenant worker's id" do
      tenant = Tenants.get_tenant_by_prefix(@prefix)

      Observability.handle_oban_job_start(
        [:oban, :job, :start],
        %{},
        %{job: %Oban.Job{worker: "Lotta.Worker.Tenant", args: %{"id" => tenant.id}}},
        nil
      )

      assert Logger.metadata()[:tenant_id] == tenant.id
    end

    test "sets user_id from job args" do
      Observability.handle_oban_job_start(
        [:oban, :job, :start],
        %{},
        %{job: %Oban.Job{worker: "Some.Worker", args: %{"user_id" => 5}}},
        nil
      )

      assert Logger.metadata()[:user_id] == 5
      refute Logger.metadata()[:tenant_id]
    end
  end
end
