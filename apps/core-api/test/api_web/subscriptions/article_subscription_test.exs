defmodule ApiWeb.ArticleSubscriptionTest do
  @moduledoc false

  use ApiWeb.SubscriptionCase

  alias ApiWeb.Auth.AccessToken
  alias Api.Repo
  alias Api.Accounts.User
  alias Api.Content.Article

  setup do
    Repo.Seeder.seed()

    emails = [
      "alexis.rinaldoni@lotta.schule",
      "eike.wiewiorra@lotta.schule",
      "billy@lotta.schule",
      "maxi@lotta.schule"
    ]

    [{admin, admin_jwt}, {lehrer, lehrer_jwt}, {schueler, schueler_jwt}, {user, user_jwt}] =
      Enum.map(emails, fn email ->
        user = Repo.get_by!(User, email: email)

        {:ok, jwt, _} = AccessToken.encode_and_sign(user, %{email: user.email, name: user.name})

        {user, jwt}
      end)

    titles = ["Der Vorausscheid", "Draft2"]
    [vorausscheid, draft] = Enum.map(titles, fn title -> Repo.get_by!(Article, title: title) end)

    {:ok,
     %{
       admin: admin,
       admin_jwt: admin_jwt,
       lehrer: lehrer,
       lehrer_jwt: lehrer_jwt,
       schueler: schueler,
       schueler_jwt: schueler_jwt,
       user: user,
       user_jwt: user_jwt,
       draft: draft,
       vorausscheid: vorausscheid
     }}
  end

  describe "article_is_updated subscription" do
    @subscription """
    subscription ArticleIsUpdated($id: ID!) {
      articleIsUpdated(id: $id) {
        title
        preview
        topic
        readyToPublish
        isPinnedToTop
      }
    }
    """
    @mutation """
    mutation updateArticle($id: ID!, $article: ArticleInput!) {
      updateArticle(id: $id, article: $article) {
        title
        preview
        topic
        readyToPublish
        users {
          name
        }
      }
    }
    """
    test "subscribe to article changes if user is admin and send notification on article update", %{
      admin_jwt: admin_jwt,
      draft: draft
    } do
      {:ok, socket} = Phoenix.ChannelTest.connect(ApiWeb.UserSocket, %{token: admin_jwt})
      {:ok, socket} = Absinthe.Phoenix.SubscriptionTest.join_absinthe(socket)

      ref = push_doc(socket, @subscription, variables: %{id: to_string(draft.id)})
      assert_reply ref, :ok, %{subscriptionId: _subscription_id}

      res =
        build_conn()
        |> put_req_header("authorization", "Bearer #{admin_jwt}")
        |> post("/api", query: @mutation, variables: %{id: draft.id, article: %{title: "ABC"}})
        |> json_response(200)

      refute res["errors"]
      refute res["data"]["updateArticle"]["errors"]
      assert res["data"]["updateArticle"]["title"] == "ABC"

      assert_push("subscription:data", push)

      assert %{
               result: %{data: %{"articleIsUpdated" => article}},
               subscriptionId: _subscription_id
             } = push
      assert Map.fetch!(article, "title") == "ABC"
    end

    test "subscribe to article changes if user is author", %{lehrer_jwt: lehrer_jwt, draft: draft} do
      {:ok, socket} = Phoenix.ChannelTest.connect(ApiWeb.UserSocket, %{token: lehrer_jwt})
      {:ok, socket} = Absinthe.Phoenix.SubscriptionTest.join_absinthe(socket)

      ref = push_doc(socket, @subscription, variables: %{id: draft.id})
      assert_reply ref, :ok, %{subscriptionId: _subscription_id}
    end

    test "returns an error if user is not author", %{
      vorausscheid: vorausscheid,
      user_jwt: user_jwt
    } do
      {:ok, socket} = Phoenix.ChannelTest.connect(ApiWeb.UserSocket, %{token: user_jwt})
      {:ok, socket} = Absinthe.Phoenix.SubscriptionTest.join_absinthe(socket)

      ref = push_doc(socket, @subscription, variables: %{id: vorausscheid.id})
      assert_reply ref, :error, %{errors: [%{message: "Du hast nicht die Rechte dir diesen Beitrag anzusehen."}]}
    end

    test "returns an error if article id does not exist", %{user_jwt: user_jwt} do
      {:ok, socket} = Phoenix.ChannelTest.connect(ApiWeb.UserSocket, %{token: user_jwt})
      {:ok, socket} = Absinthe.Phoenix.SubscriptionTest.join_absinthe(socket)

      ref = push_doc(socket, @subscription, variables: %{id: "0"})
      assert_reply ref, :error, %{errors: [%{message: "Beitrag nicht gefunden."}]}
    end
  end
end
