defmodule Lotta.Billings do
  @moduledoc """
  Context for managing billing-related operations, including additional items and invoices.
  """

  import Ecto.Query

  alias Lotta.Repo
  alias Lotta.Billings.{AdditionalItem, Invoice, Plans}
  alias Lotta.Tenants.{Tenant, Usage}

  @doc """
  Adds a new additional billable item to a tenant.

  If `valid_from` is not provided in attrs, it defaults to today.

  ## Examples

      iex> add_additional_item(tenant, %{name: "Email Service", price: "15.99"})
      {:ok, %AdditionalItem{}}

      iex> add_additional_item(tenant, %{name: "", price: "15.99"})
      {:error, %Ecto.Changeset{}}
  """
  @spec add_additional_item(Tenant.t(), map()) ::
          {:ok, AdditionalItem.t()} | {:error, Ecto.Changeset.t()}
  def add_additional_item(tenant, attrs) do
    attrs =
      attrs
      |> Map.put(:tenant_id, tenant.id)
      |> maybe_set_default_valid_from()

    %AdditionalItem{}
    |> AdditionalItem.changeset(attrs)
    |> Repo.insert(prefix: "public")
  end

  @doc """
  Removes an additional item permanently.

  This is a hard delete and will remove all historical data.
  For ending a subscription, consider using `cancel_additional_item/2` instead.

  ## Examples

      iex> remove_additional_item(item)
      {:ok, %AdditionalItem{}}

      iex> remove_additional_item(item)
      {:error, %Ecto.Changeset{}}
  """
  @spec remove_additional_item(AdditionalItem.t()) ::
          {:ok, AdditionalItem.t()} | {:error, Ecto.Changeset.t()}
  def remove_additional_item(additional_item) do
    Repo.delete(additional_item, prefix: "public")
  end

  @doc """
  Cancels an additional item by setting its end date.

  This is a soft delete that preserves historical billing data.
  Defaults to setting `valid_until` to today.

  ## Examples

      iex> cancel_additional_item(item)
      {:ok, %AdditionalItem{valid_until: ~D[2025-11-18]}}

      iex> cancel_additional_item(item, ~D[2025-12-31])
      {:ok, %AdditionalItem{valid_until: ~D[2025-12-31]}}
  """
  @spec cancel_additional_item(AdditionalItem.t(), Date.t()) ::
          {:ok, AdditionalItem.t()} | {:error, Ecto.Changeset.t()}
  def cancel_additional_item(additional_item, valid_until \\ Date.utc_today()) do
    additional_item
    |> AdditionalItem.changeset(%{valid_until: valid_until})
    |> Repo.update(prefix: "public")
  end

  @doc """
  Lists all additional items for a tenant, including cancelled ones.

  ## Examples

      iex> list_additional_items(tenant)
      [%AdditionalItem{}, ...]
  """
  @spec list_additional_items(Tenant.t()) :: [AdditionalItem.t()]
  def list_additional_items(tenant) do
    from(ai in AdditionalItem,
      where: ai.tenant_id == ^tenant.id,
      order_by: [desc: ai.inserted_at]
    )
    |> Repo.all(prefix: "public")
  end

  @doc """
  Lists only the additional items that are active on a specific date.

  An item is considered active if:
  - Its `valid_from` is nil or on/before the specified date
  - Its `valid_until` is nil or on/after the specified date

  ## Examples

      iex> list_active_additional_items(tenant)
      [%AdditionalItem{}, ...]

      iex> list_active_additional_items(tenant, ~D[2025-12-31])
      [%AdditionalItem{}, ...]
  """
  @spec list_active_additional_items(Tenant.t(), Date.t()) :: [AdditionalItem.t()]
  def list_active_additional_items(tenant, on_date \\ Date.utc_today()) do
    from(ai in AdditionalItem,
      where: ai.tenant_id == ^tenant.id,
      where: is_nil(ai.valid_from) or ai.valid_from <= ^on_date,
      where: is_nil(ai.valid_until) or ai.valid_until >= ^on_date,
      order_by: [desc: ai.inserted_at]
    )
    |> Repo.all(prefix: "public")
  end

  @doc """
  Gets a single additional item by ID.

  Returns nil if the item does not exist.

  ## Examples

      iex> get_additional_item(123)
      %AdditionalItem{}

      iex> get_additional_item(456)
      nil
  """
  @spec get_additional_item(pos_integer()) :: AdditionalItem.t() | nil
  def get_additional_item(id) do
    Repo.get(AdditionalItem, id, prefix: "public")
  end

  @doc """
  Gets a single additional item by ID.

  Raises `Ecto.NoResultsError` if the item does not exist.

  ## Examples

      iex> get_additional_item!(123)
      %AdditionalItem{}

      iex> get_additional_item!(456)
      ** (Ecto.NoResultsError)
  """
  @spec get_additional_item!(pos_integer()) :: AdditionalItem.t()
  def get_additional_item!(id) do
    Repo.get!(AdditionalItem, id, prefix: "public")
  end

  @doc """
  Checks if an additional item is active on a specific date.

  ## Examples

      iex> active?(item)
      true

      iex> active?(item, ~D[2025-12-31])
      false
  """
  @spec active?(AdditionalItem.t(), Date.t()) :: boolean()
  def active?(additional_item, on_date \\ Date.utc_today()) do
    valid_from_ok =
      is_nil(additional_item.valid_from) or
        Date.compare(additional_item.valid_from, on_date) in [:lt, :eq]

    valid_until_ok =
      is_nil(additional_item.valid_until) or
        Date.compare(additional_item.valid_until, on_date) in [:gt, :eq]

    valid_from_ok and valid_until_ok
  end

  @doc """
  Calculates the total monthly cost of all active additional items for a tenant.

  Returns a Decimal representing the sum of all active item prices.

  ## Examples

      iex> calculate_total_additional_cost(tenant)
      #Decimal<31.98>

      iex> calculate_total_additional_cost(tenant, ~D[2025-12-31])
      #Decimal<15.99>
  """
  @spec calculate_total_additional_cost(Tenant.t(), Date.t()) :: Decimal.t()
  def calculate_total_additional_cost(tenant, on_date \\ Date.utc_today()) do
    from(ai in AdditionalItem,
      where: ai.tenant_id == ^tenant.id,
      where: is_nil(ai.valid_from) or ai.valid_from <= ^on_date,
      where: is_nil(ai.valid_until) or ai.valid_until >= ^on_date,
      select: sum(ai.price)
    )
    |> Repo.one(prefix: "public")
    |> case do
      nil -> Decimal.new(0)
      sum -> sum
    end
  end

  # Private helper to set valid_from to today if not provided
  defp maybe_set_default_valid_from(attrs) do
    if Map.has_key?(attrs, :valid_from) and not is_nil(attrs[:valid_from]) do
      attrs
    else
      Map.put(attrs, :valid_from, Date.utc_today())
    end
  end

  # ==================== INVOICE MANAGEMENT ====================

  @doc """
  Generates a draft invoice for a tenant for the specified period.

  Calculates line items from:
  - Base plan (if tenant has one)
  - Active additional items during the period

  Auto-generates a unique invoice number.

  ## Examples

      iex> generate_invoice(tenant, 2025, 11)
      {:ok, %Invoice{}}

      iex> generate_invoice(tenant, 2025, 13)
      {:error, %Ecto.Changeset{}}
  """
  @spec generate_invoice(
          Tenant.t(),
          year :: pos_integer(),
          month :: pos_integer(),
          opts :: keyword()
        ) ::
          {:ok, Invoice.t()} | {:error, Ecto.Changeset.t()}
  def generate_invoice(tenant, year, month, _opts \\ []) do
    # Validate month before trying to create date
    if month < 1 or month > 12 do
      changeset =
        %Invoice{}
        |> Ecto.Changeset.change(%{month: month})
        |> Ecto.Changeset.add_error(:month, "must be less than or equal to 12")

      {:error, changeset}
    else
      do_generate_invoice(tenant, year, month)
    end
  end

  defp do_generate_invoice(tenant, year, month) do
    period_start = Date.new!(year, month, 1)
    period_end = Date.end_of_month(period_start)

    {items, total} = calculate_period_charges(tenant, period_start, period_end)

    # Items are already in the correct InvoiceItem format from helpers
    attrs = %{
      invoice_number: generate_invoice_number(),
      tenant_id: tenant.id,
      year: year,
      month: month,
      period_start: period_start,
      period_end: period_end,
      items: items,
      total: total,
      status: :draft
    }

    Invoice.create_changeset(attrs)
    |> Repo.insert(prefix: "public")
  end

  @doc """
  Issues a draft invoice, changing its status to :issued.

  Sets:
  - issued_at to now
  - due_date to issued_at + 14 days

  ## Examples

      iex> issue_invoice(draft_invoice)
      {:ok, %Invoice{status: :issued}}

      iex> issue_invoice(already_issued_invoice)
      {:error, %Ecto.Changeset{}}
  """
  @spec issue_invoice(Invoice.t()) :: {:ok, Invoice.t()} | {:error, Ecto.Changeset.t()}
  def issue_invoice(%Invoice{status: :draft} = invoice) do
    issued_at = DateTime.utc_now()
    due_date = Date.add(DateTime.to_date(issued_at), 14)

    invoice
    |> Invoice.update_changeset(%{
      status: :issued,
      issued_at: issued_at,
      due_date: due_date
    })
    |> Repo.update(prefix: "public")
  end

  def issue_invoice(%Invoice{} = invoice) do
    {:error,
     invoice
     |> Ecto.Changeset.change()
     |> Ecto.Changeset.add_error(:status, "can only issue draft invoices")}
  end

  @doc """
  Generates and immediately issues an invoice for a tenant.

  Convenience function that combines generate_invoice/3 and issue_invoice/1.

  ## Examples

      iex> generate_and_issue_invoice(tenant, 2025, 11)
      {:ok, %Invoice{status: :issued}}
  """
  @spec generate_and_issue_invoice(Tenant.t(), pos_integer(), pos_integer()) ::
          {:ok, Invoice.t()} | {:error, Ecto.Changeset.t()}
  def generate_and_issue_invoice(tenant, year, month) do
    with {:ok, invoice} <- generate_invoice(tenant, year, month) do
      issue_invoice(invoice)
    end
  end

  @doc """
  Marks an invoice as paid.

  Sets paid_at and changes status to :paid.
  Only works for :issued or :overdue invoices.

  ## Examples

      iex> mark_as_paid(invoice)
      {:ok, %Invoice{status: :paid}}

      iex> mark_as_paid(draft_invoice)
      {:error, %Ecto.Changeset{}}
  """
  @spec mark_as_paid(Invoice.t(), DateTime.t()) ::
          {:ok, Invoice.t()} | {:error, Ecto.Changeset.t()}
  def mark_as_paid(invoice, paid_at \\ DateTime.utc_now())

  def mark_as_paid(%Invoice{status: status} = invoice, paid_at)
      when status in [:issued, :overdue] do
    invoice
    |> Invoice.update_changeset(%{
      status: :paid,
      paid_at: paid_at
    })
    |> Repo.update(prefix: "public")
  end

  def mark_as_paid(%Invoice{} = invoice, _paid_at) do
    {:error,
     invoice
     |> Ecto.Changeset.change()
     |> Ecto.Changeset.add_error(:status, "can only mark issued or overdue invoices as paid")}
  end

  @doc """
  Cancels an invoice.

  Sets status to :cancelled and optionally saves a reason in notes.
  Only works for :draft or :issued invoices.

  ## Examples

      iex> cancel_invoice(invoice, "Duplicate invoice")
      {:ok, %Invoice{status: :cancelled}}

      iex> cancel_invoice(paid_invoice)
      {:error, %Ecto.Changeset{}}
  """
  @spec cancel_invoice(Invoice.t(), String.t() | nil) ::
          {:ok, Invoice.t()} | {:error, Ecto.Changeset.t()}
  def cancel_invoice(invoice, reason \\ nil)

  def cancel_invoice(%Invoice{status: status} = invoice, reason)
      when status in [:draft, :issued] do
    notes =
      if reason do
        existing = invoice.notes || ""
        cancelled_note = "Cancelled: #{reason}"

        if existing == "" do
          cancelled_note
        else
          "#{existing}\n#{cancelled_note}"
        end
      else
        invoice.notes
      end

    invoice
    |> Invoice.update_changeset(%{
      status: :cancelled,
      notes: notes
    })
    |> Repo.update(prefix: "public")
  end

  def cancel_invoice(%Invoice{} = invoice, _reason) do
    {:error,
     invoice
     |> Ecto.Changeset.change()
     |> Ecto.Changeset.add_error(:status, "can only cancel draft or issued invoices")}
  end

  @doc """
  Updates the notes field of an invoice.

  ## Examples

      iex> update_invoice_notes(invoice, "Payment pending")
      {:ok, %Invoice{}}
  """
  @spec update_invoice_notes(Invoice.t(), String.t() | nil) ::
          {:ok, Invoice.t()} | {:error, Ecto.Changeset.t()}
  def update_invoice_notes(invoice, notes) do
    invoice
    |> Invoice.update_changeset(%{notes: notes})
    |> Repo.update(prefix: "public")
  end

  @doc """
  Gets a single invoice by ID.

  ## Examples

      iex> get_invoice(123)
      %Invoice{}

      iex> get_invoice(456)
      nil
  """
  @spec get_invoice(pos_integer()) :: Invoice.t() | nil
  def get_invoice(id) do
    Repo.get(Invoice, id, prefix: "public")
  end

  @doc """
  Gets a single invoice by ID, raises if not found.

  ## Examples

      iex> get_invoice!(123)
      %Invoice{}

      iex> get_invoice!(456)
      ** (Ecto.NoResultsError)
  """
  @spec get_invoice!(pos_integer()) :: Invoice.t()
  def get_invoice!(id) do
    Repo.get!(Invoice, id, prefix: "public")
  end

  @doc """
  Gets an invoice by its invoice number.

  ## Examples

      iex> get_invoice_by_number("LTA00001")
      %Invoice{}

      iex> get_invoice_by_number("INVALID")
      nil
  """
  @spec get_invoice_by_number(String.t()) :: Invoice.t() | nil
  def get_invoice_by_number(invoice_number) do
    Repo.get_by(Invoice, [invoice_number: invoice_number], prefix: "public")
  end

  @doc """
  Lists all invoices for a tenant.

  ## Options

    * `:status` - Filter by status (:draft, :issued, :paid, :overdue, :cancelled)
    * `:year` - Filter by year
    * `:month` - Filter by month

  ## Examples

      iex> list_invoices(tenant)
      [%Invoice{}, ...]

      iex> list_invoices(tenant, status: :paid)
      [%Invoice{status: :paid}, ...]
  """
  @spec list_invoices(Tenant.t(), keyword()) :: [Invoice.t()]
  def list_invoices(tenant, opts \\ []) do
    query =
      from(i in Invoice,
        where: i.tenant_id == ^tenant.id,
        order_by: [desc: i.year, desc: i.month]
      )

    query = maybe_filter_by_status(query, opts[:status])
    query = maybe_filter_by_year(query, opts[:year])
    query = maybe_filter_by_month(query, opts[:month])

    Repo.all(query, prefix: "public")
  end

  @doc """
  Checks for overdue invoices and updates their status.

  Finds all :issued invoices where due_date < today and updates them to :overdue.

  Returns the list of invoices that were marked as overdue.

  ## Examples

      iex> check_overdue_invoices()
      [%Invoice{status: :overdue}, ...]
  """
  @spec check_overdue_invoices() :: [Invoice.t()]
  def check_overdue_invoices do
    today = Date.utc_today()

    overdue_invoices =
      from(i in Invoice,
        where: i.status == :issued,
        where: i.due_date < ^today
      )
      |> Repo.all(prefix: "public")

    Enum.map(overdue_invoices, fn invoice ->
      {:ok, updated} =
        invoice
        |> Invoice.update_changeset(%{status: :overdue})
        |> Repo.update(prefix: "public")

      updated
    end)
  end

  @doc """
  Calculates the total charges for a tenant for a specific period without creating an invoice.

  Returns a tuple of {items, total}.

  ## Examples

      iex> calculate_period_total(tenant, 2025, 11)
      {[%{type: "plan", ...}], #Decimal<15.99>}
  """
  @spec calculate_period_total(Tenant.t(), pos_integer(), pos_integer()) ::
          {[map()], Decimal.t()}
  def calculate_period_total(tenant, year, month) do
    period_start = Date.new!(year, month, 1)
    period_end = Date.end_of_month(period_start)

    calculate_period_charges(tenant, period_start, period_end)
  end

  defp get_monthly_usage(tenant, year, month) do
    usage = Usage.get_usage(tenant, year, month) || %{}

    %{
      active_user_count:
        (usage[:active_user_count][:value] || Decimal.new(0))
        |> Decimal.round(0)
        |> Decimal.to_integer(),
      total_storage_gb:
        (usage[:total_storage_count][:value] || Decimal.new(0))
        |> Decimal.round(3)
        |> Decimal.div(Decimal.new(1_073_741_824))
        |> Decimal.round(2),
      media_conversion_minutes:
        (usage[:media_conversion_seconds][:value] || Decimal.new(0))
        |> Decimal.div(Decimal.new(60))
        |> Decimal.round(2)
    }
  end

  # Private helper to calculate charges for a period
  defp calculate_period_charges(tenant, period_start, period_end) do
    items = []

    # Add plan item if tenant has a plan
    items =
      case get_plan_item(tenant, period_start) do
        nil -> items
        plan_item -> [plan_item | items]
      end

    # Add additional items
    additional_items = get_additional_items_for_period(tenant, period_start, period_end)
    items = items ++ additional_items

    # Calculate total
    total =
      items
      |> Enum.map(fn item -> Decimal.new(item[:amount] || item["amount"]) end)
      |> Enum.reduce(Decimal.new(0), &Decimal.add/2)

    {items, total}
  end

  # Build base price row (fixed monthly fee)
  defp build_base_price_row(base_price, plan_title) do
    %{
      "description" => "Base Plan: #{plan_title}",
      "quantity" => 1,
      "unit_price" => base_price,
      "amount" => base_price,
      "type" => "base_price",
      "metadata" => %{
        "base_price" => base_price
      }
    }
  end

  # Build base user charge row
  defp build_base_user_charge_row(active_users, unit_price) when is_integer(active_users) do
    if active_users > 0 do
      amount = Decimal.mult(Decimal.new(active_users), Decimal.new(unit_price))

      %{
        "description" => "Base Plan: #{active_users} active users",
        "quantity" => active_users,
        "unit_price" => unit_price,
        "amount" => Decimal.to_string(amount),
        "type" => "base_user_charge",
        "metadata" => %{
          "active_users" => active_users
        }
      }
    else
      %{
        "description" => "Base Plan: 0 active users",
        "quantity" => 0,
        "unit_price" => unit_price,
        "amount" => "0.00",
        "type" => "base_user_charge",
        "metadata" => %{
          "active_users" => 0
        }
      }
    end
  end

  # Build storage usage row (always included, shows usage vs limit)
  defp build_storage_usage_row(storage_used_gb, storage_included_gb, exceeding_price) do
    storage_overage_gb =
      Decimal.max(Decimal.new(0), Decimal.sub(storage_used_gb, storage_included_gb))

    amount = Decimal.mult(storage_overage_gb, Decimal.new(exceeding_price))

    # Format with 2 decimal places
    storage_used_str = storage_used_gb |> Decimal.round(2) |> Decimal.to_string(:normal)
    storage_included_str = storage_included_gb |> Decimal.round(2) |> Decimal.to_string(:normal)
    storage_overage_str = storage_overage_gb |> Decimal.round(2) |> Decimal.to_string(:normal)

    description =
      if Decimal.compare(storage_overage_gb, Decimal.new(0)) == :gt do
        "Storage: #{storage_used_str}/#{storage_included_str} GB used. #{storage_overage_str} GB over limit."
      else
        "Storage: #{storage_used_str}/#{storage_included_str} GB used"
      end

    %{
      "description" => description,
      "quantity" => Decimal.to_float(storage_overage_gb),
      "unit_price" => exceeding_price,
      "amount" => amount |> Decimal.round(2) |> Decimal.to_string(:normal),
      "type" => "storage_usage",
      "metadata" => %{
        "storage_used_gb" => Decimal.to_float(storage_used_gb),
        "storage_included_gb" => Decimal.to_float(storage_included_gb),
        "storage_overage_gb" => Decimal.to_float(storage_overage_gb)
      }
    }
  end

  # Build media conversion usage row (always included, shows usage vs limit)
  defp build_conversion_usage_row(
         conversion_used_minutes,
         conversion_included_minutes,
         exceeding_price
       ) do
    conversion_overage_minutes =
      Decimal.max(
        Decimal.new(0),
        Decimal.sub(conversion_used_minutes, Decimal.new(conversion_included_minutes))
      )

    amount = Decimal.mult(conversion_overage_minutes, Decimal.new(exceeding_price))

    # Format with 2 decimal places
    conversion_used_str =
      conversion_used_minutes |> Decimal.round(2) |> Decimal.to_string(:normal)

    conversion_overage_str =
      conversion_overage_minutes |> Decimal.round(2) |> Decimal.to_string(:normal)

    description =
      if Decimal.compare(conversion_overage_minutes, Decimal.new(0)) == :gt do
        "Media conversion: #{conversion_used_str}/#{conversion_included_minutes} min used. #{conversion_overage_str} minutes over limit."
      else
        "Media conversion: #{conversion_used_str}/#{conversion_included_minutes} min used"
      end

    %{
      "description" => description,
      "quantity" => Decimal.to_float(conversion_overage_minutes),
      "unit_price" => exceeding_price,
      "amount" => amount |> Decimal.round(2) |> Decimal.to_string(:normal),
      "type" => "media_conversion_usage",
      "metadata" => %{
        "conversion_used_minutes" => Decimal.to_float(conversion_used_minutes),
        "conversion_included_minutes" => conversion_included_minutes,
        "conversion_overage_minutes" => Decimal.to_float(conversion_overage_minutes)
      }
    }
  end

  defp get_active_plan_for_period(%Tenant{current_plan_name: nil}, _), do: nil

  defp get_active_plan_for_period(
         %Tenant{
           current_plan_name: plan_name,
           current_plan_expires_at: nil
         },
         _
       ),
       do: Plans.get(plan_name)

  defp get_active_plan_for_period(
         %Tenant{current_plan_name: plan_name, current_plan_expires_at: plan_expires_at},
         period_start
       ) do
    if Date.compare(plan_expires_at, period_start) != :lt, do: Plans.get(plan_name)
  end

  defp get_plan_item(tenant, period_start) do
    with plan when not is_nil(plan) <- get_active_plan_for_period(tenant, period_start) do
      usage = get_monthly_usage(tenant, period_start.year, period_start.month)

      base_price = Map.get(plan, :base_price)
      active_user_price = Map.get(plan, :active_user_price, "0.00")
      user_max_storage = Map.get(plan, :user_max_storage, 0)
      media_conversion_minutes = Map.get(plan, :media_conversion_minutes, 0)
      exceeding_storage_price = Map.get(plan, :exceeding_storage_price, "0.00")
      exceeding_conversion_price = Map.get(plan, :exceeding_conversion_price, "0.00")

      storage_included_gb =
        Decimal.mult(Decimal.new(usage.active_user_count), Decimal.new(user_max_storage))

      # Build rows - include base_price row if configured
      rows =
        [
          if(base_price, do: build_base_price_row(base_price, plan.title)),
          build_base_user_charge_row(usage.active_user_count, active_user_price),
          build_storage_usage_row(
            usage.total_storage_gb,
            storage_included_gb,
            exceeding_storage_price
          ),
          build_conversion_usage_row(
            usage.media_conversion_minutes,
            media_conversion_minutes,
            exceeding_conversion_price
          )
        ]
        |> Enum.reject(&is_nil/1)

      total_amount =
        rows
        |> Enum.map(fn row -> Decimal.new(row["amount"]) end)
        |> Enum.reduce(Decimal.new(0), &Decimal.add/2)

      %{
        "type" => "plan",
        "period_start" => period_start,
        "period_end" => Date.end_of_month(period_start),
        "rows" => rows,
        "amount" => Decimal.to_string(total_amount),
        "notes" => plan.title
      }
    end
  end

  # Get additional items that were active during the period
  # Returns list of maps in InvoiceItem format
  defp get_additional_items_for_period(tenant, period_start, period_end) do
    from(ai in AdditionalItem,
      where: ai.tenant_id == ^tenant.id,
      where: is_nil(ai.valid_from) or ai.valid_from <= ^period_end,
      where: is_nil(ai.valid_until) or ai.valid_until >= ^period_start
    )
    |> Repo.all(prefix: "public")
    |> Enum.map(fn item ->
      # Create a single row for this additional item
      row = %{
        "description" => item.name,
        "quantity" => 1,
        "unit_price" => Decimal.to_string(item.price),
        "amount" => Decimal.to_string(item.price),
        "type" => "additional_item",
        "metadata" => %{
          "additional_item_id" => item.id
        }
      }

      # Return in InvoiceItem format
      %{
        "type" => "additional_item",
        "period_start" => period_start,
        "period_end" => period_end,
        "rows" => [row],
        "amount" => Decimal.to_string(item.price),
        "notes" => item.name
      }
    end)
  end

  # Generate a unique invoice number in format LTA00001
  defp generate_invoice_number do
    # Get the maximum existing invoice number
    max_number =
      from(i in Invoice,
        select: i.invoice_number,
        order_by: [desc: i.id],
        limit: 1
      )
      |> Repo.one(prefix: "public")
      |> case do
        nil ->
          0

        invoice_number ->
          # Extract number from "LTA00123" format
          invoice_number
          |> String.replace("LTA", "")
          |> String.to_integer()
      end

    next_number = max_number + 1
    "LTA#{String.pad_leading(Integer.to_string(next_number), 5, "0")}"
  end

  # Query filters
  defp maybe_filter_by_status(query, nil), do: query
  defp maybe_filter_by_status(query, status), do: where(query, [i], i.status == ^status)

  defp maybe_filter_by_year(query, nil), do: query
  defp maybe_filter_by_year(query, year), do: where(query, [i], i.year == ^year)

  defp maybe_filter_by_month(query, nil), do: query
  defp maybe_filter_by_month(query, month), do: where(query, [i], i.month == ^month)
end
