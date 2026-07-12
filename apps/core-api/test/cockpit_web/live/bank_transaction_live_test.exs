defmodule CockpitWeb.Live.BankTransactionLiveTest do
  @moduledoc false

  use Lotta.DataCase, async: true

  import Phoenix.LiveViewTest

  alias Cockpit.Banking.Ingestion
  alias CockpitWeb.Live.BankTransactionLive

  @iban "DE24430609671310166000"
  @other_iban "DE89370400440532013000"

  defp insert_balance!(attrs) do
    defaults = %{
      iban: @iban,
      date: ~D[2025-11-01],
      value: Decimal.new("746.70"),
      currency: "EUR",
      balance_type: "booked"
    }

    {:ok, :inserted} = Ingestion.insert_balance(Map.merge(defaults, attrs))
  end

  describe "can?/3" do
    test "denies :new, :edit and :delete regardless of item" do
      refute BankTransactionLive.can?(nil, :new, nil)
      refute BankTransactionLive.can?(nil, :edit, %{id: 1})
      refute BankTransactionLive.can?(nil, :delete, %{id: 1})
    end

    test "allows :index and :show" do
      assert BankTransactionLive.can?(nil, :index, nil)
      assert BankTransactionLive.can?(nil, :show, %{id: 1})
    end

    test "allows unknown actions (only new/edit/delete are denied)" do
      assert BankTransactionLive.can?(nil, :some_other_action, nil)
    end
  end

  describe "singular_name/0 and plural_name/0" do
    test "returns correct names" do
      assert BankTransactionLive.singular_name() == "Transaction"
      assert BankTransactionLive.plural_name() == "Transactions"
    end
  end

  describe "item_actions/1" do
    test "keeps only the show action" do
      default_actions = [show: :show, edit: :edit, delete: :delete]

      assert BankTransactionLive.item_actions(default_actions) == [show: :show]
    end
  end

  describe "fields/0" do
    test "index columns are the expected subset, in order" do
      fields = BankTransactionLive.fields()

      index_fields =
        Enum.reject(fields, fn {_key, config} -> Map.get(config, :except) == [:index] end)

      assert Keyword.keys(index_fields) == [
               :transaction_date,
               :iban,
               :remote_name,
               :purpose,
               :amount,
               :transaction_type,
               :status
             ]
    end

    test "amount field uses Currency module with EUR formatting" do
      fields = BankTransactionLive.fields()
      config = Keyword.get(fields, :amount)

      assert config.module == Backpex.Fields.Currency
      assert config.unit == "EUR"
      assert config.radix == ","
      assert config.thousands_separator == " "
    end

    test "technical SEPA fields are show-only" do
      fields = BankTransactionLive.fields()

      for key <- [:remote_iban, :remote_bic, :mandate_id, :end_to_end_reference] do
        config = Keyword.get(fields, key)
        assert config.except == [:index], "expected #{key} to be excluded from :index"
      end
    end
  end

  describe "render_resource_slot/3 for :index :before_main" do
    test "shows a placeholder and no chart when there is no balance data" do
      assigns = %{__changed__: nil}

      html =
        rendered_to_string(
          BankTransactionLive.render_resource_slot(assigns, :index, :before_main)
        )

      assert html =~ "No accounts"
      refute html =~ ~s|id="balance-chart"|
    end

    test "renders a balance card per IBAN" do
      insert_balance!(%{iban: @iban, date: ~D[2025-11-01], value: Decimal.new("746.70")})
      insert_balance!(%{iban: @other_iban, date: ~D[2025-11-02], value: Decimal.new("-50.00")})

      assigns = %{__changed__: nil}

      html =
        rendered_to_string(
          BankTransactionLive.render_resource_slot(assigns, :index, :before_main)
        )

      refute html =~ "No accounts"
      assert html =~ @iban
      assert html =~ @other_iban
      assert html =~ "746.70"
      # negative balance is highlighted
      assert html =~ "text-error"
    end

    test "renders the chart canvas with a Combined dataset plus one dataset per IBAN" do
      insert_balance!(%{iban: @iban, date: ~D[2025-01-01], value: Decimal.new("100.00")})
      insert_balance!(%{iban: @other_iban, date: ~D[2025-01-02], value: Decimal.new("200.00")})

      assigns = %{__changed__: nil}

      html =
        rendered_to_string(
          BankTransactionLive.render_resource_slot(assigns, :index, :before_main)
        )

      assert html =~ ~s|id="balance-chart"|
      assert html =~ ~s|phx-hook="BalanceChart"|

      chart_data = decode_chart_data(html)

      assert chart_data["labels"] == ["2025-01-01", "2025-01-02"]

      assert chart_data["datasets"] == [
               %{"label" => "Combined", "values" => [300.0, 300.0]},
               %{"label" => @iban, "values" => [100.0, 100.0]},
               %{"label" => @other_iban, "values" => [200.0, 200.0]}
             ]
    end

    test "uses the configured account name in the legend, falling back to the IBAN" do
      Application.put_env(:lotta, :accounts_list, [[iban: @iban, name: "Girokonto"]])
      on_exit(fn -> Application.put_env(:lotta, :accounts_list, []) end)

      insert_balance!(%{iban: @iban, date: ~D[2025-01-01], value: Decimal.new("100.00")})
      insert_balance!(%{iban: @other_iban, date: ~D[2025-01-01], value: Decimal.new("200.00")})

      assigns = %{__changed__: nil}

      html =
        rendered_to_string(
          BankTransactionLive.render_resource_slot(assigns, :index, :before_main)
        )

      labels = html |> decode_chart_data() |> Map.fetch!("datasets") |> Enum.map(& &1["label"])

      assert "Girokonto" in labels
      assert @other_iban in labels
      refute @iban in labels
    end

    test "omits the Combined dataset when there is only one IBAN" do
      insert_balance!(%{iban: @iban, date: ~D[2025-01-01], value: Decimal.new("100.00")})

      assigns = %{__changed__: nil}

      html =
        rendered_to_string(
          BankTransactionLive.render_resource_slot(assigns, :index, :before_main)
        )

      chart_data = decode_chart_data(html)

      assert chart_data["datasets"] == [%{"label" => @iban, "values" => [100.0]}]
    end
  end

  defp decode_chart_data(html) do
    [_, encoded] = Regex.run(~r/data-chart="([^"]+)"/, html)

    encoded
    |> String.replace("&quot;", "\"")
    |> Jason.decode!()
  end
end
