defmodule CockpitWeb.FeedbackController do
  use CockpitWeb, :controller

  alias Lotta.Mailer
  alias Lotta.Email

  action_fallback CockpitWeb.FallbackController

  def create(conn, %{"feedback" => feedback_params}) do
    with {:ok, _feedback} <-
           Mailer.deliver_now(
             Email.plain(
               inspect(feedback_params),
               "Neue Nachricht über lotta-Webseite",
               "kontakt@einsa.net"
             )
           ) do
      send_resp(conn, :ok, "")
    end
  end
end
