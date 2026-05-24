defmodule Lotta.Eduplaces.OAuth2ClientBehaviour do
  @callback get(OAuth2.Client.t(), String.t()) :: {:ok, OAuth2.Response.t()} | {:error, any()}
  @callback get_token!(OAuth2.Client.t(), keyword(), keyword(), keyword()) :: OAuth2.Client.t()
end
