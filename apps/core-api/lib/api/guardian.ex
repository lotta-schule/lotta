defmodule Api.Guardian do
  use Guardian, otp_app: :api
  alias Api.Accounts

  def subject_for_token(user, _claims) do
    # You can use any value for the subject of your token but
    # it should be useful in retreiving the user later, see
    # how it being used on `user_from_claims/1` function.
    # A unique `id` is a good subject, a non-unique email address
    # is a poor subject
    sub = to_string(user.id)
    {:ok, sub}
  end

  def resource_from_claims(claims) do
    # Here we'll look up our resource from the claims, the subject can be
    # found in the `"sub"` key. In `above subject_for_token/2` we returned
    # the resource id so here wel'll rely on that to look it up
    user = claims["sub"] |> Accounts.get_user!
    {:ok, user}
  end
end