defmodule LottaWeb.FeedbackResolver do
  @moduledoc false
  import LottaWeb.ErrorHelpers
  import Lotta.Guard

  alias Lotta.{Repo, Tenants}

  def list(_args, _context) do
    {:ok, Tenants.list_feedbacks()}
  end

  def create(%{feedback: feedback}, %{context: %{current_user: current_user}}) do
    Tenants.create_feedback(current_user, feedback)
    |> format_errors("Feedback konnte nicht eingereicht werden.")
  end

  def create_for_lotta(%{subject: subject, message: message}, %{
        context: %{current_user: current_user}
      }) do
    case Tenants.create_feedback_for_lotta(subject, message, current_user) do
      :ok ->
        {:ok, true}

      :error ->
        {:error, false}
    end
  end

  def send_to_lotta(%{id: id} = args, %{context: %{current_user: current_user}})
      when is_uuid(id) do
    case Tenants.get_feedback(id) do
      nil ->
        {:error, "Feedback nicht gefunden."}

      feedback ->
        Tenants.send_feedback_to_lotta(feedback, current_user, args[:message])
    end
  end

  def send_to_lotta(_, _), do: {:error, "Feedback nicht gefunden."}

  def respond(%{id: id, subject: subject, message: message}, %{
        context: %{current_user: current_user}
      })
      when is_uuid(id) do
    case Tenants.get_feedback(id) do
      nil ->
        {:error, "Feedback nicht gefunden."}

      feedback ->
        feedback
        |> Repo.preload(:user)
        |> Tenants.respond_to_feedback(current_user, subject, message)
    end
  end

  def respond(_, _), do: {:error, "Feedback nicht gefunden."}

  def delete(%{id: id}, _context) when is_uuid(id) do
    case Tenants.get_feedback(id) do
      nil ->
        {:error, "Feedback nicht gefunden."}

      feedback ->
        Tenants.delete_feedback(feedback)
    end
  end

  def delete(_, _), do: {:error, "Feedback nicht gefunden."}
end
