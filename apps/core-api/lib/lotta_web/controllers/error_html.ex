defmodule LottaWeb.ErrorHTML do
  @moduledoc """
  This module is invoked by your endpoint in case of errors on HTML requests.

  See config/config.exs.
  """
  use LottaWeb, :html

  embed_templates("error_html/*")

  attr(:title, :string, required: true, doc: "the title of the error page")
  attr(:message, :string, default: "", doc: "the message of the error page")

  attr(:image, :string,
    required: false,
    default: nil,
    doc: "the image to display on the error page"
  )

  def fullsize_error(assigns) do
    ~H"""
    <style>
      body {
        font-family: sans-serif;
        display: flex;
        flex-direction: column;
        background: rgb(var(--lotta-box-background-color));
        width: 100%;
        height: fit-content;
        max-height: 100%;
        min-height: 0;
        text-align: center;

        margin-bottom: auto;
        transition: min-height 0.3s ease-in-out;
      }
    </style>
    <div class="flex items-center justify-center h-screen bg-gray-100">
      <div class="bg-white p-6 rounded-lg shadow-md text-center">
        <h1 class="text-4xl font-bold mb-4">{@title}</h1>
        <LottaWeb.Images.server_error :if={@image == "server_error"} />
        <LottaWeb.Images.not_found :if={@image == "not_found"} />
        <LottaWeb.Images.tenant_not_found :if={@image == "tenant_not_found"} />
        <p class="text-lg">{@message}</p>
      </div>
    </div>
    """
  end
end
