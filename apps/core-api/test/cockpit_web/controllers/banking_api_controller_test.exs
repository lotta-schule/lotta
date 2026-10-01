defmodule CockpitWeb.BankingApiControllerTest do
  @moduledoc false

  use CockpitWeb.ConnCase, async: true

  @auth_header "Basic " <> Base.encode64("admin:test123")

  @valid_payload %{
    "accountInfo" => [
      %{
        "iban" => "DE24430609671310166000",
        "balance" => [
          %{"type" => "booked", "date" => "20251101", "value" => "74670%2F100%3AEUR"}
        ],
        "transaction" => [
          %{
            "date" => "20251025",
            "valutaDate" => "20251025",
            "value" => "-15000%2F100%3AEUR",
            "localAccountNumber" => "1310166000",
            "purpose" => "Test%20payment"
          }
        ]
      }
    ]
  }

  describe "POST /api/banking/ingest" do
    test "ingests data and returns stats", %{conn: conn} do
      conn =
        conn
        |> put_req_header("accept", "application/json")
        |> put_req_header("authorization", @auth_header)
        |> post("/api/banking/ingest", @valid_payload)

      body = json_response(conn, 200)
      assert body["status"] == "success"
      assert body["stats"]["balances"]["inserted"] == 1
      assert body["stats"]["transactions"]["inserted"] == 1
    end

    test "deduplicates on second ingest", %{conn: conn} do
      auth_json_conn =
        conn
        |> put_req_header("accept", "application/json")
        |> put_req_header("authorization", @auth_header)

      post(auth_json_conn, "/api/banking/ingest", @valid_payload)

      conn2 =
        build_conn()
        |> put_req_header("accept", "application/json")
        |> put_req_header("authorization", @auth_header)
        |> post("/api/banking/ingest", @valid_payload)

      body = json_response(conn2, 200)
      assert body["status"] == "success"
      assert body["stats"]["balances"]["inserted"] == 0
      assert body["stats"]["balances"]["skipped"] == 1
    end

    test "returns 422 for payload missing accountInfo key", %{conn: conn} do
      conn =
        conn
        |> put_req_header("accept", "application/json")
        |> put_req_header("authorization", @auth_header)
        |> post("/api/banking/ingest", %{"data" => []})

      body = json_response(conn, 422)
      assert body["status"] == "error"
    end

    test "returns 401 when no auth provided", %{conn: conn} do
      conn =
        conn
        |> put_req_header("accept", "application/json")
        |> post("/api/banking/ingest", @valid_payload)

      assert conn.status == 401
    end

    test "handles multiple accounts in one payload", %{conn: conn} do
      payload = %{
        "accountInfo" => [
          %{
            "iban" => "DE24430609671310166000",
            "balance" => [
              %{"type" => "booked", "date" => "20251101", "value" => "74670%2F100%3AEUR"}
            ],
            "transaction" => []
          },
          %{
            "iban" => "DE89370400440532013000",
            "balance" => [
              %{"type" => "booked", "date" => "20251101", "value" => "50000%2F100%3AEUR"}
            ],
            "transaction" => []
          }
        ]
      }

      conn =
        conn
        |> put_req_header("accept", "application/json")
        |> put_req_header("authorization", @auth_header)
        |> post("/api/banking/ingest", payload)

      body = json_response(conn, 200)
      assert body["status"] == "success"
      assert body["stats"]["balances"]["inserted"] == 2
    end
  end
end
