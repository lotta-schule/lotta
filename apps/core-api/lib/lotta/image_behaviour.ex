defmodule Lotta.ImageBehaviour do
  @callback open(term()) :: {:ok, term()} | {:error, term()}
  @callback shape(term()) :: {integer(), integer(), integer()}
  @callback pages(term()) :: integer()
  @callback exif(term()) :: {:ok, map()} | {:error, term()}
  @callback dominant_color(term()) :: {:ok, list()} | {:error, term()}
  @callback thumbnail(term(), term(), keyword()) :: {:ok, term()} | {:error, term()}
  @callback stream!(term(), keyword()) :: Enumerable.t()
end
