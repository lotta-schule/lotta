defmodule Api.UserResolver do
  alias Api.Accounts
  alias Api.Accounts.{AuthHelper,User}

  def resolve_name(user, _args, %{context: context}) do
    cond do
      context[:current_user] && context.current_user.id == user.id ->
        {:ok, user.name}
      context[:current_user] && context[:tenant] && User.is_admin?(context.current_user, context.tenant) ->
        {:ok, user.name}
      user.hide_full_name ->
        {:ok, user.name}
      true ->
        {:ok, nil}
    end
  end
  
  def resolve_email(user, _args, %{context: context}) do
    cond do
      context[:current_user] && context.current_user.id == user.id ->
        {:ok, user.email}
      context[:current_user] && context[:tenant] && User.is_admin?(context.current_user, context.tenant) ->
        {:ok, user.email}
      true ->
        {:error, "Die Email des Nutzers ist geheim."}
    end
  end
  
  def resolve_is_blocked(user, _args, %{context: %{ tenant: tenant }}) do
    {:ok, User.is_blocked?(user, tenant)}
  end
  def resolve_is_blocked(user, _args, _context), do: {:ok, false}

  def get_current(_args, %{context: %{current_user: current_user}}) do
    {:ok, current_user}
  end
  def get_current(_args, _info) do
    {:ok, nil}
  end

  def all_with_groups(_args, %{context: %{tenant: tenant} = context}) do
    case context[:current_user] && User.is_admin?(context.current_user, tenant) do
      true -> {:ok, Accounts.list_users_with_groups(tenant.id)}
      _ -> {:error, "Nur Administrator dürfen auf Benutzer auflisten."}
    end
  end

  def search(%{searchtext: searchtext}, %{context: %{tenant: tenant} = context}) do
    case context[:current_user] && User.is_admin?(context.current_user, tenant) do
      true ->
        if String.length(searchtext) > 2 do
          Accounts.search_user(searchtext, tenant)
        else
          {:ok, []}
        end
      _ -> {:error, "Nur Administrator dürfen auf Benutzer auflisten."}
    end
  end

  def get(%{id: id}, %{context: %{tenant: tenant} = context}) do
    if context[:current_user] && User.is_admin?(context.current_user, tenant) do
      try do
        {:ok, Accounts.get_user!(id)}
      rescue
        Ecto.NoResultsError -> {:ok, nil}
      end
    else
      {:error, "Nur Administrator dürfen auf Benutzer auflisten."}
    end
  end

  def register(%{user: user_params} = args, %{context: %{tenant: tenant}}) do
    user_params = user_params
    |> Map.put(:tenant_id, tenant.id)
    case Accounts.register_user(user_params) do
      {:ok, user} ->
        user = with false <- is_nil(args[:group_key]),
          groups <- Accounts.get_groups_by_enrollment_token(tenant, args[:group_key]),
          {:ok, user} <- Accounts.set_user_groups(user, tenant, groups) do
          user
        else
          {:error, error} ->
            IO.inspect("Error")
            IO.inspect(error)
            user
          _ ->
            user
        end

        {:ok, jwt} = User.get_signed_jwt(user)
        Api.EmailPublisherWorker.send_registration_email(tenant, user)
        {:ok, %{token: jwt}}
      {:error, changeset} ->
        {
          :error,
          message: "Registrierung fehlgeschlagen.",
          details: error_details(changeset)
        }
    end
  end
  
  def login(%{username: username, password: password}, %{context: %{tenant: tenant}}) do
    with {:ok, user} <- AuthHelper.login_with_username_pass(username, password),
        :ok <- AuthHelper.check_if_blocked(user, tenant),
        {:ok, jwt} <- User.get_signed_jwt(user) do
      {:ok, %{token: jwt}}
    end
  end
  
  def logout(_args, _info) do
    {:ok, nil}
  end

  def request_password_reset(%{email: email}, %{context: %{tenant: tenant}}) do
    token =
      :crypto.strong_rand_bytes(32)
      |> Base.url_encode64(padding: false)
      |> URI.encode()
    with {:ok, user} <- Accounts.request_password_reset_token(email, token) do
      Api.EmailPublisherWorker.send_request_password_reset_email(tenant, user, email, token)
    end
    {:ok, true}
  end

  def reset_password(%{email: email, token: token, password: password}, %{context: %{tenant: tenant}}) do
    with {:ok, user} <-  Accounts.find_user_by_reset_token(email, token),
        {:ok, user} <- Accounts.update_password(user, password),
        {:ok, jwt} <- User.get_signed_jwt(user) do
          Api.EmailPublisherWorker.send_password_changed_email(tenant, user)
          {:ok, %{ token: jwt }}
    else
      error ->
        IO.inspect(error)
        {:error, "Die Seite ist nicht mehr gültig. Starte den Vorgang erneut."}
    end
  end

  def set_user_groups(%{id: id, group_ids: group_ids}, %{context: %{current_user: current_user, tenant: tenant}}) do
    case User.is_admin?(current_user, tenant) do
      true ->
        groups =
          group_ids
          |> Enum.map(fn group_id ->
            try do
              Accounts.get_user_group!(group_id)
            rescue
              Ecto.NoResultsError -> nil
            end
          end)
          |> Enum.filter(fn group -> !is_nil(group) && group.tenant_id == tenant.id end)
        try do
          Accounts.get_user!(id)
          |> Accounts.set_user_groups(tenant, groups)
        rescue
          Ecto.NoResultsError ->
            {:error, "Nutzer mit der id #{id} nicht gefunden."}
        end
      false ->
        {:error, "Nur Administratoren dürfen Benutzern Gruppen zuweisen."}
    end
  end

  def update_profile(%{user: user_params}, %{context: %{current_user: current_user}}) do
    case Accounts.update_user(current_user, user_params) do
      {:error, changeset} ->
        {
          :error,
          message: "Speichern fehlgeschlagen.",
          details: error_details(changeset)
        }
      response ->
        response
    end
  end

  def set_user_blocked(%{id: id, is_blocked: is_blocked}, %{context: %{tenant: tenant} = context}) do
    case context[:current_user] && User.is_admin?(context.current_user, tenant) do
      true ->
        try do
          Accounts.get_user!(id)
          |> Accounts.set_user_blocked(tenant, is_blocked)
        rescue
          Ecto.NoResultsError ->
            {:error, "Nutzer mit der id #{id} nicht gefunden."}
        end
      false ->
        {:error, "Nur Administratoren dürfen Benutzer blocken."}
    end
  end

  defp error_details(%Ecto.Changeset{} = changeset) do
    changeset
    |> Ecto.Changeset.traverse_errors(&ApiWeb.ErrorHelpers.translate_error/1)
  end
end