defmodule Api.SlugifierTest do
  use Api.DataCase
  alias Api.Slugifier


  describe "slugifier" do

    test "Slugifier should slugify 'Der Artikel'" do
      assert Slugifier.slugify_string("Der Artikel") == "Der-Artikel"
    end

    test "Slugifier should slugify 'Die Oskarverleihung - Eine schöne Veranstaltung (auch mit ß)'" do
      assert Slugifier.slugify_string("Die Oskarverleihung - Eine schöne Veranstaltung (auch mit ß)") == "Die-Oskarverleihung-Eine-schone-Veranstaltung-(auch-mit-ss)"
    end

  end

end
