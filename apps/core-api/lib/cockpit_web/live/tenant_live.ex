defmodule CockpitWeb.Live.TenantLive do
  use Backpex.LiveResource,
    adapter_config: [
      schema: Lotta.Tenants.Tenant,
      repo: Lotta.Repo,
      update_changeset: &__MODULE__.update_changeset/3,
      create_changeset: &__MODULE__.create_changeset/3
    ],
    layout: {CockpitWeb.Layouts, :admin}

  import Ecto.Query

  def update_changeset(tenant, params, _ \\ []),
    do:
      Lotta.Tenants.Tenant.update_by_admin_changeset(
        tenant,
        params
      )

  def create_changeset(_tenant, params, _ \\ []),
    do: Lotta.Tenants.Tenant.create_changeset(params)

  @impl Backpex.LiveResource
  def item_actions(default_actions) do
    default_actions
    |> Keyword.take([:index, :edit, :show])
    |> Keyword.merge(
      edit: %{module: Backpex.ItemActions.Edit, only: [:row]},
      delete: %{
        module: CockpitWeb.ItemActions.DeleteTenant,
        only: [:row]
      }
    )
  end

  @impl Backpex.LiveResource
  def singular_name, do: "Tenant"

  @impl Backpex.LiveResource
  def plural_name, do: "Tenants"

  @impl Backpex.LiveResource
  def can?(_, :new, _), do: false
  def can?(_, _, _), do: true

  @impl Backpex.LiveResource
  def fields do
    [
      title: %{
        module: Backpex.Fields.Text,
        label: "Title"
      },
      slug: %{
        module: Backpex.Fields.Text,
        label: "Slug",
        readonly: true
      },
      customer_no: %{
        module: Backpex.Fields.Text,
        label: "Customer Number"
      },
      address: %{
        module: Backpex.Fields.Textarea,
        label: "Address",
        except: [:index]
      },
      billing_address: %{
        module: Backpex.Fields.Textarea,
        label: "Billing Address",
        except: [:index]
      },
      contact_name: %{
        module: Backpex.Fields.Text,
        label: "Contact Name"
      },
      contact_email: %{
        module: Backpex.Fields.Email,
        label: "Contact Email",
        except: [:index]
      },
      contact_phone: %{
        module: Backpex.Fields.Text,
        label: "Contact Phone"
      },
      eduplaces_id: %{
        module: Backpex.Fields.Text,
        label: "Eduplaces ID",
        readonly: true,
        except: [:index]
      },
      current_plan_name: %{
        module: Backpex.Fields.Select,
        label: "Current Plan Name",
        options:
          Lotta.Billings.Plans.all()
          |> Enum.map(fn {key, plan} ->
            {"#{plan.title} (#{key})", key}
          end)
      },
      invoices: %{
        module: Backpex.Fields.HasMany,
        label: "Invoices",
        display_field: :invoice_number,
        live_resource: CockpitWeb.Live.InvoiceLive,
        options_query: fn query, _field ->
          from(i in query,
            where: not is_nil(i.issued_at),
            order_by: [desc: i.issued_at]
          )
        end,
        query_limit: 12,
        only: [:show]
      }
    ]
  end

  def render_resource_slot(assigns, :show, :after_main) do
    ~H"""
    <.list_monthly_usage_logs tenant={@item} />
    """
  end

  defp list_monthly_usage_logs(%{tenant: tenant} = assigns) do
    assigns = fetch_current_tenant_usage(assigns, tenant)

    ~H"""
    <Backpex.HTML.Layout.main_container>
      <table class="table">
        <thead>
          <tr>
            <th colspan="4">Monthly Usage Logs</th>
          </tr>
          <tr>
            <th>Year-Month</th>
            <th>active users</th>
            <th>total storage (bytes)</th>
            <th>media conversion (minutes)</th>
          </tr>
        </thead>
        <tbody>
          <tr :for={usage <- @usages}>
            <td>{usage.year}-{usage.month}</td>
            <td>{usage.active_user_count[:value] |> round(0)}</td>
            <td>{usage.total_storage_count[:value] |> round(3)}</td>
            <td>{usage.media_conversion_seconds[:value] |> round(1)}</td>
          </tr>
        </tbody>
      </table>
    </Backpex.HTML.Layout.main_container>
    """
  end

  defp fetch_current_tenant_usage(assigns, tenant) do
    case Lotta.Tenants.Usage.get_usage(tenant) do
      {:ok, usages} -> assign(assigns, :usages, usages)
      _ -> assign(assigns, :usages, [])
    end
  end

  defp round(%Decimal{} = value, precision), do: Decimal.round(value, precision)
  defp round(nil, _), do: nil
end
