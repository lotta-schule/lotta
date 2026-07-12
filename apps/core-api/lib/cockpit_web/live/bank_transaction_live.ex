defmodule CockpitWeb.Live.BankTransactionLive do
  use Backpex.LiveResource,
    adapter_config: [
      schema: Cockpit.Banking.BankTransaction,
      repo: Lotta.Repo
    ],
    init_order: %{by: :transaction_date, direction: :desc}

  alias Cockpit.Banking

  @impl Backpex.LiveResource
  def can?(_assigns, action, _item) when action in [:new, :edit, :delete], do: false
  def can?(_assigns, _action, _item), do: true

  @impl Backpex.LiveResource
  def singular_name, do: "Transaction"

  @impl Backpex.LiveResource
  def plural_name, do: "Transactions"

  @impl Backpex.LiveResource
  def layout(_assigns), do: {CockpitWeb.Layouts, :admin}

  @impl Backpex.LiveResource
  def item_actions(default_actions) do
    Keyword.take(default_actions, [:show])
  end

  @impl Backpex.LiveResource
  def fields do
    [
      transaction_date: %{module: Backpex.Fields.Date, label: "Date"},
      iban: %{module: Backpex.Fields.Text, label: "IBAN"},
      remote_name: %{module: Backpex.Fields.Text, label: "Remote Name"},
      purpose: %{module: Backpex.Fields.Text, label: "Purpose"},
      amount: %{
        module: Backpex.Fields.Currency,
        label: "Amount",
        unit: "EUR",
        radix: ",",
        thousands_separator: " "
      },
      transaction_type: %{module: Backpex.Fields.Text, label: "Type"},
      status: %{module: Backpex.Fields.Text, label: "Status"},
      remote_iban: %{module: Backpex.Fields.Text, label: "Remote IBAN", except: [:index]},
      remote_bic: %{module: Backpex.Fields.Text, label: "Remote BIC", except: [:index]},
      currency: %{module: Backpex.Fields.Text, label: "Currency", except: [:index]},
      valuta_date: %{module: Backpex.Fields.Date, label: "Valuta Date", except: [:index]},
      local_bank_code: %{module: Backpex.Fields.Text, label: "Local Bank Code", except: [:index]},
      local_account_number: %{
        module: Backpex.Fields.Text,
        label: "Local Account Number",
        except: [:index]
      },
      remote_bank_code: %{
        module: Backpex.Fields.Text,
        label: "Remote Bank Code",
        except: [:index]
      },
      remote_account_number: %{
        module: Backpex.Fields.Text,
        label: "Remote Account Number",
        except: [:index]
      },
      transaction_code: %{
        module: Backpex.Fields.Number,
        label: "Transaction Code",
        except: [:index]
      },
      transaction_text: %{
        module: Backpex.Fields.Text,
        label: "Transaction Text",
        except: [:index]
      },
      transaction_key: %{module: Backpex.Fields.Text, label: "Transaction Key", except: [:index]},
      sub_type: %{module: Backpex.Fields.Text, label: "Sub Type", except: [:index]},
      primanota: %{module: Backpex.Fields.Text, label: "Primanota", except: [:index]},
      end_to_end_reference: %{
        module: Backpex.Fields.Text,
        label: "End-to-End Reference",
        except: [:index]
      },
      creditor_scheme_id: %{
        module: Backpex.Fields.Text,
        label: "Creditor Scheme ID",
        except: [:index]
      },
      mandate_id: %{module: Backpex.Fields.Text, label: "Mandate ID", except: [:index]},
      customer_reference: %{
        module: Backpex.Fields.Text,
        label: "Customer Reference",
        except: [:index]
      },
      ultimate_debtor: %{module: Backpex.Fields.Text, label: "Ultimate Debtor", except: [:index]}
    ]
  end

  @impl Backpex.LiveResource
  def render_resource_slot(assigns, :index, :before_main) do
    assigns = assign(assigns, :balances, Banking.list_current_balances())

    ~H"""
    <div class="stats stats-vertical lg:stats-horizontal shadow mb-4 w-full">
      <div :for={balance <- @balances} class="stat">
        <div class="stat-title">{balance.iban}</div>
        <div class={["stat-value text-2xl", Decimal.negative?(balance.value) && "text-error"]}>
          {balance.value} {balance.currency}
        </div>
        <div class="stat-desc">as of {balance.date}</div>
      </div>
      <div :if={@balances == []} class="stat">
        <div class="stat-title">No accounts</div>
      </div>
    </div>
    <.balance_chart />
    """
  end

  defp balance_chart(assigns) do
    assigns = assign(assigns, :chart_data, build_chart_data(Banking.balance_history()))

    ~H"""
    <div :if={@chart_data.labels != []} class="bg-base-100 rounded-box shadow p-4 mb-4 w-full">
      <h3 class="text-sm font-medium text-base-content/70 mb-2">Combined balance over time</h3>
      <div class="h-60">
        <canvas id="balance-chart" phx-hook="BalanceChart" data-chart={Jason.encode!(@chart_data)}></canvas>
      </div>
    </div>
    """
  end

  defp build_chart_data(%{combined: combined, by_iban: by_iban}) do
    labels = Enum.map(combined, &Date.to_iso8601(&1.date))

    iban_datasets =
      by_iban
      |> Enum.sort_by(fn {iban, _series} -> iban end)
      |> Enum.map(fn {iban, series} ->
        %{
          label: Banking.account_name(iban),
          values: Enum.map(series, &Decimal.to_float(&1.value))
        }
      end)

    combined_dataset =
      if map_size(by_iban) > 1 do
        [%{label: "Combined", values: Enum.map(combined, &Decimal.to_float(&1.value))}]
      else
        []
      end

    %{labels: labels, datasets: combined_dataset ++ iban_datasets}
  end
end
