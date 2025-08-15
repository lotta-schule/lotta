defmodule Lotta.Worker.MetadataTest do
  use Lotta.WorkerCase, async: false

  describe "MetadataWorker" do
    test "sanitize invalid metadata" do
      metadata = %{
        width: 3264,
        height: 1836,
        channels: 3,
        exif: %{
          make: "samsung",
          model: "SM-J600FN",
          orientation: "Rotate 90 CW",
          exif: %{
            interopt_offset: 946,
            white_balance: "Auto",
            exposure_mode: "Auto",
            datetime_digitized: ~N[2025-08-11 07:23:29],
            component_configuration: "Y,Cb,Cr,-",
            subsec_time: "0905",
            flash_pix_version: "1.00",
            maker_note: nil,
            flash: "No Flash",
            user_comment: nil,
            exif_image_width: 3264,
            datetime_original: ~N[2025-08-11 07:23:29],
            contrast: "Normal",
            custom_rendered: "Normal",
            exposure_program: "Program AE",
            exif_version: "2.20",
            focal_length_in_35mm_film: 27,
            scene_capture_type: "Standard",
            focal_length: 3.6,
            exposure_time: "1/1695",
            shutter_speed_value: 10.73,
            scene_type: <<85, 110, 107, 110, 111, 119, 110, 32, 40, 1, 0, 0, 0, 41>>,
            subsec_time_original: "0905",
            brightness_value: 8.56,
            aperture_value: 1.85,
            exif_image_height: 1836,
            metering_mode: "Center-weighted average",
            exposure_bias_value: 0.0,
            sharpness: "Normal",
            saturation: "Normal",
            iso_speed_ratings: 40,
            color_space: "sRGB",
            max_aperture_value: 1.85,
            image_unique_id: ["Y13LLLA00NM Y13LLNC02NA\n", ""],
            f_number: 1.9,
            subsec_time_digitized: "0905",
            digital_zoom_ratio: :infinity
          },
          image_width: 3264,
          image_height: 1836,
          x_resolution: 72,
          y_resolution: 72,
          resolution_units: "Pixels/in",
          software: "J600FNXXSACVB1",
          modify_date: ~N[2025-08-11 07:23:29],
          YCbCr_positioning: "Centered"
        },
        pages: 1,
        dominant_color: "#080808"
      }

      assert %{
               width: 3264,
               height: 1836,
               channels: 3,
               exif: %{
                 make: "samsung",
                 model: "SM-J600FN",
                 orientation: "Rotate 90 CW",
                 exif: %{
                   interopt_offset: 946,
                   white_balance: "Auto",
                   exposure_mode: "Auto",
                   datetime_digitized: "2025-08-11T07:23:29",
                   scene_type: [
                     "85",
                     "110",
                     "107",
                     "110",
                     "111",
                     "119",
                     "110",
                     "32",
                     "40",
                     "1",
                     "0",
                     "0",
                     "0",
                     "41"
                   ],
                   subsec_time_original: "0905",
                   max_aperture_value: 1.85,
                   image_unique_id: ["Y13LLLA00NM Y13LLNC02NA\n", ""],
                   f_number: 1.9,
                   subsec_time_digitized: "0905",
                   digital_zoom_ratio: :infinity
                 }
               },
               pages: 1,
               dominant_color: "#080808"
             } = Lotta.Worker.Metadata.sanitize_values(metadata)
    end
  end
end
