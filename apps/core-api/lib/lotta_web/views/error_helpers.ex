defmodule LottaWeb.ErrorHelpers do
  @moduledoc """
  Conveniences for translating and building error messages.
  """
  alias Ecto.Changeset

  @doc """
  Translates custom objects to errors
  """
  def extract_error_details(%Changeset{} = changeset) do
    changeset
    |> Changeset.traverse_errors(&translate_error/1)
  end

  def extract_error_details(error), do: error

  @doc """
  Gets an {:ok, _} or {:error, _} tuple and returns it, setting up
  error details on the way if possible
  """
  def format_errors(result, msg \\ nil)

  def format_errors({:error, %Changeset{} = cs}, msg) do
    {:error,
     %{
       message: msg,
       details: extract_error_details(cs)
     }}
  end

  def format_errors(res, _msg), do: res

  @doc """
  Translates an error message using gettext.
  """
  def translate_error({msg, opts}) do
    # When using gettext, we typically pass the strings we want
    # to translate as a static argument:
    #
    #     # Translate "is invalid" in the "errors" domain
    #     dgettext("errors", "is invalid")
    #
    #     # Translate the number of files with plural rules
    #     dngettext("errors", "1 file", "%{count} files", count)
    #
    # Because the error messages we show in our forms and APIs
    # are defined inside Ecto, we need to translate them dynamically.
    # This requires us to call the Gettext module passing our gettext
    # backend as first argument.
    #
    # Note we use the "errors" domain, which means translations
    # should be written to the errors.po file. The :count option is
    # set by Ecto and indicates we should also apply plural rules.
    if count = opts[:count] do
      Gettext.dngettext(LottaWeb.Gettext, "errors", msg, msg, count, opts)
    else
      Gettext.dgettext(LottaWeb.Gettext, "errors", msg, opts)
    end
  end
end
