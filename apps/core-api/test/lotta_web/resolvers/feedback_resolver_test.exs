defmodule LottaWeb.FeedbackResolverTest do
  @moduledoc false

  use LottaWeb.ConnCase
  use Bamboo.Test

  import Ecto.Query

  alias LottaWeb.Auth.AccessToken
  alias Lotta.{Email, Repo, Tenants}
  alias Lotta.Accounts.User
  alias Lotta.Tenants.Feedback

  @prefix "tenant_test"

  setup do
    tenant = Tenants.get_tenant_by_prefix(@prefix)

    Repo.put_prefix(@prefix)

    admin =
      Repo.one!(
        from(u in User, where: u.email == ^"alexis.rinaldoni@lotta.schule"),
        prefix: tenant.prefix
      )

    user =
      Repo.one!(
        from(u in User, where: u.email == ^"eike.wiewiorra@lotta.schule"),
        prefix: tenant.prefix
      )

    feedbacks = Repo.all(from(f in Feedback, prefix: ^tenant.prefix))

    {:ok, admin_jwt, _} = AccessToken.encode_and_sign(admin)

    {:ok, user_jwt, _} = AccessToken.encode_and_sign(user)

    {:ok,
     %{
       admin: admin,
       admin_jwt: admin_jwt,
       user: user,
       user_jwt: user_jwt,
       feedbacks: feedbacks,
       tenant: tenant
     }}
  end

  describe "resolve feedbacks" do
    @query """
    query Feedbacks {
      feedbacks {
        topic
        content
        user {
          name
        }
      }
    }
    """
    test "returns the available feedback for an admin", %{admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> get("/api", query: @query)
        |> json_response(200)

      assert %{
               "data" => %{
                 "feedbacks" => [
                   %{
                     "content" => "Hallo, ich bin ein Test",
                     "topic" => "Test",
                     "user" => %{"name" => "Eike Wiewiorra"}
                   },
                   %{
                     "content" => "Hallo, ich bin ein zweiter Test",
                     "topic" => "Test",
                     "user" => %{"name" => "Eike Wiewiorra"}
                   },
                   %{
                     "content" =>
                       "Weil ich böse bin, will ich auch einen Account mit Admin-Rechten",
                     "topic" => "Anfrage",
                     "user" => %{"name" => "Dr Evil"}
                   }
                 ]
               }
             } = res
    end
  end

  describe "Creates a new feedback" do
    @query """
    mutation CreateFeedback($feedback: CreateFeedbackInput!) {
      feedback: createFeedback(feedback: $feedback) {
        id
        topic
        content
        user {
          name
        }
      }
    }
    """
    test "creates a feedback and returns the available feedback for an admin", %{
      user_jwt: user_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            "feedback" => %{
              "topic" => "Test",
              "content" => "Hallo, ich bin ein Test",
              "metadata" => """
                UserAgent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36
                Referrer: http://localhost:4000/
                Url: http://localhost:4000/
              """
            }
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "feedback" => %{
                   "content" => "Hallo, ich bin ein Test",
                   "id" => id,
                   "topic" => "Test",
                   "user" => %{"name" => "Eike Wiewiorra"}
                 }
               }
             } = res

      assert Repo.get(Feedback, id, prefix: "tenant_test")
    end
  end

  describe "Send feedback to lotta" do
    @query """
    mutation SendFeedbackToLotta($id: ID!, $message: String) {
      feedback: sendFeedbackToLotta(id: $id, message: $message) {
        id
        topic
        content
        isForwarded
        user {
          name
        }
      }
    }
    """
    test "Sends a feedback to lotta via cockpit when id and message are set", %{
      admin_jwt: admin_jwt,
      feedbacks: [feedback | _]
    } do
      Tesla.Mock.mock(fn
        %Tesla.Env{
          method: :post,
          url: "https://zammad.example.com/api/v1/tickets"
        } ->
          {:ok, %Tesla.Env{status: 201}}
      end)

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            "id" => feedback.id,
            "message" => "Hier hast du deine Antwort"
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "feedback" => %{
                   "id" => _id,
                   "isForwarded" => true
                 }
               }
             } = res

      assert_no_emails_delivered()
    end

    test "Sends a feedback to lotta via email if cockpit fails", %{
      admin: admin,
      admin_jwt: admin_jwt,
      feedbacks: [feedback | _]
    } do
      Tesla.Mock.mock(fn
        %Tesla.Env{
          method: :post,
          url: "https://zammad.example.com/api/v1/tickets"
        } ->
          {:ok, %Tesla.Env{status: 400}}
      end)

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            "id" => feedback.id,
            "message" => "Hier hast du deine Antwort"
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "feedback" => %{
                   "id" => _id,
                   "isForwarded" => true
                 }
               }
             } = res

      assert_delivered_email(
        Email.send_feedback_to_lotta_mail(feedback, admin, "Hier hast du deine Antwort")
      )
    end

    test "Returns an error when id does not exist", %{
      admin_jwt: admin_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            "id" => "00000000-0000-0000-0000-000000000000",
            "message" => "Hier hast du deine Antwort"
          }
        )
        |> json_response(200)

      assert %{
               "data" => nil,
               "errors" => [
                 %{
                   "locations" => [%{"column" => 3, "line" => 2}],
                   "message" => "Feedback nicht gefunden.",
                   "path" => ["feedback"]
                 }
               ]
             } = res

      assert_no_emails_delivered()
    end
  end

  describe "Respond to feedback" do
    @query """
    mutation RespondToFeedback($id: ID!, $subject: String, $message: String!) {
      feedback: respondToFeedback(id: $id, subject: $subject, message: $message) {
        id
        topic
        content
        isResponded
        user {
          name
        }
      }
    }
    """
    test "Sends a feedback to lotta when id and subject + message are set", %{
      admin_jwt: admin_jwt,
      feedbacks: [feedback | _]
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            "id" => feedback.id,
            "subject" => "Achtung wichtig!",
            "message" => "Hier hast du deine Antwort"
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{
                 "feedback" => %{
                   "id" => _id,
                   "isResponded" => true
                 }
               }
             } = res
    end

    test "Returns an error when id does not exist", %{
      admin_jwt: admin_jwt
    } do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            "id" => "00000000-0000-0000-0000-000000000000",
            "subject" => "Achtung wichtig!",
            "message" => "Hier hast du deine Antwort"
          }
        )
        |> json_response(200)

      assert %{
               "data" => nil,
               "errors" => [
                 %{
                   "locations" => [%{"column" => 3, "line" => 2}],
                   "message" => "Feedback nicht gefunden.",
                   "path" => ["feedback"]
                 }
               ]
             } = res
    end
  end

  describe "Send Lotta-Feedback to lotta admins" do
    @query """
    mutation CreateLottaFeedback($subject: String, $message: String!) {
      feedback: createLottaFeedback(subject: $subject, message: $message)
    }
    """
    test "Sends a feedback to lotta via cockpit", %{
      admin_jwt: admin_jwt
    } do
      Tesla.Mock.mock(fn
        %Tesla.Env{
          method: :post,
          url: "https://zammad.example.com/api/v1/tickets"
        } ->
          {:ok, %Tesla.Env{status: 201}}
      end)

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            "subject" => "Ich finde lotta toll",
            "message" => "Lotta ist toll weil Alexis so ein toller Mensch ist"
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{"feedback" => true}
             } = res

      assert_no_emails_delivered()
    end

    test "Sends a feedback to lotta via mail when cockpit fails", %{
      admin: admin,
      admin_jwt: admin_jwt
    } do
      Tesla.Mock.mock(fn
        %Tesla.Env{
          method: :post,
          url: "https://zammad.example.com/api/v1/tickets"
        } ->
          {:ok, %Tesla.Env{status: 400}}
      end)

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            "subject" => "Ich finde lotta toll",
            "message" => "Lotta ist toll weil Alexis so ein toller Mensch ist"
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{"feedback" => true}
             } = res

      assert_delivered_email(
        Email.create_feedback_for_lotta(
          "Ich finde lotta toll",
          "Lotta ist toll weil Alexis so ein toller Mensch ist",
          admin
        )
      )
    end
  end

  describe "Delete feedback" do
    @query """
    mutation DeleteFeedback($id: ID!) {
      feedback: deleteFeedback(id: $id) {
        id
      }
    }
    """
    test "deletes the feedback", %{
      admin_jwt: admin_jwt,
      feedbacks: [feedback | _]
    } do
      feedback_id = feedback.id

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api",
          query: @query,
          variables: %{
            "id" => feedback.id
          }
        )
        |> json_response(200)

      assert %{
               "data" => %{"feedback" => %{"id" => ^feedback_id}}
             } = res

      assert_raise Ecto.NoResultsError, fn ->
        Repo.get!(Feedback, feedback.id, prefix: @prefix)
      end
    end

    test "returns error if feedback does not exist", %{admin_jwt: admin_jwt} do
      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @query, variables: %{id: "0"})
        |> json_response(200)

      assert %{
               "data" => nil,
               "errors" => [
                 %{
                   "message" => "Feedback nicht gefunden.",
                   "path" => ["feedback"]
                 }
               ]
             } = res
    end

    test "returns error if user is not admin", %{
      user_jwt: user_jwt,
      feedbacks: [feedback | _]
    } do
      feedback_id = feedback.id

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> put_req_header("authorization", "Bearer #{user_jwt}")
        |> post("/api", query: @query, variables: %{id: feedback.id})
        |> json_response(200)

      assert %{
               "data" => nil,
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["feedback"]
                 }
               ]
             } = res

      assert %{id: ^feedback_id} = Repo.get!(Feedback, feedback_id, prefix: @prefix)
    end

    test "returns error if user is not logged in", %{feedbacks: [feedback | _]} do
      feedback_id = feedback.id

      res =
        build_conn()
        |> put_req_header("tenant", "slug:test")
        |> post("/api", query: @query, variables: %{id: feedback.id})
        |> json_response(200)

      assert %{
               "data" => nil,
               "errors" => [
                 %{
                   "message" => "Du musst Administrator sein um das zu tun.",
                   "path" => ["feedback"]
                 }
               ]
             } = res

      assert %{id: ^feedback_id} = Repo.get!(Feedback, feedback_id, prefix: @prefix)
    end
  end
end
