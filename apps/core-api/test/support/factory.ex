defmodule Lotta.Factory do
  @moduledoc false
  use ExMachina.Ecto, repo: Lotta.Repo

  alias Lotta.{Calendar, Accounts}

  def group_factory do
    %Accounts.UserGroup{
      name: sequence(:name, &"group-#{&1}"),
      sort_key: sequence(:sort_key, & &1),
      is_admin_group: false
    }
  end

  def admin_group_factory do
    struct!(group_factory(), is_admin_group: true)
  end

  def user_factory do
    %Accounts.User{
      name: sequence(:name, &"user-#{&1}"),
      nickname: sequence(:nickname, &Enum.at(["Napo", "Billy", "Eike", "Lotta"], rem(&1, 4))),
      email: sequence(:email, &"user-#{&1}@lotta.schule"),
      password: "password",
      class: "5",
      hide_full_name: false
    }
  end

  def admin_user_factory do
    struct!(user_factory(), groups: [build(:admin_group)])
  end

  def calendar_factory do
    %Calendar.Calendar{
      name: sequence(:name, &"calendar-#{&1}"),
      color: sequence(:color, &Enum.at(["#FF0000", "#00FF00", "#0000FF"], rem(&1, 3)))
    }
  end

  def publicly_available_calendar_factory do
    struct!(calendar_factory(), is_publicly_available: true)
  end

  def calendar_event_factory do
    %Calendar.CalendarEvent{
      summary: sequence(:title, &"event-#{&1}"),
      description: sequence(:description, &"description-#{&1}"),
      start: sequence(:start_date, &DateTime.add(~U[2021-01-01 08:30:00Z], &1)),
      end: sequence(:end_date, &DateTime.add(~U[2021-01-01 10:00:00Z], &1)),
      is_full_day: false
    }
  end
end
