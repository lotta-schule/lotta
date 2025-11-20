import * as React from 'react';
import { Theme } from '@lotta-schule/theme';

export type PagePreviewProps = {
  theme: Theme;
  backgroundImageSrc: string | undefined;
} & React.SVGProps<SVGSVGElement>;

export const PagePreview = React.memo(
  ({
    className,
    theme: _theme,
    backgroundImageSrc,
    ...props
  }: PagePreviewProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 527.46 419.08"
      className={className}
      data-testid="page-preview"
      {...props}
    >
      <defs>
        <style>{`
            .cls-1,
.cls-23,
.cls-8,
.cls-80,
.cls-83 {
  fill: none;
}
.page-bg-wrapper {
  clip-path: url(#clip-path);
}
.page-bg-wrapper .page-bg {
  fill: rgb(var(--lotta-page-background-color));
}
.page-bg-wrapper image {
  opacity: .5;
}
.cls-4 {
  clip-path: url(#clip-path-2);
}
.cls-5 {
  fill: rgb(var(--lotta-highlight-color));
}
.cls-6 {
  clip-path: url(#clip-path-3);
}
.cls-7 {
  clip-path: url(#clip-path-4);
}
.cls-8 {
  stroke: #929292;
}
.cls-8,
.cls-83 {
  stroke-width: 2px;
}
.cls-9 {
  clip-path: url(#clip-path-5);
}
.cls-10,
.cls-57 {
  fill: rgb(var(--lotta-box-background-color))
}
.cls-11 {
  clip-path: url(#clip-path-6);
}
.cls-12 {
  fill: #ed220d;
}
.cls-13 {
  clip-path: url(#clip-path-7);
}
.cls-14 {
  fill: #ffd932;
}
.cls-15 {
  clip-path: url(#clip-path-8);
}
.cls-16 {
  fill: #60d937;
}
.cls-17 {
  clip-path: url(#clip-path-9);
}
.cls-18 {
  clip-path: url(#clip-path-10);
}
.cls-19 {
  clip-path: url(#clip-path-11);
}
.cls-20 {
  clip-path: url(#clip-path-12);
}
.cls-21 {
  clip-path: url(#clip-path-13);
}
.cls-22 {
  clip-path: url(#clip-path-14);
}
.cls-23 {
  stroke: rgb(var(--lotta-box-background-color));
  stroke-width: 7px;
  fill: rgb(var(--lotta-banner-background-color));
}
.cls-24 {
  clip-path: url(#clip-path-16);
}
.cls-25 {
  clip-path: url(#clip-path-17);
}
.cls-26 {
  clip-path: url(#clip-path-18);
}
.cls-27 {
  clip-path: url(#clip-path-19);
}
.cls-28 {
  clip-path: url(#clip-path-20);
}
.cls-29 {
  clip-path: url(#clip-path-21);
}
.cls-30 {
  clip-path: url(#clip-path-22);
}
.cls-31 {
  clip-path: url(#clip-path-23);
}
.cls-32 {
  fill: rgb(var(--lotta-primary-color))
}
.cls-33 {
  clip-path: url(#clip-path-24);
}
.cls-34 {
  clip-path: url(#clip-path-25);
}
.cls-35 {
  clip-path: url(#clip-path-26);
}
.cls-36 {
  clip-path: url(#clip-path-27);
}
.cls-37 {
  clip-path: url(#clip-path-28);
}
.cls-38 {
  clip-path: url(#clip-path-29);
}
.cls-39 {
  fill: rgb(var(--lotta-navigation-background-color));
}
.cls-40 {
  clip-path: url(#clip-path-30);
}
.cls-41 {
  clip-path: url(#clip-path-31);
}
.cls-42 {
  font-size: 13px;
}
.cls-42,
.cls-68 {
  font-family: Futura-Medium, Futura;
  font-weight: 500;
}
.cls-43 {
  letter-spacing: -0.04em;
}
.cls-44 {
  letter-spacing: -0.02em;
}
.cls-45 {
  letter-spacing: 0.01em;
}
.cls-46 {
  letter-spacing: 0.03em;
}
.cls-47 {
  letter-spacing: 0.01em;
}
.cls-48 {
  letter-spacing: 0.04em;
}
.cls-49 {
  letter-spacing: 0.01em;
}
.cls-50 {
  letter-spacing: 0.02em;
}
.cls-51 {
  fill: rgb(var(--lotta-label-text-color));
}
.cls-52 {
  clip-path: url(#clip-path-32);
}
.cls-53 {
  fill: #ffe6cd;
}
.cls-54 {
  clip-path: url(#clip-path-33);
}
.cls-55 {
  clip-path: url(#clip-path-34);
}
.cls-56 {
  clip-path: url(#clip-path-35);
}
.cls-57,
.cls-68 {
  font-size: 12px;
}
.cls-57 {
  font-family: Futura-Bold, Futura;
  font-weight: 700;
  fill: rgb(var(--lotta-navigation-contrast-text-color))
}
.cls-58 {
  letter-spacing: 0em;
}
.cls-59 {
  letter-spacing: -0.06em;
}
.cls-60 {
  letter-spacing: -0.03em;
}
.cls-61 {
  letter-spacing: -0.03em;
}
.cls-62 {
  clip-path: url(#clip-path-36);
}
.cls-63 {
  clip-path: url(#clip-path-37);
}
.cls-64 {
  clip-path: url(#clip-path-38);
}
.cls-65 {
  clip-path: url(#clip-path-39);
}
.cls-66 {
  clip-path: url(#clip-path-40);
}
.cls-67 {
  clip-path: url(#clip-path-41);
}
.cls-69 {
  letter-spacing: -0.01em;
}
.cls-70 {
  clip-path: url(#clip-path-42);
}
.cls-71 {
  clip-path: url(#clip-path-43);
}
.cls-72 {
  clip-path: url(#clip-path-44);
}
.cls-73 {
  clip-path: url(#clip-path-45);
}
.cls-74 {
  clip-path: url(#clip-path-46);
}
.cls-75 {
  clip-path: url(#clip-path-47);
}
.cls-76 {
  clip-path: url(#clip-path-48);
}
.cls-77 {
  clip-path: url(#clip-path-49);
}
.cls-78 {
  clip-path: url(#clip-path-50);
}
.cls-79 {
  clip-path: url(#clip-path-51);
}
.cls-80 {
  stroke: rgb(var(--lotta-primary-color));
  stroke-width: 1.1px;
}
.cls-81 {
  clip-path: url(#clip-path-52);
}
.cls-82 {
  clip-path: url(#clip-path-53);
}
.cls-83 {
  stroke: rgb(var(--lotta-divider-color));
}
.cls-84 {
  clip-path: url(#clip-path-54);
}
.cls-85 {
  clip-path: url(#clip-path-55);
}
.cls-86 {
  clip-path: url(#clip-path-56);
}
.cls-87 {
  clip-path: url(#clip-path-57);
}
.cls-88 {
  clip-path: url(#clip-path-58);
}
.cls-89 {
  clip-path: url(#clip-path-59);
}
.cls-90 {
  clip-path: url(#clip-path-60);
}
.cls-91 {
  clip-path: url(#clip-path-61);
}
.cls-92 {
  fill: rgb(var(--lotta-badge-background-color));
}
.cls-93 {
  fill: rgba(var(--lotta-accent-grey-color));
}
cls-94 {
  fill: #fff;
}

        `}</style>
        <clipPath id="clip-path">
          <rect
            className="cls-1"
            x="1"
            y="0.5"
            width="527.46"
            height="419.08"
          />
        </clipPath>
        <clipPath id="clip-path-2">
          <rect
            className="cls-1"
            x="0.5"
            y="16.14"
            width="528.46"
            height="17.64"
          />
        </clipPath>
        <clipPath id="clip-path-3">
          <rect
            className="cls-1"
            x="0.5"
            y="0.5"
            width="528.46"
            height="33.29"
          />
        </clipPath>
        <clipPath id="clip-path-4">
          <rect className="cls-1" width="529.46" height="421.08" />
        </clipPath>
        <clipPath id="clip-path-5">
          <rect
            className="cls-1"
            x="132.27"
            y="9.03"
            width="264.92"
            height="16.23"
          />
        </clipPath>
        <clipPath id="clip-path-6">
          <rect
            className="cls-1"
            x="13.73"
            y="10.5"
            width="13.21"
            height="13.28"
          />
        </clipPath>
        <clipPath id="clip-path-7">
          <rect
            className="cls-1"
            x="27.93"
            y="10.22"
            width="13.57"
            height="13.57"
          />
        </clipPath>
        <clipPath id="clip-path-8">
          <rect
            className="cls-1"
            x="43.51"
            y="10.51"
            width="13.63"
            height="13.63"
          />
        </clipPath>
        <clipPath id="clip-path-9">
          <rect
            className="cls-1"
            x="9.33"
            y="244.64"
            width="356.23"
            height="77.17"
          />
        </clipPath>
        <clipPath id="clip-path-10">
          <rect
            className="cls-1"
            x="9.33"
            y="332.64"
            width="356.23"
            height="77.17"
          />
        </clipPath>
        <clipPath id="clip-path-11">
          <rect
            className="cls-1"
            x="9.33"
            y="157.47"
            width="356.23"
            height="77.17"
          />
        </clipPath>
        <clipPath id="clip-path-12">
          <path
            className="cls-1"
            d="M23.17,95.42H350.64c2.78,0,4.45,0,5.56.47a5.72,5.72,0,0,1,3.45,3.45c.47,1.11.47,2.78.47,5.56v30.76c0,2.78,0,4.45-.47,5.56a5.75,5.75,0,0,1-3.45,3.45c-1.11.47-2.78.47-5.56.47H23.17c-2.78,0-4.45,0-5.56-.47a5.77,5.77,0,0,1-3.45-3.45c-.46-1.11-.46-2.78-.46-5.56V104.9c0-2.78,0-4.45.46-5.56a5.75,5.75,0,0,1,3.45-3.45C18.72,95.42,20.39,95.42,23.17,95.42Z"
          />
        </clipPath>
        <clipPath id="clip-path-13">
          <rect
            className="cls-1"
            x="9.2"
            y="90.92"
            width="355.42"
            height="58.71"
          />
        </clipPath>
        <clipPath id="clip-path-14">
          <rect className="cls-1" x="13.7" y="95.42" width="347" height="50" />
        </clipPath>
        <clipPath id="clip-path-16">
          <rect
            className="cls-1"
            x="19.33"
            y="167.47"
            width="80.85"
            height="57.17"
          />
        </clipPath>
        <clipPath id="clip-path-17">
          <rect
            className="cls-1"
            x="19.33"
            y="254.64"
            width="80.85"
            height="57.17"
          />
        </clipPath>
        <clipPath id="clip-path-18">
          <rect
            className="cls-1"
            x="19.33"
            y="342.64"
            width="80.85"
            height="57.17"
          />
        </clipPath>
        <clipPath id="clip-path-19">
          <rect
            className="cls-1"
            x="25.79"
            y="179.23"
            width="67.93"
            height="33.64"
          />
        </clipPath>
        <clipPath id="clip-path-20">
          <rect
            className="cls-1"
            x="33.71"
            y="259.86"
            width="44.85"
            height="46.72"
          />
        </clipPath>
        <clipPath id="clip-path-21">
          <rect
            className="cls-1"
            x="33.71"
            y="348.96"
            width="47.93"
            height="44.52"
          />
        </clipPath>
        <clipPath id="clip-path-22">
          <rect
            className="cls-1"
            x="373.73"
            y="94.42"
            width="143.88"
            height="315.38"
          />
        </clipPath>
        <clipPath id="clip-path-23">
          <rect
            className="cls-1"
            x="386.05"
            y="105.97"
            width="33.79"
            height="17.9"
          />
        </clipPath>
        <clipPath id="clip-path-24">
          <rect
            className="cls-1"
            x="428.83"
            y="105.97"
            width="33.79"
            height="17.9"
          />
        </clipPath>
        <clipPath id="clip-path-25">
          <rect
            className="cls-1"
            x="471.5"
            y="105.97"
            width="33.79"
            height="17.9"
          />
        </clipPath>
        <clipPath id="clip-path-26">
          <rect
            className="cls-1"
            x="334.05"
            y="167.47"
            width="21.91"
            height="21.91"
          />
        </clipPath>
        <clipPath id="clip-path-27">
          <rect
            className="cls-1"
            x="334.05"
            y="254.64"
            width="21.91"
            height="21.91"
          />
        </clipPath>
        <clipPath id="clip-path-28">
          <rect
            className="cls-1"
            x="334.05"
            y="342.64"
            width="21.91"
            height="21.91"
          />
        </clipPath>
        <clipPath id="clip-path-29">
          <rect
            className="cls-1"
            x="9.33"
            y="47.25"
            width="508.8"
            height="35.87"
          />
        </clipPath>
        <clipPath id="clip-path-30">
          <rect
            className="cls-1"
            x="339.2"
            y="169.89"
            width="11.76"
            height="16.89"
          />
        </clipPath>
        <clipPath id="clip-path-31">
          <rect
            className="cls-1"
            x="109.59"
            y="166.53"
            width="245.59"
            height="57.11"
          />
        </clipPath>
        <clipPath id="clip-path-32">
          <rect
            className="cls-1"
            x="395.19"
            y="109.46"
            width="16.11"
            height="10.91"
          />
        </clipPath>
        <clipPath id="clip-path-33">
          <rect
            className="cls-1"
            x="438.9"
            y="107.73"
            width="13.55"
            height="13.55"
          />
        </clipPath>
        <clipPath id="clip-path-34">
          <rect
            className="cls-1"
            x="482.75"
            y="109.23"
            width="11.28"
            height="11.37"
          />
        </clipPath>
        <clipPath id="clip-path-35">
          <rect
            className="cls-1"
            x="12.72"
            y="54.94"
            width="101.54"
            height="16"
          />
        </clipPath>
        <clipPath id="clip-path-36">
          <rect
            className="cls-1"
            x="154.94"
            y="54.94"
            width="101.54"
            height="16"
          />
        </clipPath>
        <clipPath id="clip-path-37">
          <rect
            className="cls-1"
            x="281.75"
            y="54.94"
            width="101.54"
            height="16"
          />
        </clipPath>
        <clipPath id="clip-path-38">
          <rect
            className="cls-1"
            x="410.99"
            y="54.94"
            width="101.54"
            height="16"
          />
        </clipPath>
        <clipPath id="clip-path-39">
          <rect
            className="cls-1"
            x="29.53"
            y="127.01"
            width="34.96"
            height="17.82"
          />
        </clipPath>
        <clipPath id="clip-path-40">
          <rect
            className="cls-1"
            x="82.4"
            y="127.01"
            width="34.96"
            height="17.82"
          />
        </clipPath>
        <clipPath id="clip-path-41">
          <rect
            className="cls-1"
            x="18.62"
            y="100.2"
            width="101.75"
            height="24.25"
          />
        </clipPath>
        <clipPath id="clip-path-42">
          <rect
            className="cls-1"
            x="339.63"
            y="257.28"
            width="11.76"
            height="16.89"
          />
        </clipPath>
        <clipPath id="clip-path-43">
          <rect
            className="cls-1"
            x="339.63"
            y="345.28"
            width="11.76"
            height="16.89"
          />
        </clipPath>
        <clipPath id="clip-path-44">
          <rect
            className="cls-1"
            x="114.15"
            y="254.06"
            width="245.59"
            height="57.11"
          />
        </clipPath>
        <clipPath id="clip-path-45">
          <rect
            className="cls-1"
            x="114.15"
            y="341.84"
            width="245.59"
            height="57.11"
          />
        </clipPath>
        <clipPath id="clip-path-46">
          <rect
            className="cls-1"
            x="129.53"
            y="127.01"
            width="34.96"
            height="17.82"
          />
        </clipPath>
        <clipPath id="clip-path-47">
          <rect
            className="cls-1"
            x="182.4"
            y="127.01"
            width="34.96"
            height="17.82"
          />
        </clipPath>
        <clipPath id="clip-path-48">
          <rect
            className="cls-1"
            x="225.53"
            y="127.01"
            width="34.96"
            height="17.82"
          />
        </clipPath>
        <clipPath id="clip-path-49">
          <rect
            className="cls-1"
            x="278.4"
            y="127.01"
            width="34.96"
            height="17.82"
          />
        </clipPath>
        <clipPath id="clip-path-50">
          <rect
            className="cls-1"
            x="323.15"
            y="127.01"
            width="34.96"
            height="17.82"
          />
        </clipPath>
        <clipPath id="clip-path-51">
          <rect
            className="cls-1"
            x="145.35"
            y="51.94"
            width="120.73"
            height="26.25"
          />
        </clipPath>
        <clipPath id="clip-path-52">
          <rect
            className="cls-1"
            x="103.88"
            y="174.9"
            width="7.67"
            height="7.67"
          />
        </clipPath>
        <clipPath id="clip-path-53">
          <rect
            className="cls-1"
            x="382.39"
            y="140.83"
            width="124.02"
            height="4"
          />
        </clipPath>
        <clipPath id="clip-path-54">
          <rect
            className="cls-1"
            x="382.39"
            y="160.43"
            width="124.02"
            height="23.14"
          />
        </clipPath>
        <clipPath id="clip-path-55">
          <rect
            className="cls-1"
            x="382.39"
            y="160.43"
            width="124.02"
            height="4"
          />
        </clipPath>
        <clipPath id="clip-path-56">
          <rect
            className="cls-1"
            x="382.39"
            y="180.57"
            width="124.02"
            height="4"
          />
        </clipPath>
        <clipPath id="clip-path-57">
          <rect
            className="cls-1"
            x="382.39"
            y="199.93"
            width="124.02"
            height="23.14"
          />
        </clipPath>
        <clipPath id="clip-path-58">
          <rect
            className="cls-1"
            x="382.39"
            y="200.07"
            width="124.02"
            height="4"
          />
        </clipPath>
        <clipPath id="clip-path-59">
          <rect
            className="cls-1"
            x="382.39"
            y="221.07"
            width="124.02"
            height="4"
          />
        </clipPath>
        <clipPath id="clip-path-60">
          <rect
            className="cls-1"
            x="382.39"
            y="241.31"
            width="124.02"
            height="4"
          />
        </clipPath>
        <clipPath id="clip-path-61">
          <rect
            className="cls-1"
            x="496.74"
            y="101.99"
            width="13.34"
            height="13.34"
          />
        </clipPath>
      </defs>
      <title>Zeichenfläche 1</title>
      <g className="page-bg-wrapper">
        <path
          className="page-bg"
          d="M22.53,1.5H506.94c6,0,9.63,0,12,1A12.5,12.5,0,0,1,526.46,10c1,2.41,1,6,1,12.05v376c0,6,0,9.64-1,12.05a12.5,12.5,0,0,1-7.48,7.47c-2.41,1-6,1-12,1H22.53c-6,0-9.64,0-12-1A12.49,12.49,0,0,1,3,410.1c-1-2.41-1-6-1-12.05V22c0-6,0-9.64,1-12a12.49,12.49,0,0,1,7.47-7.47C12.89,1.5,16.5,1.5,22.53,1.5Z"
        />

        <image
          href={backgroundImageSrc}
          x="0"
          y="0"
          width="527.46"
          height="419.08"
          preserveAspectRatio="xMidYMid slice"
          clipPath="url(#clip-path)"
        />
      </g>
      <g className="cls-4">
        <rect
          style={{ fill: 'rgba(var(--lotta-accent-grey-color))' }}
          x="1.5"
          y="17.14"
          width="526.46"
          height="15.64"
        />
      </g>
      <g className="cls-6">
        <path
          style={{ fill: 'rgba(var(--lotta-accent-grey-color))' }}
          d="M22,1.5H507.44c5.9,0,9.44,0,11.8.87a13.14,13.14,0,0,1,7.85,7.85c.64,1.45.87,4.77.87,6.92s-.23,5.48-.87,6.92a13.15,13.15,0,0,1-7.85,7.86c-2.36.87-5.9.87-11.8.87H22c-5.9,0-9.44,0-11.81-.87a13.15,13.15,0,0,1-7.85-7.86c-.64-1.44-.87-4.76-.87-6.92s.23-5.47.87-6.92a13.14,13.14,0,0,1,7.85-7.85C12.59,1.5,16.13,1.5,22,1.5Z"
        />
      </g>
      <g className="cls-7">
        <path
          className="cls-8"
          d="M22.53,2H506.94c6,0,9.63,0,12,1a12.5,12.5,0,0,1,7.48,7.47c1,2.41,1,6,1,12.05v376c0,6,0,9.64-1,12.05a12.5,12.5,0,0,1-7.48,7.47c-2.41,1-6,1-12,1H22.53c-6,0-9.64,0-12-1A12.49,12.49,0,0,1,3,410.6c-1-2.41-1-6-1-12.05v-376c0-6,0-9.64,1-12A12.49,12.49,0,0,1,10.48,3C12.89,2,16.5,2,22.53,2Z"
        />
      </g>
      <g className="cls-9">
        <path
          style={{ fill: '#fff' }}
          d="M144.15,10H385.31c3.1,0,5,0,6.2.43a7.12,7.12,0,0,1,4.25,4.25,7.11,7.11,0,0,1,0,4.87,7.12,7.12,0,0,1-4.25,4.25c-1.24.43-3.1.43-6.2.43H144.15c-3.09,0-5,0-6.19-.43a7.11,7.11,0,0,1-4.26-4.25,7.11,7.11,0,0,1,0-4.87A7.11,7.11,0,0,1,138,10.46C139.2,10,141.06,10,144.15,10Z"
        />
      </g>
      <g className="cls-11">
        <ellipse className="cls-12" cx="20.33" cy="17.14" rx="5.6" ry="5.64" />
      </g>
      <g className="cls-13">
        <circle className="cls-14" cx="34.71" cy="17" r="5.78" />
      </g>
      <g className="cls-15">
        <circle className="cls-16" cx="50.32" cy="17.32" r="5.81" />
      </g>
      <g className="cls-17">
        <path
          className="cls-10"
          d="M26,245.64H348.88c4.6,0,7.36,0,9.2.77a9.53,9.53,0,0,1,5.72,5.71c.77,1.84.77,4.6.77,9.21v43.79c0,4.6,0,7.36-.77,9.21a9.58,9.58,0,0,1-5.72,5.71c-1.84.77-4.6.77-9.2.77H26c-4.6,0-7.36,0-9.21-.77a9.59,9.59,0,0,1-5.71-5.71c-.77-1.85-.77-4.61-.77-9.21V261.33c0-4.61,0-7.37.77-9.21a9.54,9.54,0,0,1,5.71-5.71C18.66,245.64,21.42,245.64,26,245.64Z"
        />
      </g>
      <g className="cls-18">
        <path
          className="cls-10"
          d="M26,333.64H348.88c4.6,0,7.36,0,9.2.77a9.53,9.53,0,0,1,5.72,5.71c.77,1.84.77,4.6.77,9.21v43.79c0,4.6,0,7.36-.77,9.21a9.58,9.58,0,0,1-5.72,5.71c-1.84.77-4.6.77-9.2.77H26c-4.6,0-7.36,0-9.21-.77a9.59,9.59,0,0,1-5.71-5.71c-.77-1.85-.77-4.61-.77-9.21V349.33c0-4.61,0-7.37.77-9.21a9.54,9.54,0,0,1,5.71-5.71C18.66,333.64,21.42,333.64,26,333.64Z"
        />
      </g>
      <g className="cls-19">
        <path
          className="cls-10"
          d="M26,158.47H348.88c4.6,0,7.36,0,9.2.77A9.58,9.58,0,0,1,363.8,165c.77,1.84.77,4.61.77,9.21V218c0,4.61,0,7.37-.77,9.21a9.56,9.56,0,0,1-5.72,5.71c-1.84.77-4.6.77-9.2.77H26c-4.6,0-7.36,0-9.21-.77a9.57,9.57,0,0,1-5.71-5.71c-.77-1.84-.77-4.6-.77-9.21V174.16c0-4.6,0-7.37.77-9.21a9.59,9.59,0,0,1,5.71-5.71C18.66,158.47,21.42,158.47,26,158.47Z"
        />
      </g>
      <g className="cls-20">
        <g className="cls-21">
          <g className="cls-22">
            <img
              width="347"
              height="50"
              style={{ transform: 'matrix(1, 0, 0, -1, 13.7, 145.42)' }}
              src="data:image/png;base64,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"
            />
          </g>
        </g>
      </g>
      <g className="cls-21">
        <path
          className="cls-23"
          d="M23.17,95.42H350.64c2.78,0,4.45,0,5.56.47a5.72,5.72,0,0,1,3.45,3.45c.47,1.11.47,2.78.47,5.56v30.76c0,2.78,0,4.45-.47,5.56a5.75,5.75,0,0,1-3.45,3.45c-1.11.47-2.78.47-5.56.47H23.17c-2.78,0-4.45,0-5.56-.47a5.77,5.77,0,0,1-3.45-3.45c-.46-1.11-.46-2.78-.46-5.56V104.9c0-2.78,0-4.45.46-5.56a5.75,5.75,0,0,1,3.45-3.45C18.72,95.42,20.39,95.42,23.17,95.42Z"
        />
      </g>
      <g className="cls-24">
        <path
          className="cls-93"
          d="M27.53,168.47H92a12.7,12.7,0,0,1,4.23.35,4.46,4.46,0,0,1,2.62,2.62,12.73,12.73,0,0,1,.35,4.23v40.78a12.67,12.67,0,0,1-.35,4.22,4.43,4.43,0,0,1-2.62,2.62,12.7,12.7,0,0,1-4.23.35H27.53a12.63,12.63,0,0,1-4.22-.35,4.38,4.38,0,0,1-2.62-2.62,12.33,12.33,0,0,1-.36-4.22V175.67a12.4,12.4,0,0,1,.36-4.23,4.41,4.41,0,0,1,2.62-2.62A12.63,12.63,0,0,1,27.53,168.47Z"
        />
      </g>
      <g className="cls-25">
        <path
          className="cls-93"
          d="M27.53,255.64H92a12.7,12.7,0,0,1,4.23.35,4.41,4.41,0,0,1,2.62,2.62,12.63,12.63,0,0,1,.35,4.22v40.78a12.63,12.63,0,0,1-.35,4.22,4.41,4.41,0,0,1-2.62,2.62,12.36,12.36,0,0,1-4.23.36H27.53c-2.11,0-3.38,0-4.22-.36a4.36,4.36,0,0,1-2.62-2.62c-.36-.84-.36-2.11-.36-4.22V262.83c0-2.11,0-3.38.36-4.22A4.36,4.36,0,0,1,23.31,256,12.63,12.63,0,0,1,27.53,255.64Z"
        />
      </g>
      <g className="cls-26">
        <path
          className="cls-93"
          d="M27.53,343.64H92a12.7,12.7,0,0,1,4.23.35,4.41,4.41,0,0,1,2.62,2.62,12.63,12.63,0,0,1,.35,4.22v40.78a12.63,12.63,0,0,1-.35,4.22,4.41,4.41,0,0,1-2.62,2.62,12.36,12.36,0,0,1-4.23.36H27.53c-2.11,0-3.38,0-4.22-.36a4.36,4.36,0,0,1-2.62-2.62c-.36-.84-.36-2.11-.36-4.22V350.83c0-2.11,0-3.38.36-4.22A4.36,4.36,0,0,1,23.31,344,12.63,12.63,0,0,1,27.53,343.64Z"
        />
      </g>
      <g className="cls-27">
        <polygon
          className="cls-10"
          points="68.41 180.23 58.04 193.74 52.87 187.01 44.65 197.71 41.16 193.17 26.79 211.88 33.77 211.88 44.1 211.88 55.53 211.88 71.97 211.88 92.72 211.88 68.41 180.23"
        />
      </g>
      <g className="cls-28">
        <path
          className="cls-10"
          d="M39.7,296.94H74.21v1H39.7Zm0-7.3H74.21v1H39.7Zm2.48-10a.79.79,0,0,1,.91.91.79.79,0,1,1-.91-.91Zm-3.64,0a.8.8,0,0,1,.92.91.83.83,0,0,1-.66.67.81.81,0,0,1-.92-.92A.82.82,0,0,1,38.54,279.6Zm28.27-1.31h4.58l3.46,4.88H70.27Zm-9,0h4.58l3.46,4.88H61.25Zm-9,0h4.58l3.46,4.88H52.23Zm-4.44,0,3.46,4.88H44.33Zm-6.48-4.15a.79.79,0,0,1,.79.79.79.79,0,0,1-.79.8.8.8,0,0,1-.8-.8A.79.79,0,0,1,37.85,274.14Zm6.44-3.87,4.61,3.82-4.43,1.18-4.6-3.82ZM53,267.94l4.61,3.82-4.42,1.18-4.61-3.82Zm8.72-2.34,4.61,3.82-4.43,1.19-4.61-3.82Zm8.71-2.33L75,267.09l-4.42,1.19L66,264.46Zm5.28-2.41-41,11,1.72,6.26V302A3.57,3.57,0,0,0,40,305.58H73.77A3.57,3.57,0,0,0,77.34,302V277.16H43.5l-.3-.41,34.36-9.18Z"
        />
      </g>
      <g className="cls-29">
        <path
          className="cls-10"
          d="M54.54,361.43v31.05h6.27V361.43Zm26.1-8.05L62,360.67v30.62L80.64,384Zm-45.93,0V384l18.62,7.29V360.67ZM42.44,350l-.94.46L54,355.32a4,4,0,0,1,2.17,2.84,7.06,7.06,0,0,0-2.84-2.07l-13-5.13-.93.45,13.59,5.38a6.27,6.27,0,0,1,2.56,1.86L38.31,352l-.93.45,19.75,7.63v-.55a6.66,6.66,0,0,0-.46-2.36,4.47,4.47,0,0,0-2.34-2.52Zm30.49,0L61,354.62h0a4.47,4.47,0,0,0-2.34,2.52,6.66,6.66,0,0,0-.46,2.36v.55L78,352.42,77,352l-17.3,6.69a6.23,6.23,0,0,1,2.55-1.86l13.61-5.38L75,351l-13,5.13h0a7.06,7.06,0,0,0-2.84,2.07,4,4,0,0,1,2.17-2.84l12.54-4.91Z"
        />
      </g>
      <g className="cls-30">
        <path
          className="cls-10"
          d="M390.42,95.42H500.93c4.6,0,7.36,0,9.2.77a9.58,9.58,0,0,1,5.72,5.71c.76,1.85.76,4.61.76,9.21v282c0,4.6,0,7.36-.76,9.21a9.58,9.58,0,0,1-5.72,5.71c-1.84.77-4.6.77-9.2.77H390.42c-4.6,0-7.37,0-9.21-.77a9.59,9.59,0,0,1-5.71-5.71c-.77-1.85-.77-4.61-.77-9.21v-282c0-4.6,0-7.36.77-9.21a9.59,9.59,0,0,1,5.71-5.71C383.05,95.42,385.82,95.42,390.42,95.42Z"
        />
      </g>
      <g className="cls-31">
        <path
          className="cls-32"
          d="M395,107a7.95,7.95,0,1,0,0,15.89h15.9a7.95,7.95,0,1,0,0-15.89Z"
        />
      </g>
      <g className="cls-33">
        <path
          className="cls-32"
          d="M437.78,107a7.95,7.95,0,1,0,0,15.89h15.9a7.95,7.95,0,1,0,0-15.89Z"
        />
      </g>
      <g className="cls-34">
        <path
          className="cls-32"
          d="M480.45,107a7.95,7.95,0,1,0,0,15.89h15.89a7.95,7.95,0,1,0,0-15.89Z"
        />
      </g>
      <g className="cls-35">
        <circle className="cls-93" cx="345" cy="178.42" r="9.95" />
      </g>
      <g className="cls-36">
        <circle className="cls-93" cx="345" cy="265.59" r="9.95" />
      </g>
      <g className="cls-37">
        <circle className="cls-93" cx="345" cy="353.59" r="9.95" />
      </g>
      <g className="cls-38">
        <rect
          className="cls-39"
          x="10.33"
          y="48.25"
          width="506.8"
          height="33.87"
        />
      </g>
      <g className="cls-40">
        <path
          className="cls-10"
          d="M344.65,182.82h0s0,0,0,0v.39a.2.2,0,1,0,.4,0v-.39a0,0,0,0,0,0-.05Zm.88,0h-.3a0,0,0,0,0-.05.05v.39a.21.21,0,0,0,.2.22.22.22,0,0,0,.2-.23v-.39a0,0,0,0,0,0,0Zm.52,0-.25,0a.05.05,0,0,0-.05.05v.4h0a.18.18,0,1,0,.35,0v-.42s0,0,0,0h0Zm-1.92,0s0,0,0,0a.05.05,0,0,0,0,0v.42h0a.18.18,0,1,0,.35,0v-.4a0,0,0,0,0-.05-.05l-.25,0Zm2.44-.07-.26,0a0,0,0,0,0-.05.05v.41h0a.2.2,0,0,0,.18.21.21.21,0,0,0,.18-.21v-.45a.05.05,0,0,0,0,0h0Zm-3,0h0s0,0,0,0v.45h0a.18.18,0,1,0,.36,0v-.41a0,0,0,0,0-.05-.05l-.26,0Zm3.49-.12h0l-.23.07a0,0,0,0,0,0,.05V183h0c0,.12.07.22.16.22a.2.2,0,0,0,.17-.22v-.34a.05.05,0,0,0,0,0Zm-4,0h0s0,0,0,0V183c0,.12.07.22.16.22s.17-.16.17-.22v-.28a.07.07,0,0,0,0-.05l-.23-.06Zm-.36-.13s0,0,0,0v.22c0,.16.05.24.09.24s.09-.06.09-.13v-.26a.05.05,0,0,0,0-.06l-.09,0Zm4.7,0h0l-.08,0s-.05,0-.05.07v.26h0c0,.08,0,.14.09.14s.09-.08.1-.26h0v-.21S347.46,182.45,347.44,182.45Zm-1.51-.52a.2.2,0,0,0-.18.21v.45s0,0,0,0l0,0,.26,0s0,0,0-.05v-.42A.2.2,0,0,0,345.93,181.93Zm-2.19,0a.2.2,0,0,0-.18.22v.34s0,0,0,0l.27.05h0a.05.05,0,0,0,0,0v-.39A.21.21,0,0,0,343.74,181.93Zm2.71,0a.2.2,0,0,0-.18.22v.39s0,0,0,0,0,0,0,0l.27-.05a0,0,0,0,0,0,0v-.34A.21.21,0,0,0,346.45,181.93Zm-2.2,0a.2.2,0,0,0-.17.22v.42a.07.07,0,0,0,0,.05l.26,0,0,0a0,0,0,0,0,0,0v-.45A.19.19,0,0,0,344.25,181.93Zm.55,0a.22.22,0,0,0-.2.23v.45a0,0,0,0,0,0,.05H345a.05.05,0,0,0,.05,0v-.49A.21.21,0,0,0,344.8,181.92Zm.58,0a.21.21,0,0,0-.2.2v.48a0,0,0,0,0,.05.05h.3a0,0,0,0,0,.05-.05v-.45A.22.22,0,0,0,345.38,181.92Zm-2.16,0a.2.2,0,0,0-.17.22v.25a0,0,0,0,0,0,0l.24.07s0,0,0,0l0,0v-.32h0C343.38,182,343.31,181.9,343.22,181.9Zm3.74,0c-.09,0-.16.1-.16.22v.31s0,0,0,0l.05,0,.24-.07a.09.09,0,0,0,0,0v-.25A.2.2,0,0,0,347,181.9Zm.44-.05c-.09,0-.1.15-.1.27v.17a0,0,0,0,0,0,0h0l.11,0a.08.08,0,0,0,0-.06V182C347.49,181.91,347.45,181.85,347.4,181.85Zm-4.62,0s-.09.06-.09.13v.23s0,0,0,.06l.11,0s0,0,0,0v-.17h0C342.88,181.93,342.83,181.85,342.78,181.85Zm-.85-1.15a.39.39,0,0,0-.39.39v1.75a1.87,1.87,0,0,0,.6,1.38l1,.9a2.1,2.1,0,0,0,1.46.67h1a2.14,2.14,0,0,0,1.46-.67l1-.9a1.91,1.91,0,0,0,.6-1.38v-1.75a.4.4,0,0,0-.4-.39h-.2v.93a.72.72,0,0,1-.43.65h0v.39c0,.31-.12.42-.24.42a.12.12,0,0,1-.08,0s0,0-.05,0a.33.33,0,0,1-.3.25.27.27,0,0,1-.15-.05s0,0,0,0a.35.35,0,0,1-.32.26.33.33,0,0,1-.21-.09s-.05,0-.07,0a.31.31,0,0,1-.24.12.32.32,0,0,1-.22-.1s-.05,0-.07,0a.36.36,0,0,1-.25.11.34.34,0,0,1-.26-.12,0,0,0,0,0-.07,0,.34.34,0,0,1-.26.12.41.41,0,0,1-.25-.11,0,0,0,0,0-.07,0,.32.32,0,0,1-.22.1.3.3,0,0,1-.24-.12s-.06,0-.07,0a.36.36,0,0,1-.21.09.35.35,0,0,1-.32-.26s0,0,0,0a.3.3,0,0,1-.15.05.32.32,0,0,1-.3-.25s0,0-.05,0a.11.11,0,0,1-.08,0c-.12,0-.25-.11-.25-.42v-.37a.08.08,0,0,0,0,0,.71.71,0,0,1-.39-.63v-.93Zm2.93-2.18c.1,0,.16.18.2.37s.06,0,.07,0,.1-.37.2-.37c.29,0,1.16,2.3.29,2.3a.49.49,0,0,1-.46-.33.07.07,0,0,0-.14,0,.47.47,0,0,1-.45.33C343.7,180.82,344.57,178.52,344.86,178.52Zm2-2h.73a1.14,1.14,0,0,1,1.14,1.13,1.15,1.15,0,0,1-1.14,1.14,1.13,1.13,0,0,1-.48-.11l-.6-.27a1,1,0,0,1-.63-.92A1,1,0,0,1,346.84,176.48Zm-4.23,0h.74a1,1,0,0,1,1,1,1,1,0,0,1-.63.92l-.6.27a1.34,1.34,0,0,1-.48.11,1.14,1.14,0,0,1,0-2.28Zm2.46-5.57a4.33,4.33,0,0,0-4.71,5.07,4,4,0,0,0,.16,1.61.8.8,0,0,1-.06.72,1.2,1.2,0,0,0,.09,1.59l.7.48a.69.69,0,0,0,.41.13h.5a.48.48,0,0,1,.46.54v.64a0,0,0,0,0,0,0h0a.17.17,0,0,1,.1,0,.2.2,0,0,1,.17.11,0,0,0,0,0,.07,0,.31.31,0,0,1,.18-.07.29.29,0,0,1,.24.13h.06a.3.3,0,0,1,.22-.1.33.33,0,0,1,.23.1s.05,0,.07,0a.32.32,0,0,1,.22-.1.33.33,0,0,1,.23.1,0,0,0,0,0,.07,0,.33.33,0,0,1,.25-.11.33.33,0,0,1,.26.13h0s0,0,.05,0h0a.35.35,0,0,1,.26-.13.37.37,0,0,1,.26.12h.07a.29.29,0,0,1,.22-.11.3.3,0,0,1,.23.11h.07a.3.3,0,0,1,.23-.11.32.32,0,0,1,.22.1h0s0,0,0,0a.31.31,0,0,1,.24-.13.29.29,0,0,1,.18.07.06.06,0,0,0,.08,0,.19.19,0,0,1,.17-.11.23.23,0,0,1,.11,0h0s0,0,0,0V181a.49.49,0,0,1,.46-.54h.5a.69.69,0,0,0,.41-.13l.7-.48a1.19,1.19,0,0,0,.1-1.59.83.83,0,0,1-.07-.72,3.77,3.77,0,0,0,.17-1.61,4.33,4.33,0,0,0-4.72-5.07h0Z"
        />
      </g>
      <g className="cls-41" style={{ fill: 'rgb(var(--lotta-text-color))' }}>
        <text className="cls-42" transform="translate(113.81 183.99)">
          <tspan className="cls-43">T</tspan>
          <tspan className="cls-44" x="5.74" y="0">
            e
          </tspan>
          <tspan x="12.68" y="0">
            xt- und{' '}
          </tspan>
          <tspan className="cls-45" x="56.36" y="0">
            Ü
          </tspan>
          <tspan x="66.05" y="0">
            bers
          </tspan>
          <tspan className="cls-46" x="91.17" y="0">
            c
          </tspan>
          <tspan x="97.69" y="0">
            h
          </tspan>
          <tspan className="cls-47" x="104.82" y="0">
            r
          </tspan>
          <tspan x="109.88" y="0">
            i
          </tspan>
          <tspan className="cls-48" x="113.12" y="0">
            f
          </tspan>
          <tspan className="cls-49" x="117.44" y="0">
            t
          </tspan>
          <tspan x="121.1" y="0">
            en
          </tspan>
          <tspan className="cls-50" x="135.42" y="0">
            f
          </tspan>
          <tspan x="139.48" y="0">
            arbe{' '}
          </tspan>
        </text>
        <path
          className="cls-51"
          d="M114.6,206.5v-6.4h2.57a2.37,2.37,0,0,1,1.52.43,1.49,1.49,0,0,1,.55,1.24,1.47,1.47,0,0,1-.3.94,1.55,1.55,0,0,1-.83.54v-.07a1.5,1.5,0,0,1,1.28,1.58,1.56,1.56,0,0,1-.55,1.29,2.48,2.48,0,0,1-1.58.45Zm.73-3.56h1.72a1.78,1.78,0,0,0,1.1-.29,1,1,0,0,0,.36-.84,1,1,0,0,0-.36-.83,1.82,1.82,0,0,0-1.1-.27h-1.72Zm0,2.95h1.87a1.78,1.78,0,0,0,1.11-.28,1,1,0,0,0,.36-.87,1.08,1.08,0,0,0-.36-.88,1.71,1.71,0,0,0-1.11-.3h-1.87Z"
        />
        <path
          className="cls-51"
          d="M124.34,206a2,2,0,0,1-.76.45,3.05,3.05,0,0,1-1,.16,2.57,2.57,0,0,1-1.21-.28,1.91,1.91,0,0,1-.78-.81,3,3,0,0,1,0-2.49,2,2,0,0,1,.75-.82,2.05,2.05,0,0,1,1.11-.3,2,2,0,0,1,1,.26,1.84,1.84,0,0,1,.67.76,2.87,2.87,0,0,1,.23,1.19v.14H121v-.48h3l-.23.33a1.88,1.88,0,0,0-.31-1.21,1.15,1.15,0,0,0-1-.42,1.24,1.24,0,0,0-1,.46,2,2,0,0,0-.38,1.28,1.92,1.92,0,0,0,.4,1.33,1.43,1.43,0,0,0,1.14.45,2.27,2.27,0,0,0,1.46-.53Z"
        />
        <path
          className="cls-51"
          d="M127.06,206.57a2.66,2.66,0,0,1-1.81-.59l.25-.54a2.47,2.47,0,0,0,.74.41,2.53,2.53,0,0,0,.85.13,1.5,1.5,0,0,0,.78-.17.59.59,0,0,0,.26-.51.55.55,0,0,0-.18-.43,1.56,1.56,0,0,0-.59-.26l-.77-.18a1.61,1.61,0,0,1-.87-.45,1,1,0,0,1-.31-.77,1.2,1.2,0,0,1,.21-.7,1.45,1.45,0,0,1,.61-.47,2.27,2.27,0,0,1,.91-.17,2.66,2.66,0,0,1,.9.15,1.82,1.82,0,0,1,.71.44l-.24.53a2.43,2.43,0,0,0-.66-.4,2.13,2.13,0,0,0-.71-.13,1.34,1.34,0,0,0-.75.19.66.66,0,0,0-.1,1,1.24,1.24,0,0,0,.54.25l.76.19a1.83,1.83,0,0,1,.94.44,1.1,1.1,0,0,1,.31.79,1.12,1.12,0,0,1-.48.94A2.18,2.18,0,0,1,127.06,206.57Z"
        />
        <path
          className="cls-51"
          d="M131.9,206.57a2.27,2.27,0,0,1-1.16-.29,2,2,0,0,1-.75-.81,2.65,2.65,0,0,1-.26-1.23A2.73,2.73,0,0,1,130,203a1.91,1.91,0,0,1,.76-.83,2.21,2.21,0,0,1,1.17-.3,2.46,2.46,0,0,1,.89.16,1.89,1.89,0,0,1,.7.43l-.24.54a3,3,0,0,0-.65-.39,1.69,1.69,0,0,0-.66-.13,1.36,1.36,0,0,0-1.09.46,2,2,0,0,0-.4,1.3,1.83,1.83,0,0,0,.4,1.27A1.36,1.36,0,0,0,132,206a1.64,1.64,0,0,0,.65-.13,2.29,2.29,0,0,0,.66-.39l.24.54a2.12,2.12,0,0,1-.72.43A2.75,2.75,0,0,1,131.9,206.57Z"
        />
        <path
          className="cls-51"
          d="M134.45,206.5v-6.62h.73v3l-.12.1a1.6,1.6,0,0,1,.63-.84,1.86,1.86,0,0,1,1-.28c1.09,0,1.63.6,1.63,1.79v2.84h-.73v-2.8a1.42,1.42,0,0,0-.25-.93,1,1,0,0,0-.79-.29,1.34,1.34,0,0,0-1,.39,1.43,1.43,0,0,0-.38,1v2.59Z"
        />
        <path
          className="cls-51"
          d="M139.72,206.5v-3.25c0-.21,0-.43,0-.64s0-.42-.06-.63h.7l.1,1.11-.1,0a1.39,1.39,0,0,1,.54-.9,1.57,1.57,0,0,1,.94-.3H142l.2,0,0,.67a1.43,1.43,0,0,0-.48-.07,1.3,1.3,0,0,0-.75.2,1.18,1.18,0,0,0-.41.53,1.71,1.71,0,0,0-.14.67v2.58Z"
        />
        <path
          className="cls-51"
          d="M142.9,200.06h.89v.83h-.89Zm.07,6.44V202h.73v4.52Z"
        />
        <path
          className="cls-51"
          d="M144.48,202.55V202h2.71v.57Zm2.84-2a1.65,1.65,0,0,0-.47-.08,1,1,0,0,0-.39.08.5.5,0,0,0-.27.28,1.16,1.16,0,0,0-.1.54v5.13h-.73v-5.22a1.47,1.47,0,0,1,.36-1.08,1.34,1.34,0,0,1,1-.36l.3,0a1.55,1.55,0,0,1,.31.06Z"
        />
        <path
          className="cls-51"
          d="M147.31,202.55V202h2.91v.57Zm2.89,3.31v.62a1.59,1.59,0,0,1-.3.06,1.69,1.69,0,0,1-.33,0,1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.38-1.08v-4.31l.73-.27V205a1.24,1.24,0,0,0,.11.56.53.53,0,0,0,.28.27,1,1,0,0,0,.4.08l.25,0Z"
        />
        <path
          className="cls-51"
          d="M152.7,206.57a1.58,1.58,0,0,1-1.22-.45,1.94,1.94,0,0,1-.41-1.33V202h.73v2.79a1.42,1.42,0,0,0,.25.9,1,1,0,0,0,.77.29,1.27,1.27,0,0,0,1-.39,1.44,1.44,0,0,0,.37-1V202h.73v4.52h-.71v-1l.11-.05a1.56,1.56,0,0,1-.61.82A1.81,1.81,0,0,1,152.7,206.57Z"
        />
        <path
          className="cls-51"
          d="M156.29,206.5v-3.25c0-.21,0-.43,0-.64s0-.42-.06-.63h.7l.08.93-.09.08a1.5,1.5,0,0,1,.63-.84,1.81,1.81,0,0,1,1-.28c1.09,0,1.63.6,1.63,1.79v2.84h-.73v-2.8a1.42,1.42,0,0,0-.25-.93,1,1,0,0,0-.79-.29,1.34,1.34,0,0,0-1,.39,1.43,1.43,0,0,0-.38,1v2.59Z"
        />
        <path
          className="cls-51"
          d="M163.55,208.51a3.3,3.3,0,0,1-1.78-.47l.12-.59a3.61,3.61,0,0,0,.8.35,3.21,3.21,0,0,0,.86.11,1.3,1.3,0,0,0,1-.35,1.39,1.39,0,0,0,.34-1v-1.22l.1-.12a1.61,1.61,0,0,1-.34.63,1.51,1.51,0,0,1-.56.4,1.81,1.81,0,0,1-.76.15,1.92,1.92,0,0,1-1.05-.29,1.85,1.85,0,0,1-.71-.78,2.81,2.81,0,0,1,0-2.36,1.88,1.88,0,0,1,.71-.79,1.92,1.92,0,0,1,1.05-.28,1.78,1.78,0,0,1,1.07.31,1.54,1.54,0,0,1,.59.87l-.11-.1v-1h.73v4.49a2,2,0,0,1-.52,1.53A2.07,2.07,0,0,1,163.55,208.51Zm-.09-2.75a1.29,1.29,0,0,0,1-.44,2.13,2.13,0,0,0,0-2.4,1.29,1.29,0,0,0-1-.44,1.32,1.32,0,0,0-1.05.44,1.73,1.73,0,0,0-.38,1.2,1.76,1.76,0,0,0,.38,1.21A1.34,1.34,0,0,0,163.46,205.76Z"
        />
        <path
          className="cls-51"
          d="M168.52,206.57a2.62,2.62,0,0,1-1.8-.59l.24-.54a2.6,2.6,0,0,0,.74.41,2.57,2.57,0,0,0,.85.13,1.5,1.5,0,0,0,.78-.17.58.58,0,0,0,.27-.51.55.55,0,0,0-.18-.43,1.54,1.54,0,0,0-.6-.26l-.76-.18a1.64,1.64,0,0,1-.88-.45,1,1,0,0,1-.31-.77,1.2,1.2,0,0,1,.21-.7,1.45,1.45,0,0,1,.61-.47,2.32,2.32,0,0,1,.92-.17,2.74,2.74,0,0,1,.9.15,2,2,0,0,1,.71.44L170,203a2.29,2.29,0,0,0-.66-.4,2.07,2.07,0,0,0-.7-.13,1.35,1.35,0,0,0-.76.19.62.62,0,0,0-.26.52.6.6,0,0,0,.16.44,1.29,1.29,0,0,0,.54.25l.77.19a1.88,1.88,0,0,1,.94.44,1.09,1.09,0,0,1,.3.79,1.12,1.12,0,0,1-.48.94A2.18,2.18,0,0,1,168.52,206.57Z"
        />
        <path
          className="cls-51"
          d="M170.78,202.55V202h2.91v.57Zm2.89,3.31v.62a1.59,1.59,0,0,1-.3.06,1.69,1.69,0,0,1-.33,0,1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.37-1.08v-4.31l.72-.27V205a1.24,1.24,0,0,0,.11.56.56.56,0,0,0,.28.27,1.07,1.07,0,0,0,.41.08l.24,0Z"
        />
        <path
          className="cls-51"
          d="M178.28,206a2.1,2.1,0,0,1-.76.45,3.1,3.1,0,0,1-1,.16,2.54,2.54,0,0,1-1.21-.28,1.91,1.91,0,0,1-.78-.81,2.59,2.59,0,0,1-.28-1.25,2.73,2.73,0,0,1,.27-1.24,2,2,0,0,1,.75-.82,2.09,2.09,0,0,1,1.12-.3,2,2,0,0,1,1,.26,1.75,1.75,0,0,1,.66.76,2.87,2.87,0,0,1,.23,1.19v.14h-3.42v-.48h3l-.24.33a1.82,1.82,0,0,0-.31-1.21,1.15,1.15,0,0,0-1-.42,1.26,1.26,0,0,0-1,.46,2.43,2.43,0,0,0,0,2.61,1.45,1.45,0,0,0,1.15.45,2.17,2.17,0,0,0,.76-.13,2.26,2.26,0,0,0,.7-.4Z"
        />
        <path
          className="cls-51"
          d="M179.7,206.5h-.89l1.88-2.33.42-.53,1.32-1.66h.89l-1.76,2.19-.45.55Zm2.85,0-1.44-1.78-.42-.55L178.92,202h.88l1.31,1.66.45.53,1.86,2.33Z"
        />
        <path
          className="cls-51"
          d="M183.59,202.55V202h2.91v.57Zm2.89,3.31v.62a1.59,1.59,0,0,1-.3.06,1.69,1.69,0,0,1-.33,0,1.36,1.36,0,0,1-1-.36,1.43,1.43,0,0,1-.38-1.08v-4.31l.73-.27V205a1.4,1.4,0,0,0,.1.56.58.58,0,0,0,.29.27,1,1,0,0,0,.4.08l.25,0Z"
        />
        <path
          className="cls-51"
          d="M189.82,206.5v-6.4h2.57a2.37,2.37,0,0,1,1.52.43,1.49,1.49,0,0,1,.55,1.24,1.47,1.47,0,0,1-.3.94,1.55,1.55,0,0,1-.83.54v-.07a1.57,1.57,0,0,1,.94.53,1.6,1.6,0,0,1,.34,1,1.56,1.56,0,0,1-.55,1.29,2.48,2.48,0,0,1-1.58.45Zm.73-3.56h1.73a1.75,1.75,0,0,0,1.09-.29,1,1,0,0,0,.36-.84,1,1,0,0,0-.36-.83,1.8,1.8,0,0,0-1.09-.27h-1.73Zm0,2.95h1.87a1.78,1.78,0,0,0,1.11-.28,1,1,0,0,0,.36-.87,1.08,1.08,0,0,0-.36-.88,1.71,1.71,0,0,0-1.11-.3h-1.87Z"
        />
        <path
          className="cls-51"
          d="M199.57,206a2.15,2.15,0,0,1-.77.45,3,3,0,0,1-.94.16,2.59,2.59,0,0,1-1.22-.28,2,2,0,0,1-.78-.81,3,3,0,0,1,0-2.49,2,2,0,0,1,.75-.82,2.05,2.05,0,0,1,1.11-.3,2,2,0,0,1,1,.26,1.84,1.84,0,0,1,.67.76,2.87,2.87,0,0,1,.23,1.19v.14h-3.42v-.48h3l-.23.33a1.88,1.88,0,0,0-.31-1.21,1.15,1.15,0,0,0-1-.42,1.24,1.24,0,0,0-1,.46,2.38,2.38,0,0,0,0,2.61,1.43,1.43,0,0,0,1.14.45,2.27,2.27,0,0,0,1.46-.53Z"
        />
        <path
          className="cls-51"
          d="M202.28,206.57a2.66,2.66,0,0,1-1.81-.59l.25-.54a2.47,2.47,0,0,0,.74.41,2.53,2.53,0,0,0,.85.13,1.5,1.5,0,0,0,.78-.17.57.57,0,0,0,.26-.51.55.55,0,0,0-.18-.43,1.49,1.49,0,0,0-.59-.26l-.76-.18a1.61,1.61,0,0,1-.88-.45,1,1,0,0,1-.31-.77,1.2,1.2,0,0,1,.21-.7,1.45,1.45,0,0,1,.61-.47,2.27,2.27,0,0,1,.91-.17,2.66,2.66,0,0,1,.9.15,1.82,1.82,0,0,1,.71.44l-.24.53a2.29,2.29,0,0,0-.66-.4,2.08,2.08,0,0,0-.71-.13,1.34,1.34,0,0,0-.75.19.62.62,0,0,0-.26.52.6.6,0,0,0,.16.44,1.24,1.24,0,0,0,.54.25l.76.19a1.83,1.83,0,0,1,.94.44,1.06,1.06,0,0,1,.31.79,1.12,1.12,0,0,1-.48.94A2.18,2.18,0,0,1,202.28,206.57Z"
        />
        <path
          className="cls-51"
          d="M207.12,206.57a2.27,2.27,0,0,1-1.16-.29,2,2,0,0,1-.75-.81,2.79,2.79,0,0,1-.26-1.23,2.73,2.73,0,0,1,.27-1.24,1.91,1.91,0,0,1,.76-.83,2.21,2.21,0,0,1,1.17-.3,2.46,2.46,0,0,1,.89.16,1.89,1.89,0,0,1,.7.43l-.24.54a3,3,0,0,0-.65-.39,1.65,1.65,0,0,0-.66-.13,1.36,1.36,0,0,0-1.09.46,2,2,0,0,0-.4,1.3,1.83,1.83,0,0,0,.4,1.27,1.37,1.37,0,0,0,1.09.45,1.64,1.64,0,0,0,.65-.13,2.29,2.29,0,0,0,.66-.39l.24.54a2.12,2.12,0,0,1-.72.43A2.75,2.75,0,0,1,207.12,206.57Z"
        />
        <path
          className="cls-51"
          d="M209.67,206.5v-6.62h.73v3l-.12.1a1.6,1.6,0,0,1,.63-.84,1.86,1.86,0,0,1,1-.28c1.09,0,1.63.6,1.63,1.79v2.84h-.73v-2.8a1.42,1.42,0,0,0-.25-.93,1,1,0,0,0-.79-.29,1.34,1.34,0,0,0-1,.39,1.43,1.43,0,0,0-.38,1v2.59Z"
        />
        <path
          className="cls-51"
          d="M214.94,206.5v-3.25c0-.21,0-.43,0-.64s0-.42-.06-.63h.7l.1,1.11-.1,0a1.39,1.39,0,0,1,.54-.9,1.57,1.57,0,0,1,.94-.3h.22l.2,0,0,.67a1.43,1.43,0,0,0-.48-.07,1.3,1.3,0,0,0-.75.2,1.18,1.18,0,0,0-.41.53,1.7,1.7,0,0,0-.13.67v2.58Z"
        />
        <path
          className="cls-51"
          d="M218.12,200.06H219v.83h-.89Zm.07,6.44V202h.73v4.52Z"
        />
        <path
          className="cls-51"
          d="M219.7,202.55V202h2.72v.57Zm2.84-2a1.65,1.65,0,0,0-.47-.08,1,1,0,0,0-.39.08.53.53,0,0,0-.27.28,1.16,1.16,0,0,0-.1.54v5.13h-.73v-5.22a1.47,1.47,0,0,1,.36-1.08,1.34,1.34,0,0,1,1-.36l.31,0a1.59,1.59,0,0,1,.3.06Z"
        />
        <path
          className="cls-51"
          d="M222.53,202.55V202h2.91v.57Zm2.89,3.31v.62a1.59,1.59,0,0,1-.3.06,1.69,1.69,0,0,1-.33,0,1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.38-1.08v-4.31l.73-.27V205a1.24,1.24,0,0,0,.11.56.56.56,0,0,0,.28.27,1.07,1.07,0,0,0,.41.08l.24,0Z"
        />
        <path
          className="cls-51"
          d="M227.92,206.57a1.58,1.58,0,0,1-1.22-.45,1.94,1.94,0,0,1-.41-1.33V202H227v2.79a1.36,1.36,0,0,0,.26.9,1,1,0,0,0,.76.29,1.27,1.27,0,0,0,1-.39,1.44,1.44,0,0,0,.37-1V202h.73v4.52h-.71v-1l.11-.05a1.56,1.56,0,0,1-.61.82A1.81,1.81,0,0,1,227.92,206.57Z"
        />
        <path
          className="cls-51"
          d="M231.51,206.5v-3.25c0-.21,0-.43,0-.64s0-.42-.06-.63h.7l.08.93-.09.08a1.5,1.5,0,0,1,.63-.84,1.81,1.81,0,0,1,1-.28c1.09,0,1.63.6,1.63,1.79v2.84h-.73v-2.8a1.42,1.42,0,0,0-.25-.93,1,1,0,0,0-.79-.29,1.34,1.34,0,0,0-1,.39,1.43,1.43,0,0,0-.38,1v2.59Z"
        />
        <path
          className="cls-51"
          d="M238.77,208.51A3.3,3.3,0,0,1,237,208l.12-.59a3.61,3.61,0,0,0,.8.35,3.26,3.26,0,0,0,.86.11,1.3,1.3,0,0,0,1-.35,1.39,1.39,0,0,0,.34-1v-1.22l.1-.12a1.61,1.61,0,0,1-.34.63,1.51,1.51,0,0,1-.56.4,1.81,1.81,0,0,1-.76.15,1.92,1.92,0,0,1-1.05-.29,1.85,1.85,0,0,1-.71-.78,2.81,2.81,0,0,1,0-2.36,1.88,1.88,0,0,1,.71-.79,1.92,1.92,0,0,1,1.05-.28,1.78,1.78,0,0,1,1.07.31,1.54,1.54,0,0,1,.59.87l-.11-.1v-1h.73v4.49a2,2,0,0,1-.52,1.53A2.07,2.07,0,0,1,238.77,208.51Zm-.09-2.75a1.29,1.29,0,0,0,1-.44,2.13,2.13,0,0,0,0-2.4,1.29,1.29,0,0,0-1-.44,1.32,1.32,0,0,0-1.05.44,1.73,1.73,0,0,0-.38,1.2,1.76,1.76,0,0,0,.38,1.21A1.34,1.34,0,0,0,238.68,205.76Z"
        />
        <path
          className="cls-51"
          d="M243.75,206.57a2.63,2.63,0,0,1-1.81-.59l.24-.54a2.6,2.6,0,0,0,.74.41,2.57,2.57,0,0,0,.85.13,1.5,1.5,0,0,0,.78-.17.58.58,0,0,0,.27-.51.55.55,0,0,0-.18-.43,1.54,1.54,0,0,0-.6-.26l-.76-.18a1.64,1.64,0,0,1-.88-.45,1,1,0,0,1-.31-.77,1.14,1.14,0,0,1,.22-.7,1.36,1.36,0,0,1,.6-.47,2.32,2.32,0,0,1,.92-.17,2.74,2.74,0,0,1,.9.15,1.9,1.9,0,0,1,.71.44l-.25.53a2.29,2.29,0,0,0-.66-.4,2.07,2.07,0,0,0-.7-.13,1.35,1.35,0,0,0-.76.19.62.62,0,0,0-.26.52.57.57,0,0,0,.17.44,1.25,1.25,0,0,0,.53.25l.77.19a1.88,1.88,0,0,1,.94.44,1.09,1.09,0,0,1,.3.79,1.12,1.12,0,0,1-.48.94A2.17,2.17,0,0,1,243.75,206.57Z"
        />
        <path
          className="cls-51"
          d="M246,202.55V202h2.91v.57Zm2.89,3.31v.62a1.59,1.59,0,0,1-.3.06,1.69,1.69,0,0,1-.33,0,1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.37-1.08v-4.31l.72-.27V205a1.24,1.24,0,0,0,.11.56.56.56,0,0,0,.28.27,1.07,1.07,0,0,0,.41.08l.24,0Z"
        />
        <path
          className="cls-51"
          d="M253.5,206a2.1,2.1,0,0,1-.76.45,3.1,3.1,0,0,1-1,.16,2.54,2.54,0,0,1-1.21-.28,1.91,1.91,0,0,1-.78-.81,2.59,2.59,0,0,1-.28-1.25,2.73,2.73,0,0,1,.27-1.24,2,2,0,0,1,.75-.82,2.11,2.11,0,0,1,1.12-.3,2,2,0,0,1,1,.26,1.75,1.75,0,0,1,.66.76,2.72,2.72,0,0,1,.23,1.19v.14h-3.42v-.48h3l-.24.33a1.82,1.82,0,0,0-.31-1.21,1.13,1.13,0,0,0-1-.42,1.26,1.26,0,0,0-1,.46,2.05,2.05,0,0,0-.37,1.28,2,2,0,0,0,.39,1.33,1.45,1.45,0,0,0,1.15.45,2.17,2.17,0,0,0,.76-.13,2.26,2.26,0,0,0,.7-.4Z"
        />
        <path
          className="cls-51"
          d="M254.92,206.5H254l1.88-2.33.43-.53,1.31-1.66h.89l-1.76,2.19-.44.55Zm2.85,0-1.43-1.78-.43-.55L254.14,202H255l1.32,1.66.44.53,1.86,2.33Z"
        />
        <path
          className="cls-51"
          d="M258.81,202.55V202h2.91v.57Zm2.89,3.31v.62a1.59,1.59,0,0,1-.3.06,1.69,1.69,0,0,1-.33,0,1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.38-1.08v-4.31l.73-.27V205a1.24,1.24,0,0,0,.11.56.53.53,0,0,0,.28.27,1,1,0,0,0,.4.08l.25,0Z"
        />
        <path
          className="cls-51"
          d="M265,206.5v-6.4h2.57a2.37,2.37,0,0,1,1.52.43,1.49,1.49,0,0,1,.55,1.24,1.47,1.47,0,0,1-.3.94,1.55,1.55,0,0,1-.83.54v-.07a1.57,1.57,0,0,1,.94.53,1.6,1.6,0,0,1,.35,1,1.57,1.57,0,0,1-.56,1.29,2.46,2.46,0,0,1-1.58.45Zm.73-3.56h1.73a1.75,1.75,0,0,0,1.09-.29,1,1,0,0,0,.36-.84,1,1,0,0,0-.36-.83,1.8,1.8,0,0,0-1.09-.27h-1.73Zm0,2.95h1.87a1.78,1.78,0,0,0,1.11-.28,1,1,0,0,0,.36-.87,1.08,1.08,0,0,0-.36-.88,1.71,1.71,0,0,0-1.11-.3h-1.87Z"
        />
        <path
          className="cls-51"
          d="M274.79,206a2.19,2.19,0,0,1-.76.45,3.1,3.1,0,0,1-.95.16,2.59,2.59,0,0,1-1.22-.28,2,2,0,0,1-.78-.81,3,3,0,0,1,0-2.49,2,2,0,0,1,.75-.82,2.21,2.21,0,0,1,2.15,0,1.89,1.89,0,0,1,.66.76,2.87,2.87,0,0,1,.23,1.19v.14h-3.42v-.48h3l-.23.33a1.88,1.88,0,0,0-.31-1.21,1.15,1.15,0,0,0-1-.42,1.24,1.24,0,0,0-1,.46,2.43,2.43,0,0,0,0,2.61,1.43,1.43,0,0,0,1.14.45,2.22,2.22,0,0,0,1.46-.53Z"
        />
        <path
          className="cls-51"
          d="M277.5,206.57a2.66,2.66,0,0,1-1.81-.59l.25-.54a2.47,2.47,0,0,0,.74.41,2.57,2.57,0,0,0,.85.13,1.5,1.5,0,0,0,.78-.17.57.57,0,0,0,.26-.51.55.55,0,0,0-.18-.43,1.49,1.49,0,0,0-.59-.26l-.76-.18a1.61,1.61,0,0,1-.88-.45,1,1,0,0,1-.31-.77,1.2,1.2,0,0,1,.21-.7,1.45,1.45,0,0,1,.61-.47,2.27,2.27,0,0,1,.91-.17,2.66,2.66,0,0,1,.9.15,1.82,1.82,0,0,1,.71.44L279,203a2.29,2.29,0,0,0-.66-.4,2.08,2.08,0,0,0-.71-.13,1.34,1.34,0,0,0-.75.19.62.62,0,0,0-.26.52.6.6,0,0,0,.16.44,1.24,1.24,0,0,0,.54.25l.76.19a1.91,1.91,0,0,1,1,.44,1.09,1.09,0,0,1,.3.79,1.12,1.12,0,0,1-.48.94A2.18,2.18,0,0,1,277.5,206.57Z"
        />
        <path
          className="cls-51"
          d="M282.34,206.57a2.27,2.27,0,0,1-1.16-.29,2,2,0,0,1-.75-.81,2.79,2.79,0,0,1-.26-1.23,2.73,2.73,0,0,1,.27-1.24,1.91,1.91,0,0,1,.76-.83,2.21,2.21,0,0,1,1.17-.3,2.46,2.46,0,0,1,.89.16,2,2,0,0,1,.71.43l-.25.54a3,3,0,0,0-.65-.39,1.65,1.65,0,0,0-.66-.13,1.36,1.36,0,0,0-1.09.46,2,2,0,0,0-.4,1.3,1.88,1.88,0,0,0,.4,1.27,1.37,1.37,0,0,0,1.09.45,1.72,1.72,0,0,0,.66-.13,2.38,2.38,0,0,0,.65-.39l.25.54a2.27,2.27,0,0,1-.73.43A2.75,2.75,0,0,1,282.34,206.57Z"
        />
        <path
          className="cls-51"
          d="M284.89,206.5v-6.62h.73v3l-.12.1a1.6,1.6,0,0,1,.63-.84,1.86,1.86,0,0,1,1-.28c1.09,0,1.63.6,1.63,1.79v2.84h-.73v-2.8a1.42,1.42,0,0,0-.25-.93,1,1,0,0,0-.79-.29,1.34,1.34,0,0,0-1,.39,1.43,1.43,0,0,0-.38,1v2.59Z"
        />
        <path
          className="cls-51"
          d="M290.16,206.5v-3.25c0-.21,0-.43,0-.64s0-.42-.06-.63h.7l.1,1.11-.1,0a1.39,1.39,0,0,1,.54-.9,1.57,1.57,0,0,1,.94-.3h.22l.2,0,0,.67a1.43,1.43,0,0,0-.48-.07,1.3,1.3,0,0,0-.75.2,1.18,1.18,0,0,0-.41.53,1.7,1.7,0,0,0-.13.67v2.58Z"
        />
        <path
          className="cls-51"
          d="M293.34,200.06h.89v.83h-.89Zm.07,6.44V202h.73v4.52Z"
        />
        <path
          className="cls-51"
          d="M294.92,202.55V202h2.72v.57Zm2.84-2a1.65,1.65,0,0,0-.47-.08,1,1,0,0,0-.39.08.53.53,0,0,0-.27.28,1.16,1.16,0,0,0-.1.54v5.13h-.73v-5.22a1.47,1.47,0,0,1,.36-1.08,1.34,1.34,0,0,1,1-.36l.31,0a1.59,1.59,0,0,1,.3.06Z"
        />
        <path
          className="cls-51"
          d="M297.75,202.55V202h2.91v.57Zm2.89,3.31v.62a1.59,1.59,0,0,1-.3.06,1.69,1.69,0,0,1-.33,0,1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.38-1.08v-4.31l.73-.27V205a1.24,1.24,0,0,0,.11.56.56.56,0,0,0,.28.27,1.07,1.07,0,0,0,.41.08l.24,0Z"
        />
        <path
          className="cls-51"
          d="M303.14,206.57a1.58,1.58,0,0,1-1.22-.45,1.94,1.94,0,0,1-.41-1.33V202h.73v2.79a1.36,1.36,0,0,0,.26.9,1,1,0,0,0,.76.29,1.27,1.27,0,0,0,1-.39,1.44,1.44,0,0,0,.37-1V202h.73v4.52h-.71v-1l.11-.05a1.56,1.56,0,0,1-.61.82A1.79,1.79,0,0,1,303.14,206.57Z"
        />
        <path
          className="cls-51"
          d="M306.73,206.5v-3.25c0-.21,0-.43,0-.64s0-.42-.06-.63h.7l.08.93-.09.08a1.5,1.5,0,0,1,.63-.84,1.81,1.81,0,0,1,1-.28c1.09,0,1.63.6,1.63,1.79v2.84h-.73v-2.8a1.42,1.42,0,0,0-.25-.93,1,1,0,0,0-.79-.29,1.34,1.34,0,0,0-1,.39,1.43,1.43,0,0,0-.38,1v2.59Z"
        />
        <path
          className="cls-51"
          d="M314,208.51a3.3,3.3,0,0,1-1.78-.47l.12-.59a3.61,3.61,0,0,0,.8.35,3.26,3.26,0,0,0,.86.11,1.3,1.3,0,0,0,1-.35,1.39,1.39,0,0,0,.34-1v-1.22l.1-.12a1.61,1.61,0,0,1-.34.63,1.51,1.51,0,0,1-.56.4,1.81,1.81,0,0,1-.76.15,1.92,1.92,0,0,1-1.05-.29,1.85,1.85,0,0,1-.71-.78,2.81,2.81,0,0,1,0-2.36,1.88,1.88,0,0,1,.71-.79,1.92,1.92,0,0,1,1.05-.28,1.78,1.78,0,0,1,1.07.31,1.54,1.54,0,0,1,.59.87l-.11-.1v-1H316v4.49a2,2,0,0,1-.52,1.53A2.07,2.07,0,0,1,314,208.51Zm-.09-2.75a1.29,1.29,0,0,0,1-.44,2.13,2.13,0,0,0,0-2.4,1.29,1.29,0,0,0-1-.44,1.33,1.33,0,0,0-1,.44,1.78,1.78,0,0,0-.38,1.2,1.81,1.81,0,0,0,.38,1.21A1.36,1.36,0,0,0,313.9,205.76Z"
        />
        <path
          className="cls-51"
          d="M319,206.57a2.63,2.63,0,0,1-1.81-.59l.24-.54a2.6,2.6,0,0,0,.74.41,2.57,2.57,0,0,0,.85.13,1.5,1.5,0,0,0,.78-.17.58.58,0,0,0,.27-.51.55.55,0,0,0-.18-.43,1.54,1.54,0,0,0-.6-.26l-.76-.18a1.64,1.64,0,0,1-.88-.45,1,1,0,0,1-.31-.77,1.14,1.14,0,0,1,.22-.7,1.36,1.36,0,0,1,.6-.47,2.32,2.32,0,0,1,.92-.17,2.74,2.74,0,0,1,.9.15,1.9,1.9,0,0,1,.71.44l-.25.53a2.29,2.29,0,0,0-.66-.4,2.07,2.07,0,0,0-.7-.13,1.35,1.35,0,0,0-.76.19.62.62,0,0,0-.26.52.57.57,0,0,0,.17.44,1.19,1.19,0,0,0,.53.25l.77.19a1.88,1.88,0,0,1,.94.44,1.09,1.09,0,0,1,.3.79,1.12,1.12,0,0,1-.48.94A2.17,2.17,0,0,1,319,206.57Z"
        />
        <path
          className="cls-51"
          d="M321.22,202.55V202h2.91v.57Zm2.89,3.31v.62a1.59,1.59,0,0,1-.3.06,1.69,1.69,0,0,1-.33,0,1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.37-1.08v-4.31l.73-.27V205a1.25,1.25,0,0,0,.1.56.56.56,0,0,0,.28.27,1.07,1.07,0,0,0,.41.08l.24,0Z"
        />
        <path
          className="cls-51"
          d="M328.72,206a2.1,2.1,0,0,1-.76.45,3.05,3.05,0,0,1-.95.16,2.54,2.54,0,0,1-1.21-.28,1.91,1.91,0,0,1-.78-.81,2.59,2.59,0,0,1-.28-1.25A2.73,2.73,0,0,1,325,203a2,2,0,0,1,.76-.82,2.05,2.05,0,0,1,1.11-.3,2,2,0,0,1,1,.26,1.75,1.75,0,0,1,.66.76,2.72,2.72,0,0,1,.23,1.19v.14h-3.42v-.48h3l-.24.33a1.82,1.82,0,0,0-.31-1.21,1.13,1.13,0,0,0-.95-.42,1.23,1.23,0,0,0-1,.46,2.4,2.4,0,0,0,0,2.61A1.45,1.45,0,0,0,327,206a2.17,2.17,0,0,0,.76-.13,2.26,2.26,0,0,0,.7-.4Z"
        />
        <path
          className="cls-51"
          d="M330.14,206.5h-.89l1.88-2.33.43-.53,1.31-1.66h.89L332,204.17l-.44.55Zm2.85,0-1.43-1.78-.43-.55L329.36,202h.88l1.32,1.66.44.53,1.86,2.33Z"
        />
        <path
          className="cls-51"
          d="M334,202.55V202h2.91v.57Zm2.89,3.31v.62a1.59,1.59,0,0,1-.3.06,1.69,1.69,0,0,1-.33,0,1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.38-1.08v-4.31l.73-.27V205a1.24,1.24,0,0,0,.11.56.53.53,0,0,0,.28.27,1,1,0,0,0,.4.08l.25,0Z"
        />
        <path
          className="cls-51"
          d="M114.6,217.5v-6.4h2.57a2.37,2.37,0,0,1,1.52.43,1.49,1.49,0,0,1,.55,1.24,1.47,1.47,0,0,1-.3.94,1.55,1.55,0,0,1-.83.54v-.07a1.5,1.5,0,0,1,1.28,1.58,1.56,1.56,0,0,1-.55,1.29,2.48,2.48,0,0,1-1.58.45Zm.73-3.56h1.72a1.78,1.78,0,0,0,1.1-.29,1,1,0,0,0,.36-.84,1,1,0,0,0-.36-.83,1.82,1.82,0,0,0-1.1-.27h-1.72Zm0,2.95h1.87a1.78,1.78,0,0,0,1.11-.28,1,1,0,0,0,.36-.87,1.08,1.08,0,0,0-.36-.88,1.71,1.71,0,0,0-1.11-.3h-1.87Z"
        />
        <path
          className="cls-51"
          d="M124.34,217a2,2,0,0,1-.76.45,3.05,3.05,0,0,1-1,.16,2.57,2.57,0,0,1-1.21-.28,1.91,1.91,0,0,1-.78-.81,3,3,0,0,1,0-2.49,2,2,0,0,1,.75-.82,2.05,2.05,0,0,1,1.11-.3,2,2,0,0,1,1,.26,1.84,1.84,0,0,1,.67.76,2.87,2.87,0,0,1,.23,1.19v.14H121v-.48h3l-.23.33a1.88,1.88,0,0,0-.31-1.21,1.15,1.15,0,0,0-1-.42,1.24,1.24,0,0,0-1,.46,2,2,0,0,0-.38,1.28,1.92,1.92,0,0,0,.4,1.33,1.43,1.43,0,0,0,1.14.45,2.27,2.27,0,0,0,1.46-.53Z"
        />
        <path
          className="cls-51"
          d="M127.06,217.57a2.66,2.66,0,0,1-1.81-.59l.25-.54a2.47,2.47,0,0,0,.74.41,2.53,2.53,0,0,0,.85.13,1.5,1.5,0,0,0,.78-.17.59.59,0,0,0,.26-.51.55.55,0,0,0-.18-.43,1.56,1.56,0,0,0-.59-.26l-.77-.18a1.61,1.61,0,0,1-.87-.45,1,1,0,0,1-.31-.77,1.2,1.2,0,0,1,.21-.7,1.45,1.45,0,0,1,.61-.47,2.27,2.27,0,0,1,.91-.17,2.66,2.66,0,0,1,.9.15,1.82,1.82,0,0,1,.71.44l-.24.53a2.43,2.43,0,0,0-.66-.4,2.13,2.13,0,0,0-.71-.13,1.34,1.34,0,0,0-.75.19.66.66,0,0,0-.1,1,1.24,1.24,0,0,0,.54.25l.76.19a1.83,1.83,0,0,1,.94.44,1.1,1.1,0,0,1,.31.79,1.12,1.12,0,0,1-.48.94A2.18,2.18,0,0,1,127.06,217.57Z"
        />
        <path
          className="cls-51"
          d="M131.9,217.57a2.27,2.27,0,0,1-1.16-.29,2,2,0,0,1-.75-.81,2.65,2.65,0,0,1-.26-1.23A2.73,2.73,0,0,1,130,214a1.91,1.91,0,0,1,.76-.83,2.21,2.21,0,0,1,1.17-.3,2.46,2.46,0,0,1,.89.16,1.89,1.89,0,0,1,.7.43l-.24.54a3,3,0,0,0-.65-.39,1.69,1.69,0,0,0-.66-.13,1.36,1.36,0,0,0-1.09.46,2,2,0,0,0-.4,1.3,1.83,1.83,0,0,0,.4,1.27A1.36,1.36,0,0,0,132,217a1.64,1.64,0,0,0,.65-.13,2.29,2.29,0,0,0,.66-.39l.24.54a2.12,2.12,0,0,1-.72.43A2.75,2.75,0,0,1,131.9,217.57Z"
        />
        <path
          className="cls-51"
          d="M134.45,217.5v-6.62h.73v3l-.12.1a1.6,1.6,0,0,1,.63-.84,1.86,1.86,0,0,1,1-.28c1.09,0,1.63.6,1.63,1.79v2.84h-.73v-2.8a1.42,1.42,0,0,0-.25-.93,1,1,0,0,0-.79-.29,1.34,1.34,0,0,0-1,.39,1.43,1.43,0,0,0-.38,1v2.59Z"
        />
        <path
          className="cls-51"
          d="M139.72,217.5v-3.25c0-.21,0-.43,0-.64s0-.42-.06-.63h.7l.1,1.11-.1,0a1.39,1.39,0,0,1,.54-.9,1.57,1.57,0,0,1,.94-.3H142l.2,0,0,.67a1.43,1.43,0,0,0-.48-.07,1.3,1.3,0,0,0-.75.2,1.18,1.18,0,0,0-.41.53,1.71,1.71,0,0,0-.14.67v2.58Z"
        />
        <path
          className="cls-51"
          d="M142.9,211.06h.89v.83h-.89Zm.07,6.44V213h.73v4.52Z"
        />
        <path
          className="cls-51"
          d="M144.48,213.55V213h2.71v.57Zm2.84-2a1.65,1.65,0,0,0-.47-.08,1,1,0,0,0-.39.08.5.5,0,0,0-.27.28,1.16,1.16,0,0,0-.1.54v5.13h-.73v-5.22a1.47,1.47,0,0,1,.36-1.08,1.34,1.34,0,0,1,1-.36l.3,0a1.55,1.55,0,0,1,.31.06Z"
        />
        <path
          className="cls-51"
          d="M147.31,213.55V213h2.91v.57Zm2.89,3.31v.62a1.59,1.59,0,0,1-.3.06,1.69,1.69,0,0,1-.33,0,1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.38-1.08v-4.31l.73-.27V216a1.24,1.24,0,0,0,.11.56.53.53,0,0,0,.28.27,1,1,0,0,0,.4.08l.25,0Z"
        />
        <path
          className="cls-51"
          d="M152.7,217.57a1.58,1.58,0,0,1-1.22-.45,1.94,1.94,0,0,1-.41-1.33V213h.73v2.79a1.42,1.42,0,0,0,.25.9,1,1,0,0,0,.77.29,1.27,1.27,0,0,0,1-.39,1.44,1.44,0,0,0,.37-1V213h.73v4.52h-.71v-1l.11-.05a1.56,1.56,0,0,1-.61.82A1.81,1.81,0,0,1,152.7,217.57Z"
        />
        <path
          className="cls-51"
          d="M156.29,217.5v-3.25c0-.21,0-.43,0-.64s0-.42-.06-.63h.7l.08.93-.09.08a1.5,1.5,0,0,1,.63-.84,1.81,1.81,0,0,1,1-.28c1.09,0,1.63.6,1.63,1.79v2.84h-.73v-2.8a1.42,1.42,0,0,0-.25-.93,1,1,0,0,0-.79-.29,1.34,1.34,0,0,0-1,.39,1.43,1.43,0,0,0-.38,1v2.59Z"
        />
        <path
          className="cls-51"
          d="M163.55,219.51a3.3,3.3,0,0,1-1.78-.47l.12-.59a3.61,3.61,0,0,0,.8.35,3.21,3.21,0,0,0,.86.11,1.3,1.3,0,0,0,1-.35,1.39,1.39,0,0,0,.34-1v-1.22l.1-.12a1.61,1.61,0,0,1-.34.63,1.51,1.51,0,0,1-.56.4,1.81,1.81,0,0,1-.76.15,1.92,1.92,0,0,1-1.05-.29,1.85,1.85,0,0,1-.71-.78,2.81,2.81,0,0,1,0-2.36,1.88,1.88,0,0,1,.71-.79,1.92,1.92,0,0,1,1.05-.28,1.78,1.78,0,0,1,1.07.31,1.54,1.54,0,0,1,.59.87l-.11-.1v-1h.73v4.49a2,2,0,0,1-.52,1.53A2.07,2.07,0,0,1,163.55,219.51Zm-.09-2.75a1.29,1.29,0,0,0,1-.44,2.13,2.13,0,0,0,0-2.4,1.29,1.29,0,0,0-1-.44,1.32,1.32,0,0,0-1.05.44,1.73,1.73,0,0,0-.38,1.2,1.76,1.76,0,0,0,.38,1.21A1.34,1.34,0,0,0,163.46,216.76Z"
        />
        <path
          className="cls-51"
          d="M168.52,217.57a2.62,2.62,0,0,1-1.8-.59l.24-.54a2.6,2.6,0,0,0,.74.41,2.57,2.57,0,0,0,.85.13,1.5,1.5,0,0,0,.78-.17.58.58,0,0,0,.27-.51.55.55,0,0,0-.18-.43,1.54,1.54,0,0,0-.6-.26l-.76-.18a1.64,1.64,0,0,1-.88-.45,1,1,0,0,1-.31-.77,1.2,1.2,0,0,1,.21-.7,1.45,1.45,0,0,1,.61-.47,2.32,2.32,0,0,1,.92-.17,2.74,2.74,0,0,1,.9.15,2,2,0,0,1,.71.44L170,214a2.29,2.29,0,0,0-.66-.4,2.07,2.07,0,0,0-.7-.13,1.35,1.35,0,0,0-.76.19.62.62,0,0,0-.26.52.6.6,0,0,0,.16.44,1.29,1.29,0,0,0,.54.25l.77.19a1.88,1.88,0,0,1,.94.44,1.09,1.09,0,0,1,.3.79,1.12,1.12,0,0,1-.48.94A2.18,2.18,0,0,1,168.52,217.57Z"
        />
        <path
          className="cls-51"
          d="M170.78,213.55V213h2.91v.57Zm2.89,3.31v.62a1.59,1.59,0,0,1-.3.06,1.69,1.69,0,0,1-.33,0,1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.37-1.08v-4.31l.72-.27V216a1.24,1.24,0,0,0,.11.56.56.56,0,0,0,.28.27,1.07,1.07,0,0,0,.41.08l.24,0Z"
        />
        <path
          className="cls-51"
          d="M178.28,217a2.1,2.1,0,0,1-.76.45,3.1,3.1,0,0,1-1,.16,2.54,2.54,0,0,1-1.21-.28,1.91,1.91,0,0,1-.78-.81,2.59,2.59,0,0,1-.28-1.25,2.73,2.73,0,0,1,.27-1.24,2,2,0,0,1,.75-.82,2.09,2.09,0,0,1,1.12-.3,2,2,0,0,1,1,.26,1.75,1.75,0,0,1,.66.76,2.87,2.87,0,0,1,.23,1.19v.14h-3.42v-.48h3l-.24.33a1.82,1.82,0,0,0-.31-1.21,1.15,1.15,0,0,0-1-.42,1.26,1.26,0,0,0-1,.46,2.43,2.43,0,0,0,0,2.61,1.45,1.45,0,0,0,1.15.45,2.17,2.17,0,0,0,.76-.13,2.26,2.26,0,0,0,.7-.4Z"
        />
        <path
          className="cls-51"
          d="M179.7,217.5h-.89l1.88-2.33.42-.53,1.32-1.66h.89l-1.76,2.19-.45.55Zm2.85,0-1.44-1.78-.42-.55L178.92,213h.88l1.31,1.66.45.53,1.86,2.33Z"
        />
        <path
          className="cls-51"
          d="M183.59,213.55V213h2.91v.57Zm2.89,3.31v.62a1.59,1.59,0,0,1-.3.06,1.69,1.69,0,0,1-.33,0,1.36,1.36,0,0,1-1-.36,1.43,1.43,0,0,1-.38-1.08v-4.31l.73-.27V216a1.4,1.4,0,0,0,.1.56.58.58,0,0,0,.29.27,1,1,0,0,0,.4.08l.25,0Z"
        />
        <path
          className="cls-51"
          d="M189.82,217.5v-6.4h2.57a2.37,2.37,0,0,1,1.52.43,1.49,1.49,0,0,1,.55,1.24,1.47,1.47,0,0,1-.3.94,1.55,1.55,0,0,1-.83.54v-.07a1.57,1.57,0,0,1,.94.53,1.6,1.6,0,0,1,.34,1,1.56,1.56,0,0,1-.55,1.29,2.48,2.48,0,0,1-1.58.45Zm.73-3.56h1.73a1.75,1.75,0,0,0,1.09-.29,1,1,0,0,0,.36-.84,1,1,0,0,0-.36-.83,1.8,1.8,0,0,0-1.09-.27h-1.73Zm0,2.95h1.87a1.78,1.78,0,0,0,1.11-.28,1,1,0,0,0,.36-.87,1.08,1.08,0,0,0-.36-.88,1.71,1.71,0,0,0-1.11-.3h-1.87Z"
        />
        <path
          className="cls-51"
          d="M199.57,217a2.15,2.15,0,0,1-.77.45,3,3,0,0,1-.94.16,2.59,2.59,0,0,1-1.22-.28,2,2,0,0,1-.78-.81,3,3,0,0,1,0-2.49,2,2,0,0,1,.75-.82,2.05,2.05,0,0,1,1.11-.3,2,2,0,0,1,1,.26,1.84,1.84,0,0,1,.67.76,2.87,2.87,0,0,1,.23,1.19v.14h-3.42v-.48h3l-.23.33a1.88,1.88,0,0,0-.31-1.21,1.15,1.15,0,0,0-1-.42,1.24,1.24,0,0,0-1,.46,2.38,2.38,0,0,0,0,2.61,1.43,1.43,0,0,0,1.14.45,2.27,2.27,0,0,0,1.46-.53Z"
        />
        <path
          className="cls-51"
          d="M202.28,217.57a2.66,2.66,0,0,1-1.81-.59l.25-.54a2.47,2.47,0,0,0,.74.41,2.53,2.53,0,0,0,.85.13,1.5,1.5,0,0,0,.78-.17.57.57,0,0,0,.26-.51.55.55,0,0,0-.18-.43,1.49,1.49,0,0,0-.59-.26l-.76-.18a1.61,1.61,0,0,1-.88-.45,1,1,0,0,1-.31-.77,1.2,1.2,0,0,1,.21-.7,1.45,1.45,0,0,1,.61-.47,2.27,2.27,0,0,1,.91-.17,2.66,2.66,0,0,1,.9.15,1.82,1.82,0,0,1,.71.44l-.24.53a2.29,2.29,0,0,0-.66-.4,2.08,2.08,0,0,0-.71-.13,1.34,1.34,0,0,0-.75.19.62.62,0,0,0-.26.52.6.6,0,0,0,.16.44,1.24,1.24,0,0,0,.54.25l.76.19a1.83,1.83,0,0,1,.94.44,1.06,1.06,0,0,1,.31.79,1.12,1.12,0,0,1-.48.94A2.18,2.18,0,0,1,202.28,217.57Z"
        />
        <path
          className="cls-51"
          d="M207.12,217.57a2.27,2.27,0,0,1-1.16-.29,2,2,0,0,1-.75-.81,2.79,2.79,0,0,1-.26-1.23,2.73,2.73,0,0,1,.27-1.24,1.91,1.91,0,0,1,.76-.83,2.21,2.21,0,0,1,1.17-.3,2.46,2.46,0,0,1,.89.16,1.89,1.89,0,0,1,.7.43l-.24.54a3,3,0,0,0-.65-.39,1.65,1.65,0,0,0-.66-.13,1.36,1.36,0,0,0-1.09.46,2,2,0,0,0-.4,1.3,1.83,1.83,0,0,0,.4,1.27,1.37,1.37,0,0,0,1.09.45,1.64,1.64,0,0,0,.65-.13,2.29,2.29,0,0,0,.66-.39l.24.54a2.12,2.12,0,0,1-.72.43A2.75,2.75,0,0,1,207.12,217.57Z"
        />
        <path
          className="cls-51"
          d="M209.67,217.5v-6.62h.73v3l-.12.1a1.6,1.6,0,0,1,.63-.84,1.86,1.86,0,0,1,1-.28c1.09,0,1.63.6,1.63,1.79v2.84h-.73v-2.8a1.42,1.42,0,0,0-.25-.93,1,1,0,0,0-.79-.29,1.34,1.34,0,0,0-1,.39,1.43,1.43,0,0,0-.38,1v2.59Z"
        />
        <path
          className="cls-51"
          d="M214.94,217.5v-3.25c0-.21,0-.43,0-.64s0-.42-.06-.63h.7l.1,1.11-.1,0a1.39,1.39,0,0,1,.54-.9,1.57,1.57,0,0,1,.94-.3h.22l.2,0,0,.67a1.43,1.43,0,0,0-.48-.07,1.3,1.3,0,0,0-.75.2,1.18,1.18,0,0,0-.41.53,1.7,1.7,0,0,0-.13.67v2.58Z"
        />
        <path
          className="cls-51"
          d="M218.12,211.06H219v.83h-.89Zm.07,6.44V213h.73v4.52Z"
        />
        <path
          className="cls-51"
          d="M219.7,213.55V213h2.72v.57Zm2.84-2a1.65,1.65,0,0,0-.47-.08,1,1,0,0,0-.39.08.53.53,0,0,0-.27.28,1.16,1.16,0,0,0-.1.54v5.13h-.73v-5.22a1.47,1.47,0,0,1,.36-1.08,1.34,1.34,0,0,1,1-.36l.31,0a1.59,1.59,0,0,1,.3.06Z"
        />
        <path
          className="cls-51"
          d="M222.53,213.55V213h2.91v.57Zm2.89,3.31v.62a1.59,1.59,0,0,1-.3.06,1.69,1.69,0,0,1-.33,0,1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.38-1.08v-4.31l.73-.27V216a1.24,1.24,0,0,0,.11.56.56.56,0,0,0,.28.27,1.07,1.07,0,0,0,.41.08l.24,0Z"
        />
        <path
          className="cls-51"
          d="M227.92,217.57a1.58,1.58,0,0,1-1.22-.45,1.94,1.94,0,0,1-.41-1.33V213H227v2.79a1.36,1.36,0,0,0,.26.9,1,1,0,0,0,.76.29,1.27,1.27,0,0,0,1-.39,1.44,1.44,0,0,0,.37-1V213h.73v4.52h-.71v-1l.11-.05a1.56,1.56,0,0,1-.61.82A1.81,1.81,0,0,1,227.92,217.57Z"
        />
        <path
          className="cls-51"
          d="M231.51,217.5v-3.25c0-.21,0-.43,0-.64s0-.42-.06-.63h.7l.08.93-.09.08a1.5,1.5,0,0,1,.63-.84,1.81,1.81,0,0,1,1-.28c1.09,0,1.63.6,1.63,1.79v2.84h-.73v-2.8a1.42,1.42,0,0,0-.25-.93,1,1,0,0,0-.79-.29,1.34,1.34,0,0,0-1,.39,1.43,1.43,0,0,0-.38,1v2.59Z"
        />
        <path
          className="cls-51"
          d="M238.77,219.51A3.3,3.3,0,0,1,237,219l.12-.59a3.61,3.61,0,0,0,.8.35,3.26,3.26,0,0,0,.86.11,1.3,1.3,0,0,0,1-.35,1.39,1.39,0,0,0,.34-1v-1.22l.1-.12a1.61,1.61,0,0,1-.34.63,1.51,1.51,0,0,1-.56.4,1.81,1.81,0,0,1-.76.15,1.92,1.92,0,0,1-1.05-.29,1.85,1.85,0,0,1-.71-.78,2.81,2.81,0,0,1,0-2.36,1.88,1.88,0,0,1,.71-.79,1.92,1.92,0,0,1,1.05-.28,1.78,1.78,0,0,1,1.07.31,1.54,1.54,0,0,1,.59.87l-.11-.1v-1h.73v4.49a2,2,0,0,1-.52,1.53A2.07,2.07,0,0,1,238.77,219.51Zm-.09-2.75a1.29,1.29,0,0,0,1-.44,2.13,2.13,0,0,0,0-2.4,1.29,1.29,0,0,0-1-.44,1.32,1.32,0,0,0-1.05.44,1.73,1.73,0,0,0-.38,1.2,1.76,1.76,0,0,0,.38,1.21A1.34,1.34,0,0,0,238.68,216.76Z"
        />
        <path
          className="cls-51"
          d="M243.75,217.57a2.63,2.63,0,0,1-1.81-.59l.24-.54a2.6,2.6,0,0,0,.74.41,2.57,2.57,0,0,0,.85.13,1.5,1.5,0,0,0,.78-.17.58.58,0,0,0,.27-.51.55.55,0,0,0-.18-.43,1.54,1.54,0,0,0-.6-.26l-.76-.18a1.64,1.64,0,0,1-.88-.45,1,1,0,0,1-.31-.77,1.14,1.14,0,0,1,.22-.7,1.36,1.36,0,0,1,.6-.47,2.32,2.32,0,0,1,.92-.17,2.74,2.74,0,0,1,.9.15,1.9,1.9,0,0,1,.71.44l-.25.53a2.29,2.29,0,0,0-.66-.4,2.07,2.07,0,0,0-.7-.13,1.35,1.35,0,0,0-.76.19.62.62,0,0,0-.26.52.57.57,0,0,0,.17.44,1.25,1.25,0,0,0,.53.25l.77.19a1.88,1.88,0,0,1,.94.44,1.09,1.09,0,0,1,.3.79,1.12,1.12,0,0,1-.48.94A2.17,2.17,0,0,1,243.75,217.57Z"
        />
        <path
          className="cls-51"
          d="M246,213.55V213h2.91v.57Zm2.89,3.31v.62a1.59,1.59,0,0,1-.3.06,1.69,1.69,0,0,1-.33,0,1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.37-1.08v-4.31l.72-.27V216a1.24,1.24,0,0,0,.11.56.56.56,0,0,0,.28.27,1.07,1.07,0,0,0,.41.08l.24,0Z"
        />
        <path
          className="cls-51"
          d="M253.5,217a2.1,2.1,0,0,1-.76.45,3.1,3.1,0,0,1-1,.16,2.54,2.54,0,0,1-1.21-.28,1.91,1.91,0,0,1-.78-.81,2.59,2.59,0,0,1-.28-1.25,2.73,2.73,0,0,1,.27-1.24,2,2,0,0,1,.75-.82,2.11,2.11,0,0,1,1.12-.3,2,2,0,0,1,1,.26,1.75,1.75,0,0,1,.66.76,2.72,2.72,0,0,1,.23,1.19v.14h-3.42v-.48h3l-.24.33a1.82,1.82,0,0,0-.31-1.21,1.13,1.13,0,0,0-1-.42,1.26,1.26,0,0,0-1,.46,2.05,2.05,0,0,0-.37,1.28,2,2,0,0,0,.39,1.33,1.45,1.45,0,0,0,1.15.45,2.17,2.17,0,0,0,.76-.13,2.26,2.26,0,0,0,.7-.4Z"
        />
        <path
          className="cls-51"
          d="M254.92,217.5H254l1.88-2.33.43-.53,1.31-1.66h.89l-1.76,2.19-.44.55Zm2.85,0-1.43-1.78-.43-.55L254.14,213H255l1.32,1.66.44.53,1.86,2.33Z"
        />
        <path
          className="cls-51"
          d="M258.81,213.55V213h2.91v.57Zm2.89,3.31v.62a1.59,1.59,0,0,1-.3.06,1.69,1.69,0,0,1-.33,0,1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.38-1.08v-4.31l.73-.27V216a1.24,1.24,0,0,0,.11.56.53.53,0,0,0,.28.27,1,1,0,0,0,.4.08l.25,0Z"
        />
      </g>
      <g className="cls-52">
        <path
          className="cls-53"
          style={{ fill: '#fff' }}
          d="M403.25,110.46c-2.94,0-5.41,1.45-6.08,3.4a.72.72,0,0,1-.44.43.63.63,0,0,0,0,1.25.74.74,0,0,1,.44.44c.67,1.94,3.14,3.39,6.08,3.39s5.4-1.45,6.07-3.39a.73.73,0,0,1,.45-.44.63.63,0,0,0,0-1.25.71.71,0,0,1-.45-.43C408.65,111.91,406.19,110.46,403.25,110.46Z"
        />
      </g>
      <g className="cls-54">
        <path
          className="cls-53"
          style={{ fill: '#fff' }}
          d="M448.69,111.68l0,0,.86.86a.06.06,0,0,1,0,.08l-5.23,5.23a0,0,0,0,1-.08,0l-.27-.26-.63-.64-1.84-1.84a0,0,0,0,1,0-.08l.85-.85a.06.06,0,0,1,.09,0l1.8,1.79a0,0,0,0,0,.08,0l4.29-4.29Zm-3-3a5.78,5.78,0,1,0,5.78,5.78A5.77,5.77,0,0,0,445.67,108.73Z"
        />
      </g>
      <g className="cls-55">
        <path
          className="cls-53"
          style={{ fill: '#fff' }}
          d="M487.92,110.23a.1.1,0,0,0-.1.1v.51a2.31,2.31,0,0,0-2,2.37s-.09,3.09-1.35,4.08c0,0-.45.41-.75.64v.88h3.85a.8.8,0,0,0,1.59,0H493v-.88c-.29-.23-.74-.64-.74-.64-1.26-1-1.35-4.08-1.35-4.08a2.32,2.32,0,0,0-2-2.37v-.51a.1.1,0,0,0-.1-.1Z"
        />
      </g>
      <g
        className="cls-56"
        style={{ fill: 'rgb(var(--lotta-navigation-contrast-text-color))' }}
      >
        <text className="cls-57" transform="translate(20.61 69.46)">
          <tspan className="cls-58">N</tspan>
          <tspan className="cls-59" x="10.96" y="0">
            A
          </tspan>
          <tspan x="19.9" y="0">
            VI
          </tspan>
          <tspan className="cls-60" x="33.64" y="0">
            G
          </tspan>
          <tspan className="cls-61" x="43.87" y="0">
            A
          </tspan>
          <tspan x="53.11" y="0">
            TION
          </tspan>
        </text>
      </g>
      <g
        className="cls-62"
        style={{ fill: 'rgb(var(--lotta-navigation-contrast-text-color))' }}
      >
        <text className="cls-57" transform="translate(162.83 69.46)">
          <tspan className="cls-58">N</tspan>
          <tspan className="cls-59" x="10.96" y="0">
            A
          </tspan>
          <tspan x="19.9" y="0">
            VI
          </tspan>
          <tspan className="cls-60" x="33.64" y="0">
            G
          </tspan>
          <tspan className="cls-61" x="43.87" y="0">
            A
          </tspan>
          <tspan x="53.11" y="0">
            TION
          </tspan>
        </text>
      </g>
      <g
        className="cls-63"
        style={{ fill: 'rgb(var(--lotta-navigation-contrast-text-color))' }}
      >
        <text className="cls-57" transform="translate(289.64 69.46)">
          <tspan className="cls-58">N</tspan>
          <tspan className="cls-59" x="10.96" y="0">
            A
          </tspan>
          <tspan x="19.9" y="0">
            VI
          </tspan>
          <tspan className="cls-60" x="33.64" y="0">
            G
          </tspan>
          <tspan className="cls-61" x="43.87" y="0">
            A
          </tspan>
          <tspan x="53.11" y="0">
            TION
          </tspan>
        </text>
      </g>
      <g
        className="cls-64"
        style={{ fill: 'rgb(var(--lotta-navigation-contrast-text-color))' }}
      >
        <text className="cls-57" transform="translate(418.88 69.46)">
          <tspan className="cls-58">N</tspan>
          <tspan className="cls-59" x="10.96" y="0">
            A
          </tspan>
          <tspan x="19.9" y="0">
            VI
          </tspan>
          <tspan className="cls-60" x="33.64" y="0">
            G
          </tspan>
          <tspan className="cls-61" x="43.87" y="0">
            A
          </tspan>
          <tspan x="53.11" y="0">
            TION
          </tspan>
        </text>
      </g>
      <g className="cls-65">
        <polygon
          className="cls-10"
          points="51.34 128.01 46.15 134.76 43.57 131.4 39.46 136.74 37.71 134.47 30.53 143.83 34.02 143.83 39.19 143.83 44.9 143.83 53.12 143.83 63.49 143.83 51.34 128.01"
        />
      </g>
      <g className="cls-66">
        <polygon
          className="cls-10"
          points="95.56 143.83 100.74 137.08 103.33 140.44 107.44 135.09 109.18 137.36 116.37 128.01 112.88 128.01 107.71 128.01 102 128.01 93.78 128.01 83.4 128.01 95.56 143.83"
        />
      </g>
      <g className="cls-67" style={{ fill: 'rgb(var(--lotta-text-color))' }}>
        <text className="cls-68" transform="translate(22.62 115.72)">
          <tspan className="cls-69">B</tspan>
          <tspan x="6.96" y="0">
            ANNER TEXT
          </tspan>
        </text>
      </g>
      <g className="cls-70">
        <path
          className="cls-10"
          d="M345.07,270.2h0a.06.06,0,0,0,0,0v.39a.22.22,0,0,0,.2.23.21.21,0,0,0,.2-.22v-.4a.05.05,0,0,0-.05-.05Zm.89,0h-.31a.05.05,0,0,0,0,.05v.39a.22.22,0,0,0,.21.22.21.21,0,0,0,.2-.22v-.39a.05.05,0,0,0,0,0Zm.52,0-.25,0a0,0,0,0,0-.05.05v.4h0a.18.18,0,1,0,.35,0v-.42a.05.05,0,0,0,0,0Zm-1.93,0h0s0,0,0,0v.42h0a.18.18,0,1,0,.36,0v-.4a.05.05,0,0,0-.05-.05l-.25,0Zm2.45-.07-.26,0a0,0,0,0,0-.05.05v.41h0a.2.2,0,0,0,.18.21.19.19,0,0,0,.18-.21v-.45s0,0,0,0h0Zm-3,0h0a.05.05,0,0,0,0,0v.45h0a.19.19,0,0,0,.18.21.2.2,0,0,0,.18-.21v-.41a.05.05,0,0,0,0-.05l-.26,0Zm3.48-.12h0l-.23.06s0,0,0,.05v.27h0a.2.2,0,0,0,.17.22c.09,0,.16-.1.16-.22V270a0,0,0,0,0,0,0Zm-4,0h0a.05.05,0,0,0,0,0v.34a.2.2,0,0,0,.17.22c.15,0,.16-.15.16-.22v-.27s0-.05,0-.05l-.23-.07Zm-.35-.13a0,0,0,0,0-.05,0v.22c0,.16.06.24.1.24s.09-.06.09-.13V270a.08.08,0,0,0,0-.06.19.19,0,0,1-.09,0Zm4.7,0h0l-.09,0a.08.08,0,0,0,0,.07v.26h0c0,.07,0,.13.09.13s.09-.08.09-.26h0v-.2S347.89,269.83,347.87,269.84Zm-1.52-.53a.2.2,0,0,0-.17.22V270s0,0,0,0,0,0,0,0l.25,0a0,0,0,0,0,0-.05v-.42A.2.2,0,0,0,346.35,269.31Zm-2.19,0a.21.21,0,0,0-.18.22v.35a.07.07,0,0,0,0,.05l.26,0h0s0,0,0,0v-.39A.2.2,0,0,0,344.16,269.31Zm2.71,0a.21.21,0,0,0-.18.22v.39l0,0h0l.27,0a.05.05,0,0,0,0-.05v-.35A.2.2,0,0,0,346.87,269.31Zm-2.19,0a.2.2,0,0,0-.18.22V270s0,0,.05.05l.25,0s0,0,0,0l0,0v-.45A.21.21,0,0,0,344.68,269.31Zm.55,0a.22.22,0,0,0-.2.23V270s0,.05,0,.05h.31a0,0,0,0,0,.05-.05v-.48A.22.22,0,0,0,345.23,269.3Zm.58,0a.21.21,0,0,0-.2.2V270a0,0,0,0,0,0,.06H346a0,0,0,0,0,.05,0v-.45A.22.22,0,0,0,345.81,269.3Zm-2.16,0a.19.19,0,0,0-.17.21v.25a.05.05,0,0,0,0,.05l.25.07h0s0,0,0,0v-.32h0C343.81,269.38,343.74,269.29,343.65,269.29Zm3.74,0a.2.2,0,0,0-.17.22v.32s0,0,0,0l0,0,.24-.07a.07.07,0,0,0,0-.05v-.25C347.55,269.38,347.48,269.28,347.39,269.28Zm.44,0c-.09,0-.1.15-.1.27v.18s0,0,0,0h0l.11-.05a.06.06,0,0,0,0-.06v-.23C347.91,269.29,347.88,269.23,347.83,269.23Zm-4.62,0s-.09.06-.09.13v.23a.07.07,0,0,0,0,.06.23.23,0,0,0,.1.05,0,0,0,0,0,.05,0v-.18h0C343.31,269.31,343.26,269.23,343.21,269.23Zm-.85-1.14a.39.39,0,0,0-.4.39v1.75a1.84,1.84,0,0,0,.61,1.37l1,.9a2.06,2.06,0,0,0,1.45.67h1.05a2.06,2.06,0,0,0,1.45-.67l1-.9a1.84,1.84,0,0,0,.61-1.37v-1.76a.4.4,0,0,0-.4-.38h-.2V269a.74.74,0,0,1-.44.65h0v.4c0,.31-.12.42-.24.42l-.08,0s-.05,0-.05,0a.33.33,0,0,1-.3.24.25.25,0,0,1-.15-.05,0,0,0,0,0-.05,0,.33.33,0,0,1-.31.26.33.33,0,0,1-.21-.09,0,0,0,0,0-.07,0,.33.33,0,0,1-.24.12.33.33,0,0,1-.23-.1s-.05,0-.07,0a.33.33,0,0,1-.25.11.3.3,0,0,1-.25-.12h-.07a.34.34,0,0,1-.26.12.33.33,0,0,1-.25-.11,0,0,0,0,0-.07,0,.33.33,0,0,1-.23.1.33.33,0,0,1-.24-.12,0,0,0,0,0-.07,0,.31.31,0,0,1-.21.09.34.34,0,0,1-.31-.26,0,0,0,0,0,0,0,.3.3,0,0,1-.16.05.31.31,0,0,1-.29-.24,0,0,0,0,0-.05,0l-.08,0c-.12,0-.25-.11-.25-.42v-.38a.08.08,0,0,0,0-.05.7.7,0,0,1-.4-.62v-.94Zm2.93-2.19c.1,0,.16.19.19.37a0,0,0,0,0,.08,0c0-.18.09-.37.19-.37.29,0,1.17,2.3.29,2.3a.47.47,0,0,1-.45-.33.08.08,0,0,0-.14,0,.47.47,0,0,1-.45.33C344.12,268.2,345,265.9,345.29,265.9Zm2-2H348a1.14,1.14,0,1,1,0,2.27,1.13,1.13,0,0,1-.48-.11l-.6-.27a1,1,0,0,1-.63-.92A1,1,0,0,1,347.26,263.86Zm-4.22,0h.73a1,1,0,0,1,1,1,1,1,0,0,1-.63.92l-.61.27a1.29,1.29,0,0,1-.47.11,1.14,1.14,0,1,1,0-2.27Zm2.46-5.58a4.33,4.33,0,0,0-4.71,5.07A4,4,0,0,0,341,265a.81.81,0,0,1-.07.71,1.2,1.2,0,0,0,.1,1.59l.7.49a.73.73,0,0,0,.41.12h.5a.49.49,0,0,1,.46.55v.63s0,0,0,0h0a.16.16,0,0,1,.09,0,.22.22,0,0,1,.18.11s0,0,.07,0a.29.29,0,0,1,.18-.07.34.34,0,0,1,.24.13h0s0,0,.05,0a.32.32,0,0,1,.22-.1.3.3,0,0,1,.23.11h.07a.3.3,0,0,1,.23-.11.29.29,0,0,1,.22.11s.06,0,.07,0a.34.34,0,0,1,.26-.12.38.38,0,0,1,.26.13h0s0,0,0,0h0a.36.36,0,0,1,.26-.12.33.33,0,0,1,.25.11,0,0,0,0,0,.07,0,.3.3,0,0,1,.23-.11.29.29,0,0,1,.22.11s.06,0,.07,0a.3.3,0,0,1,.23-.11.28.28,0,0,1,.22.11h.06a.3.3,0,0,1,.24-.14.31.31,0,0,1,.18.07,0,0,0,0,0,.07,0,.2.2,0,0,1,.17-.11.14.14,0,0,1,.11,0h0l0,0v-.64a.49.49,0,0,1,.46-.55h.5a.78.78,0,0,0,.41-.12l.69-.49a1.17,1.17,0,0,0,.11-1.59.81.81,0,0,1-.07-.71,4,4,0,0,0,.16-1.62,4.33,4.33,0,0,0-4.71-5.07h0Z"
        />
      </g>
      <g className="cls-71">
        <path
          className="cls-10"
          d="M345.07,358.2h0a.06.06,0,0,0,0,0v.39a.22.22,0,0,0,.2.23.21.21,0,0,0,.2-.22v-.4a.05.05,0,0,0-.05-.05Zm.89,0h-.31a.05.05,0,0,0,0,.05v.39a.22.22,0,0,0,.21.22.21.21,0,0,0,.2-.22v-.39a.05.05,0,0,0,0,0Zm.52,0-.25,0a0,0,0,0,0-.05.05v.4h0a.18.18,0,1,0,.35,0v-.42a.05.05,0,0,0,0,0Zm-1.93,0h0s0,0,0,0v.42h0a.18.18,0,1,0,.36,0v-.4a.05.05,0,0,0-.05-.05l-.25,0Zm2.45-.07-.26,0a0,0,0,0,0-.05.05v.41h0a.2.2,0,0,0,.18.21.19.19,0,0,0,.18-.21v-.45s0,0,0,0h0Zm-3,0h0a.05.05,0,0,0,0,0v.45h0a.19.19,0,0,0,.18.21.2.2,0,0,0,.18-.21v-.41a.05.05,0,0,0,0-.05l-.26,0Zm3.48-.12h0l-.23.06s0,0,0,.05v.27h0a.2.2,0,0,0,.17.22c.09,0,.16-.1.16-.22V358a0,0,0,0,0,0,0Zm-4,0h0a.05.05,0,0,0,0,0v.34a.2.2,0,0,0,.17.22c.15,0,.16-.15.16-.22v-.27s0-.05,0-.05l-.23-.07Zm-.35-.13a0,0,0,0,0-.05,0v.22c0,.16.06.24.1.24s.09-.06.09-.13V358a.08.08,0,0,0,0-.06.19.19,0,0,1-.09,0Zm4.7,0h0l-.09,0a.08.08,0,0,0,0,.07v.26h0c0,.07,0,.13.09.13s.09-.08.09-.26h0v-.2S347.89,357.83,347.87,357.84Zm-1.52-.53a.2.2,0,0,0-.17.22V358s0,0,0,0,0,0,0,0l.25,0a0,0,0,0,0,0-.05v-.42A.2.2,0,0,0,346.35,357.31Zm-2.19,0a.21.21,0,0,0-.18.22v.35a.07.07,0,0,0,0,.05l.26,0h0s0,0,0,0v-.39A.2.2,0,0,0,344.16,357.31Zm2.71,0a.21.21,0,0,0-.18.22v.39l0,0h0l.27,0a.05.05,0,0,0,0-.05v-.35A.2.2,0,0,0,346.87,357.31Zm-2.19,0a.2.2,0,0,0-.18.22V358s0,0,.05.05l.25,0s0,0,0,0l0,0v-.45A.21.21,0,0,0,344.68,357.31Zm.55,0a.22.22,0,0,0-.2.23V358s0,.05,0,.05h.31a0,0,0,0,0,.05-.05v-.48A.22.22,0,0,0,345.23,357.3Zm.58,0a.21.21,0,0,0-.2.2V358a0,0,0,0,0,0,.06H346a0,0,0,0,0,.05,0v-.45A.22.22,0,0,0,345.81,357.3Zm-2.16,0a.19.19,0,0,0-.17.21v.25a.05.05,0,0,0,0,.05l.25.07h0s0,0,0,0v-.32h0C343.81,357.38,343.74,357.29,343.65,357.29Zm3.74,0a.2.2,0,0,0-.17.22v.32s0,0,0,0l0,0,.24-.07a.07.07,0,0,0,0-.05v-.25C347.55,357.38,347.48,357.28,347.39,357.28Zm.44,0c-.09,0-.1.15-.1.27v.18s0,0,0,0h0l.11-.05a.06.06,0,0,0,0-.06v-.23C347.91,357.29,347.88,357.23,347.83,357.23Zm-4.62,0s-.09.06-.09.13v.23a.07.07,0,0,0,0,.06.23.23,0,0,0,.1.05,0,0,0,0,0,.05,0v-.18h0C343.31,357.31,343.26,357.23,343.21,357.23Zm-.85-1.14a.39.39,0,0,0-.4.39v1.75a1.84,1.84,0,0,0,.61,1.37l1,.9a2.06,2.06,0,0,0,1.45.67h1.05a2.06,2.06,0,0,0,1.45-.67l1-.9a1.84,1.84,0,0,0,.61-1.37v-1.76a.4.4,0,0,0-.4-.38h-.2V357a.74.74,0,0,1-.44.65h0v.4c0,.31-.12.42-.24.42l-.08,0s-.05,0-.05,0a.33.33,0,0,1-.3.24.25.25,0,0,1-.15-.05,0,0,0,0,0-.05,0,.33.33,0,0,1-.31.26.33.33,0,0,1-.21-.09,0,0,0,0,0-.07,0,.33.33,0,0,1-.24.12.33.33,0,0,1-.23-.1s-.05,0-.07,0a.33.33,0,0,1-.25.11.3.3,0,0,1-.25-.12h-.07a.34.34,0,0,1-.26.12.33.33,0,0,1-.25-.11,0,0,0,0,0-.07,0,.33.33,0,0,1-.23.1.33.33,0,0,1-.24-.12,0,0,0,0,0-.07,0,.31.31,0,0,1-.21.09.34.34,0,0,1-.31-.26,0,0,0,0,0,0,0,.3.3,0,0,1-.16.05.31.31,0,0,1-.29-.24,0,0,0,0,0-.05,0l-.08,0c-.12,0-.25-.11-.25-.42v-.38a.08.08,0,0,0,0-.05.7.7,0,0,1-.4-.62v-.94Zm2.93-2.19c.1,0,.16.19.19.37a0,0,0,0,0,.08,0c0-.18.09-.37.19-.37.29,0,1.17,2.3.29,2.3a.47.47,0,0,1-.45-.33.08.08,0,0,0-.14,0,.47.47,0,0,1-.45.33C344.12,356.2,345,353.9,345.29,353.9Zm2-2H348a1.14,1.14,0,1,1,0,2.27,1.13,1.13,0,0,1-.48-.11l-.6-.27a1,1,0,0,1-.63-.92A1,1,0,0,1,347.26,351.86Zm-4.22,0h.73a1,1,0,0,1,1,1,1,1,0,0,1-.63.92l-.61.27a1.29,1.29,0,0,1-.47.11,1.14,1.14,0,1,1,0-2.27Zm2.46-5.58a4.33,4.33,0,0,0-4.71,5.07A4,4,0,0,0,341,353a.81.81,0,0,1-.07.71,1.2,1.2,0,0,0,.1,1.59l.7.49a.73.73,0,0,0,.41.12h.5a.49.49,0,0,1,.46.55v.63s0,0,0,0h0a.16.16,0,0,1,.09,0,.22.22,0,0,1,.18.11s0,0,.07,0a.29.29,0,0,1,.18-.07.34.34,0,0,1,.24.13h0s0,0,.05,0a.32.32,0,0,1,.22-.1.3.3,0,0,1,.23.11h.07a.3.3,0,0,1,.23-.11.29.29,0,0,1,.22.11s.06,0,.07,0a.34.34,0,0,1,.26-.12.38.38,0,0,1,.26.13h0s0,0,0,0h0a.36.36,0,0,1,.26-.12.33.33,0,0,1,.25.11,0,0,0,0,0,.07,0,.3.3,0,0,1,.23-.11.29.29,0,0,1,.22.11s.06,0,.07,0a.3.3,0,0,1,.23-.11.28.28,0,0,1,.22.11h.06a.3.3,0,0,1,.24-.14.31.31,0,0,1,.18.07,0,0,0,0,0,.07,0,.2.2,0,0,1,.17-.11.14.14,0,0,1,.11,0h0l0,0v-.64a.49.49,0,0,1,.46-.55h.5a.78.78,0,0,0,.41-.12l.69-.49a1.17,1.17,0,0,0,.11-1.59.81.81,0,0,1-.07-.71,4,4,0,0,0,.16-1.62,4.33,4.33,0,0,0-4.71-5.07h0Z"
        />
      </g>
      <g className="cls-72" style={{ fill: 'rgb(var(--lotta-text-color))' }}>
        <text className="cls-42" transform="translate(118.37 271.51)">
          <tspan className="cls-43">T</tspan>
          <tspan className="cls-44" x="5.74" y="0">
            e
          </tspan>
          <tspan x="12.68" y="0">
            xt- und{' '}
          </tspan>
          <tspan className="cls-45" x="56.36" y="0">
            Ü
          </tspan>
          <tspan x="66.05" y="0">
            bers
          </tspan>
          <tspan className="cls-46" x="91.17" y="0">
            c
          </tspan>
          <tspan x="97.69" y="0">
            h
          </tspan>
          <tspan className="cls-47" x="104.82" y="0">
            r
          </tspan>
          <tspan x="109.88" y="0">
            i
          </tspan>
          <tspan className="cls-48" x="113.12" y="0">
            f
          </tspan>
          <tspan className="cls-49" x="117.44" y="0">
            t
          </tspan>
          <tspan x="121.1" y="0">
            en
          </tspan>
          <tspan className="cls-50" x="135.42" y="0">
            f
          </tspan>
          <tspan x="139.48" y="0">
            arbe{' '}
          </tspan>
        </text>
        <path
          className="cls-51"
          d="M119.16,294v-6.41h2.57a2.31,2.31,0,0,1,1.52.44,1.64,1.64,0,0,1,.25,2.17,1.63,1.63,0,0,1-.83.55v-.07a1.51,1.51,0,0,1,.94.53,1.55,1.55,0,0,1,.34,1,1.57,1.57,0,0,1-.55,1.3,2.48,2.48,0,0,1-1.58.45Zm.73-3.57h1.72a1.77,1.77,0,0,0,1.1-.28,1,1,0,0,0,.36-.85,1,1,0,0,0-.36-.82,1.75,1.75,0,0,0-1.1-.28h-1.72Zm0,3h1.87a1.85,1.85,0,0,0,1.11-.27,1,1,0,0,0,.36-.88,1.08,1.08,0,0,0-.36-.88,1.71,1.71,0,0,0-1.11-.3h-1.87Z"
        />
        <path
          className="cls-51"
          d="M128.9,293.49a2.15,2.15,0,0,1-.76.44,2.75,2.75,0,0,1-.95.16,2.46,2.46,0,0,1-1.21-.28,1.94,1.94,0,0,1-.78-.8,2.75,2.75,0,0,1-.27-1.26,2.65,2.65,0,0,1,.27-1.23,2,2,0,0,1,.75-.83,2.05,2.05,0,0,1,1.11-.3,1.88,1.88,0,0,1,1,.27,1.72,1.72,0,0,1,.67.76,2.84,2.84,0,0,1,.23,1.19v.13h-3.42v-.48h3l-.23.34a1.89,1.89,0,0,0-.31-1.22,1.15,1.15,0,0,0-1-.42,1.24,1.24,0,0,0-1,.46,2.4,2.4,0,0,0,0,2.62,1.43,1.43,0,0,0,1.14.45,2.38,2.38,0,0,0,.76-.13,2.35,2.35,0,0,0,.7-.4Z"
        />
        <path
          className="cls-51"
          d="M131.62,294.09a2.61,2.61,0,0,1-1.81-.59l.25-.53a2.44,2.44,0,0,0,.74.4,2.53,2.53,0,0,0,.85.13,1.41,1.41,0,0,0,.78-.17.57.57,0,0,0,.26-.51.55.55,0,0,0-.18-.43,1.37,1.37,0,0,0-.59-.25l-.77-.18a1.76,1.76,0,0,1-.87-.45,1.09,1.09,0,0,1-.31-.78,1.17,1.17,0,0,1,.21-.69,1.47,1.47,0,0,1,.61-.48,2.27,2.27,0,0,1,.91-.17,2.66,2.66,0,0,1,.9.15,1.84,1.84,0,0,1,.71.45l-.24.53a2.09,2.09,0,0,0-.66-.4,1.87,1.87,0,0,0-.71-.13,1.26,1.26,0,0,0-.75.19.65.65,0,0,0-.1.95,1.13,1.13,0,0,0,.54.25l.76.19a1.76,1.76,0,0,1,.94.45,1,1,0,0,1,.31.78,1.12,1.12,0,0,1-.48.94A2.18,2.18,0,0,1,131.62,294.09Z"
        />
        <path
          className="cls-51"
          d="M136.46,294.09a2.27,2.27,0,0,1-1.16-.29,2,2,0,0,1-.75-.81,2.79,2.79,0,0,1-.26-1.23,2.73,2.73,0,0,1,.27-1.24,2,2,0,0,1,.76-.83,2.21,2.21,0,0,1,1.17-.3,2.46,2.46,0,0,1,.89.16,1.78,1.78,0,0,1,.7.44l-.24.54a2.72,2.72,0,0,0-.65-.4,1.85,1.85,0,0,0-.66-.13,1.4,1.4,0,0,0-1.09.46,2,2,0,0,0-.4,1.3,1.85,1.85,0,0,0,.4,1.28,1.37,1.37,0,0,0,1.09.45,1.84,1.84,0,0,0,.65-.13,2.85,2.85,0,0,0,.66-.39l.24.53a1.85,1.85,0,0,1-.72.43A2.51,2.51,0,0,1,136.46,294.09Z"
        />
        <path
          className="cls-51"
          d="M139,294V287.4h.73v3l-.12.09a1.54,1.54,0,0,1,.63-.83,1.87,1.87,0,0,1,1-.29c1.09,0,1.63.6,1.63,1.79V294h-.73v-2.81a1.37,1.37,0,0,0-.25-.92,1,1,0,0,0-.79-.3,1.34,1.34,0,0,0-1,.39,1.45,1.45,0,0,0-.38,1.05V294Z"
        />
        <path
          className="cls-51"
          d="M144.28,294v-3.26c0-.21,0-.42,0-.64s0-.42-.06-.63h.7l.1,1.12-.1,0a1.39,1.39,0,0,1,.54-.9,1.57,1.57,0,0,1,.94-.3l.22,0a.65.65,0,0,1,.2,0l0,.66a1.43,1.43,0,0,0-.48-.07,1.23,1.23,0,0,0-.75.21,1.15,1.15,0,0,0-.41.52,1.74,1.74,0,0,0-.13.67V294Z"
        />
        <path
          className="cls-51"
          d="M147.46,287.58h.89v.83h-.89Zm.07,6.45V289.5h.73V294Z"
        />
        <path
          className="cls-51"
          d="M149,290.08v-.58h2.71v.58Zm2.84-2a1.62,1.62,0,0,0-.47-.07,1,1,0,0,0-.39.07.53.53,0,0,0-.27.28,1.17,1.17,0,0,0-.1.55V294h-.73v-5.22a1.48,1.48,0,0,1,.36-1.09,1.37,1.37,0,0,1,1-.35,1.67,1.67,0,0,1,.31,0l.3.06Z"
        />
        <path
          className="cls-51"
          d="M151.87,290.08v-.58h2.91v.58Zm2.89,3.3V294l-.3.07-.33,0a1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.38-1.08v-4.31l.73-.26v4.47a1.21,1.21,0,0,0,.11.56.56.56,0,0,0,.28.27,1.07,1.07,0,0,0,.41.08l.24,0Z"
        />
        <path
          className="cls-51"
          d="M157.26,294.09a1.58,1.58,0,0,1-1.22-.45,1.92,1.92,0,0,1-.41-1.33V289.5h.73v2.79a1.38,1.38,0,0,0,.25.9,1,1,0,0,0,.77.29,1.27,1.27,0,0,0,1-.39,1.42,1.42,0,0,0,.37-1V289.5h.73V294h-.71v-1l.11-.06a1.56,1.56,0,0,1-.61.82A1.73,1.73,0,0,1,157.26,294.09Z"
        />
        <path
          className="cls-51"
          d="M160.85,294v-3.26c0-.21,0-.42,0-.64s0-.42-.06-.63h.7l.08.94-.09.07a1.45,1.45,0,0,1,.63-.83,1.81,1.81,0,0,1,1-.29c1.09,0,1.63.6,1.63,1.79V294H164v-2.81a1.37,1.37,0,0,0-.25-.92,1,1,0,0,0-.79-.3,1.34,1.34,0,0,0-1,.39,1.45,1.45,0,0,0-.38,1.05V294Z"
        />
        <path
          className="cls-51"
          d="M168.11,296a3.3,3.3,0,0,1-1.78-.46l.12-.6a3.61,3.61,0,0,0,.8.35,2.85,2.85,0,0,0,.86.11,1.3,1.3,0,0,0,1-.35,1.39,1.39,0,0,0,.34-1v-1.22l.1-.12a1.61,1.61,0,0,1-.34.63,1.54,1.54,0,0,1-.56.41,2,2,0,0,1-.76.14,1.92,1.92,0,0,1-1.05-.28,1.88,1.88,0,0,1-.71-.79,2.81,2.81,0,0,1,0-2.36,1.85,1.85,0,0,1,.71-.78,1.92,1.92,0,0,1,1.05-.29,1.85,1.85,0,0,1,1.07.31,1.54,1.54,0,0,1,.59.87l-.11-.1v-1h.73V294a2,2,0,0,1-.52,1.53A2.07,2.07,0,0,1,168.11,296Zm-.09-2.75a1.29,1.29,0,0,0,1-.44,2.13,2.13,0,0,0,0-2.4,1.29,1.29,0,0,0-1-.44,1.32,1.32,0,0,0-1.05.44,2.1,2.1,0,0,0,0,2.41A1.31,1.31,0,0,0,168,293.28Z"
        />
        <path
          className="cls-51"
          d="M173.09,294.09a2.58,2.58,0,0,1-1.81-.59l.24-.53a2.49,2.49,0,0,0,1.59.53,1.41,1.41,0,0,0,.78-.17.58.58,0,0,0,.27-.51.55.55,0,0,0-.18-.43,1.42,1.42,0,0,0-.6-.25l-.76-.18a1.79,1.79,0,0,1-.88-.45,1.09,1.09,0,0,1-.31-.78,1.12,1.12,0,0,1,.22-.69,1.38,1.38,0,0,1,.6-.48,2.32,2.32,0,0,1,.92-.17,2.74,2.74,0,0,1,.9.15,1.92,1.92,0,0,1,.71.45l-.25.53a2.09,2.09,0,0,0-.66-.4,1.85,1.85,0,0,0-.7-.13,1.28,1.28,0,0,0-.76.19.59.59,0,0,0-.26.51.57.57,0,0,0,.17.44,1.14,1.14,0,0,0,.53.25l.77.19a1.8,1.8,0,0,1,.94.45,1.06,1.06,0,0,1,.3.78,1.12,1.12,0,0,1-.48.94A2.17,2.17,0,0,1,173.09,294.09Z"
        />
        <path
          className="cls-51"
          d="M175.34,290.08v-.58h2.91v.58Zm2.89,3.3V294l-.3.07-.33,0a1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.37-1.08v-4.31l.72-.26v4.47a1.21,1.21,0,0,0,.11.56.56.56,0,0,0,.28.27,1.07,1.07,0,0,0,.41.08l.24,0Z"
        />
        <path
          className="cls-51"
          d="M182.84,293.49a2.24,2.24,0,0,1-.76.44,2.83,2.83,0,0,1-1,.16,2.43,2.43,0,0,1-1.21-.28,1.88,1.88,0,0,1-.78-.8,3,3,0,0,1,0-2.49,2,2,0,0,1,.75-.83,2.11,2.11,0,0,1,1.12-.3,1.91,1.91,0,0,1,1,.27,1.64,1.64,0,0,1,.66.76,2.69,2.69,0,0,1,.23,1.19v.13H179.5v-.48h3l-.24.34a1.83,1.83,0,0,0-.31-1.22,1.15,1.15,0,0,0-1-.42,1.26,1.26,0,0,0-1,.46,2.05,2.05,0,0,0-.37,1.28A2,2,0,0,0,180,293a1.45,1.45,0,0,0,1.15.45,2.43,2.43,0,0,0,.76-.13,2.48,2.48,0,0,0,.7-.4Z"
        />
        <path
          className="cls-51"
          d="M184.26,294h-.89l1.88-2.33.43-.54L187,289.5h.89l-1.76,2.2-.44.54Zm2.85,0-1.43-1.79-.43-.54-1.77-2.2h.88l1.32,1.66.44.54L188,294Z"
        />
        <path
          className="cls-51"
          d="M188.15,290.08v-.58h2.91v.58Zm2.89,3.3V294l-.3.07-.33,0a1.36,1.36,0,0,1-1-.36,1.43,1.43,0,0,1-.38-1.08v-4.31l.73-.26v4.47a1.37,1.37,0,0,0,.1.56.58.58,0,0,0,.29.27,1,1,0,0,0,.4.08l.25,0Z"
        />
        <path
          className="cls-51"
          d="M194.38,294v-6.41H197a2.31,2.31,0,0,1,1.52.44,1.64,1.64,0,0,1,.25,2.17,1.63,1.63,0,0,1-.83.55v-.07a1.48,1.48,0,0,1,.94.53,1.56,1.56,0,0,1,.35,1,1.58,1.58,0,0,1-.56,1.3A2.46,2.46,0,0,1,197,294Zm.73-3.57h1.73a1.75,1.75,0,0,0,1.09-.28,1,1,0,0,0,.36-.85,1,1,0,0,0-.36-.82,1.73,1.73,0,0,0-1.09-.28h-1.73Zm0,3H197a1.85,1.85,0,0,0,1.11-.27,1,1,0,0,0,.36-.88,1.08,1.08,0,0,0-.36-.88,1.71,1.71,0,0,0-1.11-.3h-1.87Z"
        />
        <path
          className="cls-51"
          d="M204.13,293.49a2.29,2.29,0,0,1-.77.44,2.73,2.73,0,0,1-.94.16,2.47,2.47,0,0,1-1.22-.28,2,2,0,0,1-.78-.8,2.75,2.75,0,0,1-.27-1.26,2.65,2.65,0,0,1,.27-1.23,2,2,0,0,1,.75-.83,2.05,2.05,0,0,1,1.11-.3,1.94,1.94,0,0,1,1,.27,1.76,1.76,0,0,1,.66.76,2.84,2.84,0,0,1,.23,1.19v.13h-3.42v-.48h3l-.23.34a1.89,1.89,0,0,0-.31-1.22,1.15,1.15,0,0,0-1-.42,1.24,1.24,0,0,0-1,.46,2.45,2.45,0,0,0,0,2.62,1.43,1.43,0,0,0,1.14.45,2.49,2.49,0,0,0,.77-.13,2.43,2.43,0,0,0,.69-.4Z"
        />
        <path
          className="cls-51"
          d="M206.84,294.09a2.61,2.61,0,0,1-1.81-.59l.25-.53a2.44,2.44,0,0,0,.74.4,2.57,2.57,0,0,0,.85.13,1.41,1.41,0,0,0,.78-.17.57.57,0,0,0,.26-.51.55.55,0,0,0-.18-.43,1.37,1.37,0,0,0-.59-.25l-.76-.18a1.75,1.75,0,0,1-.88-.45,1.09,1.09,0,0,1-.31-.78,1.17,1.17,0,0,1,.21-.69,1.47,1.47,0,0,1,.61-.48,2.27,2.27,0,0,1,.91-.17,2.66,2.66,0,0,1,.9.15,2,2,0,0,1,.72.45l-.25.53a2.09,2.09,0,0,0-.66-.4,1.87,1.87,0,0,0-.71-.13,1.26,1.26,0,0,0-.75.19.65.65,0,0,0-.1.95,1.13,1.13,0,0,0,.54.25l.76.19a1.84,1.84,0,0,1,.95.45,1.06,1.06,0,0,1,.3.78,1.12,1.12,0,0,1-.48.94A2.18,2.18,0,0,1,206.84,294.09Z"
        />
        <path
          className="cls-51"
          d="M211.68,294.09a2.27,2.27,0,0,1-1.16-.29,2,2,0,0,1-.75-.81,2.79,2.79,0,0,1-.26-1.23,2.73,2.73,0,0,1,.27-1.24,2,2,0,0,1,.76-.83,2.21,2.21,0,0,1,1.17-.3,2.46,2.46,0,0,1,.89.16,1.9,1.9,0,0,1,.71.44l-.25.54a2.72,2.72,0,0,0-.65-.4,1.85,1.85,0,0,0-.66-.13,1.4,1.4,0,0,0-1.09.46,2,2,0,0,0-.4,1.3,1.9,1.9,0,0,0,.4,1.28,1.37,1.37,0,0,0,1.09.45,1.94,1.94,0,0,0,.66-.13,3,3,0,0,0,.65-.39l.25.53a2,2,0,0,1-.73.43A2.51,2.51,0,0,1,211.68,294.09Z"
        />
        <path
          className="cls-51"
          d="M214.23,294V287.4H215v3l-.12.09a1.54,1.54,0,0,1,.63-.83,1.87,1.87,0,0,1,1-.29c1.09,0,1.63.6,1.63,1.79V294h-.73v-2.81a1.37,1.37,0,0,0-.25-.92,1,1,0,0,0-.79-.3,1.34,1.34,0,0,0-1,.39,1.45,1.45,0,0,0-.38,1.05V294Z"
        />
        <path
          className="cls-51"
          d="M219.5,294v-3.26c0-.21,0-.42,0-.64a4.48,4.48,0,0,0-.06-.63h.7l.1,1.12-.1,0a1.39,1.39,0,0,1,.54-.9,1.57,1.57,0,0,1,.94-.3l.22,0a.65.65,0,0,1,.2,0l0,.66a1.43,1.43,0,0,0-.48-.07,1.23,1.23,0,0,0-.75.21,1.15,1.15,0,0,0-.41.52,1.74,1.74,0,0,0-.13.67V294Z"
        />
        <path
          className="cls-51"
          d="M222.68,287.58h.89v.83h-.89Zm.08,6.45V289.5h.72V294Z"
        />
        <path
          className="cls-51"
          d="M224.26,290.08v-.58H227v.58Zm2.84-2a1.62,1.62,0,0,0-.47-.07,1,1,0,0,0-.39.07.57.57,0,0,0-.27.28,1.17,1.17,0,0,0-.1.55V294h-.73v-5.22a1.48,1.48,0,0,1,.36-1.09,1.37,1.37,0,0,1,1-.35,1.67,1.67,0,0,1,.31,0l.3.06Z"
        />
        <path
          className="cls-51"
          d="M227.09,290.08v-.58H230v.58Zm2.89,3.3V294l-.3.07-.33,0a1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.38-1.08v-4.31l.73-.26v4.47a1.21,1.21,0,0,0,.11.56.56.56,0,0,0,.28.27,1.07,1.07,0,0,0,.41.08l.24,0Z"
        />
        <path
          className="cls-51"
          d="M232.48,294.09a1.58,1.58,0,0,1-1.22-.45,1.92,1.92,0,0,1-.41-1.33V289.5h.73v2.79a1.32,1.32,0,0,0,.26.9,1,1,0,0,0,.76.29,1.27,1.27,0,0,0,1-.39,1.42,1.42,0,0,0,.37-1V289.5h.73V294H234v-1l.11-.06a1.51,1.51,0,0,1-.61.82A1.71,1.71,0,0,1,232.48,294.09Z"
        />
        <path
          className="cls-51"
          d="M236.07,294v-3.26c0-.21,0-.42,0-.64s0-.42-.06-.63h.7l.08.94-.09.07a1.45,1.45,0,0,1,.63-.83,1.81,1.81,0,0,1,1-.29c1.09,0,1.63.6,1.63,1.79V294h-.73v-2.81a1.37,1.37,0,0,0-.25-.92,1,1,0,0,0-.79-.3,1.34,1.34,0,0,0-1,.39,1.45,1.45,0,0,0-.38,1.05V294Z"
        />
        <path
          className="cls-51"
          d="M243.33,296a3.3,3.3,0,0,1-1.78-.46l.12-.6a3.61,3.61,0,0,0,.8.35,2.89,2.89,0,0,0,.86.11,1.3,1.3,0,0,0,1-.35,1.39,1.39,0,0,0,.34-1v-1.22l.1-.12a1.61,1.61,0,0,1-.34.63,1.54,1.54,0,0,1-.56.41,2,2,0,0,1-.76.14,1.92,1.92,0,0,1-1.05-.28,1.88,1.88,0,0,1-.71-.79,2.81,2.81,0,0,1,0-2.36,1.85,1.85,0,0,1,.71-.78,1.92,1.92,0,0,1,1.05-.29,1.85,1.85,0,0,1,1.07.31,1.54,1.54,0,0,1,.59.87l-.11-.1v-1h.73V294a2,2,0,0,1-.52,1.53A2.07,2.07,0,0,1,243.33,296Zm-.09-2.75a1.29,1.29,0,0,0,1-.44,2.13,2.13,0,0,0,0-2.4,1.29,1.29,0,0,0-1-.44,1.33,1.33,0,0,0-1.05.44,2.1,2.1,0,0,0,0,2.41A1.32,1.32,0,0,0,243.24,293.28Z"
        />
        <path
          className="cls-51"
          d="M248.31,294.09a2.58,2.58,0,0,1-1.81-.59l.24-.53a2.49,2.49,0,0,0,1.59.53,1.41,1.41,0,0,0,.78-.17.58.58,0,0,0,.27-.51.55.55,0,0,0-.18-.43,1.42,1.42,0,0,0-.6-.25l-.76-.18a1.79,1.79,0,0,1-.88-.45,1.09,1.09,0,0,1-.31-.78,1.12,1.12,0,0,1,.22-.69,1.38,1.38,0,0,1,.6-.48,2.32,2.32,0,0,1,.92-.17,2.74,2.74,0,0,1,.9.15,1.92,1.92,0,0,1,.71.45l-.25.53a2.09,2.09,0,0,0-.66-.4,1.85,1.85,0,0,0-.7-.13,1.22,1.22,0,0,0-.75.19.58.58,0,0,0-.27.51.6.6,0,0,0,.17.44,1.14,1.14,0,0,0,.53.25l.77.19a1.8,1.8,0,0,1,.94.45,1.06,1.06,0,0,1,.3.78,1.12,1.12,0,0,1-.48.94A2.17,2.17,0,0,1,248.31,294.09Z"
        />
        <path
          className="cls-51"
          d="M250.56,290.08v-.58h2.91v.58Zm2.89,3.3V294l-.3.07-.33,0a1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.37-1.08v-4.31l.73-.26v4.47a1.22,1.22,0,0,0,.1.56.56.56,0,0,0,.28.27,1.07,1.07,0,0,0,.41.08l.24,0Z"
        />
        <path
          className="cls-51"
          d="M258.06,293.49a2.24,2.24,0,0,1-.76.44,2.79,2.79,0,0,1-.95.16,2.43,2.43,0,0,1-1.21-.28,1.88,1.88,0,0,1-.78-.8,3,3,0,0,1,0-2.49,2,2,0,0,1,.76-.83,2.05,2.05,0,0,1,1.11-.3,1.91,1.91,0,0,1,1,.27,1.64,1.64,0,0,1,.66.76,2.69,2.69,0,0,1,.23,1.19v.13h-3.42v-.48h3l-.24.34a1.83,1.83,0,0,0-.31-1.22,1.13,1.13,0,0,0-.95-.42,1.26,1.26,0,0,0-1,.46,2.05,2.05,0,0,0-.37,1.28,2,2,0,0,0,.39,1.34,1.45,1.45,0,0,0,1.15.45,2.43,2.43,0,0,0,.76-.13,2.48,2.48,0,0,0,.7-.4Z"
        />
        <path
          className="cls-51"
          d="M259.48,294h-.89l1.88-2.33.43-.54,1.31-1.66h.89l-1.76,2.2-.44.54Zm2.85,0-1.43-1.79-.43-.54-1.77-2.2h.88l1.32,1.66.44.54L263.2,294Z"
        />
        <path
          className="cls-51"
          d="M263.37,290.08v-.58h2.91v.58Zm2.89,3.3V294l-.3.07-.33,0a1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.38-1.08v-4.31l.73-.26v4.47a1.21,1.21,0,0,0,.11.56.53.53,0,0,0,.28.27,1,1,0,0,0,.4.08l.25,0Z"
        />
        <path
          className="cls-51"
          d="M269.6,294v-6.41h2.57a2.31,2.31,0,0,1,1.52.44,1.64,1.64,0,0,1,.25,2.17,1.63,1.63,0,0,1-.83.55v-.07a1.48,1.48,0,0,1,.94.53,1.56,1.56,0,0,1,.35,1,1.58,1.58,0,0,1-.56,1.3,2.46,2.46,0,0,1-1.58.45Zm.73-3.57h1.73a1.75,1.75,0,0,0,1.09-.28,1,1,0,0,0,.36-.85,1,1,0,0,0-.36-.82,1.73,1.73,0,0,0-1.09-.28h-1.73Zm0,3h1.87a1.85,1.85,0,0,0,1.11-.27,1,1,0,0,0,.36-.88,1.08,1.08,0,0,0-.36-.88,1.71,1.71,0,0,0-1.11-.3h-1.87Z"
        />
        <path
          className="cls-51"
          d="M279.35,293.49a2.24,2.24,0,0,1-.76.44,2.83,2.83,0,0,1-.95.16,2.43,2.43,0,0,1-1.21-.28,2,2,0,0,1-.79-.8,2.75,2.75,0,0,1-.27-1.26,2.65,2.65,0,0,1,.27-1.23,2,2,0,0,1,.75-.83,2.05,2.05,0,0,1,1.11-.3,1.94,1.94,0,0,1,1,.27,1.76,1.76,0,0,1,.66.76,2.84,2.84,0,0,1,.23,1.19v.13H276v-.48h3l-.23.34a1.89,1.89,0,0,0-.31-1.22,1.15,1.15,0,0,0-1-.42,1.24,1.24,0,0,0-1,.46,2.45,2.45,0,0,0,0,2.62,1.43,1.43,0,0,0,1.15.45,2.48,2.48,0,0,0,.76-.13,2.43,2.43,0,0,0,.69-.4Z"
        />
        <path
          className="cls-51"
          d="M282.06,294.09a2.57,2.57,0,0,1-1.8-.59l.24-.53a2.49,2.49,0,0,0,1.59.53,1.41,1.41,0,0,0,.78-.17.58.58,0,0,0,.27-.51.55.55,0,0,0-.18-.43,1.42,1.42,0,0,0-.6-.25l-.76-.18a1.79,1.79,0,0,1-.88-.45,1.09,1.09,0,0,1-.31-.78,1.17,1.17,0,0,1,.21-.69,1.47,1.47,0,0,1,.61-.48,2.29,2.29,0,0,1,.92-.17,2.74,2.74,0,0,1,.9.15,2,2,0,0,1,.71.45l-.25.53a2.09,2.09,0,0,0-.66-.4,1.85,1.85,0,0,0-.7-.13,1.28,1.28,0,0,0-.76.19.65.65,0,0,0-.1.95,1.18,1.18,0,0,0,.54.25l.77.19a1.84,1.84,0,0,1,.94.45,1.06,1.06,0,0,1,.3.78,1.12,1.12,0,0,1-.48.94A2.18,2.18,0,0,1,282.06,294.09Z"
        />
        <path
          className="cls-51"
          d="M286.9,294.09a2.21,2.21,0,0,1-1.15-.29A1.92,1.92,0,0,1,285,293a2.79,2.79,0,0,1-.26-1.23,2.73,2.73,0,0,1,.27-1.24,2,2,0,0,1,.76-.83,2.21,2.21,0,0,1,1.17-.3,2.46,2.46,0,0,1,.89.16,1.82,1.82,0,0,1,.71.44l-.25.54a2.72,2.72,0,0,0-.65-.4A1.85,1.85,0,0,0,287,290a1.4,1.4,0,0,0-1.09.46,2,2,0,0,0-.4,1.3,1.9,1.9,0,0,0,.4,1.28,1.37,1.37,0,0,0,1.09.45,1.94,1.94,0,0,0,.66-.13,3,3,0,0,0,.65-.39l.25.53a2,2,0,0,1-.73.43A2.51,2.51,0,0,1,286.9,294.09Z"
        />
        <path
          className="cls-51"
          d="M289.45,294V287.4h.73v3l-.11.09a1.48,1.48,0,0,1,.62-.83,1.87,1.87,0,0,1,1-.29c1.09,0,1.63.6,1.63,1.79V294h-.73v-2.81a1.37,1.37,0,0,0-.25-.92,1,1,0,0,0-.79-.3,1.34,1.34,0,0,0-1,.39,1.45,1.45,0,0,0-.38,1.05V294Z"
        />
        <path
          className="cls-51"
          d="M294.72,294v-3.26c0-.21,0-.42,0-.64a4.46,4.46,0,0,0-.05-.63h.69l.1,1.12-.1,0a1.39,1.39,0,0,1,.54-.9,1.59,1.59,0,0,1,.94-.3l.22,0a.65.65,0,0,1,.2,0l0,.66a1.43,1.43,0,0,0-.48-.07,1.23,1.23,0,0,0-.75.21,1.15,1.15,0,0,0-.41.52,1.74,1.74,0,0,0-.13.67V294Z"
        />
        <path
          className="cls-51"
          d="M297.9,287.58h.89v.83h-.89ZM298,294V289.5h.72V294Z"
        />
        <path
          className="cls-51"
          d="M299.48,290.08v-.58h2.72v.58Zm2.84-2a1.61,1.61,0,0,0-.46-.07,1,1,0,0,0-.4.07.57.57,0,0,0-.27.28,1.17,1.17,0,0,0-.1.55V294h-.73v-5.22a1.48,1.48,0,0,1,.36-1.09,1.37,1.37,0,0,1,1-.35,1.67,1.67,0,0,1,.31,0l.3.06Z"
        />
        <path
          className="cls-51"
          d="M302.31,290.08v-.58h2.91v.58Zm2.89,3.3V294l-.3.07-.33,0a1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.37-1.08v-4.31l.72-.26v4.47a1.21,1.21,0,0,0,.11.56.56.56,0,0,0,.28.27,1.07,1.07,0,0,0,.41.08l.24,0Z"
        />
        <path
          className="cls-51"
          d="M307.7,294.09a1.58,1.58,0,0,1-1.22-.45,1.92,1.92,0,0,1-.4-1.33V289.5h.72v2.79a1.32,1.32,0,0,0,.26.9,1,1,0,0,0,.76.29,1.27,1.27,0,0,0,1-.39,1.42,1.42,0,0,0,.37-1V289.5h.73V294h-.71v-1l.11-.06a1.51,1.51,0,0,1-.61.82A1.71,1.71,0,0,1,307.7,294.09Z"
        />
        <path
          className="cls-51"
          d="M311.3,294v-3.26c0-.21,0-.42,0-.64s0-.42-.06-.63h.7l.08.94-.09.07a1.45,1.45,0,0,1,.63-.83,1.81,1.81,0,0,1,1-.29c1.09,0,1.63.6,1.63,1.79V294h-.73v-2.81a1.37,1.37,0,0,0-.25-.92,1,1,0,0,0-.79-.3,1.34,1.34,0,0,0-1,.39,1.45,1.45,0,0,0-.37,1.05V294Z"
        />
        <path
          className="cls-51"
          d="M318.55,296a3.32,3.32,0,0,1-1.78-.46l.12-.6a3.82,3.82,0,0,0,.8.35,2.89,2.89,0,0,0,.86.11,1.3,1.3,0,0,0,1-.35,1.39,1.39,0,0,0,.34-1v-1.22l.1-.12a1.61,1.61,0,0,1-.34.63,1.54,1.54,0,0,1-.56.41,2,2,0,0,1-.75.14,1.89,1.89,0,0,1-1.77-1.07,2.81,2.81,0,0,1,0-2.36,1.93,1.93,0,0,1,1.77-1.07,1.82,1.82,0,0,1,1.06.31,1.54,1.54,0,0,1,.59.87l-.11-.1v-1h.73V294a2,2,0,0,1-.52,1.53A2.07,2.07,0,0,1,318.55,296Zm-.09-2.75a1.29,1.29,0,0,0,1-.44,2.13,2.13,0,0,0,0-2.4,1.29,1.29,0,0,0-1-.44,1.34,1.34,0,0,0-1,.44,2.1,2.1,0,0,0,0,2.41A1.34,1.34,0,0,0,318.46,293.28Z"
        />
        <path
          className="cls-51"
          d="M323.53,294.09a2.58,2.58,0,0,1-1.81-.59L322,293a2.49,2.49,0,0,0,1.59.53,1.39,1.39,0,0,0,.78-.17.58.58,0,0,0,.27-.51.55.55,0,0,0-.18-.43,1.42,1.42,0,0,0-.6-.25l-.76-.18a1.79,1.79,0,0,1-.88-.45,1.09,1.09,0,0,1-.31-.78,1.12,1.12,0,0,1,.22-.69,1.38,1.38,0,0,1,.6-.48,2.32,2.32,0,0,1,.92-.17,2.66,2.66,0,0,1,.9.15,1.92,1.92,0,0,1,.71.45l-.24.53a2.24,2.24,0,0,0-.67-.4,1.85,1.85,0,0,0-.7-.13,1.22,1.22,0,0,0-.75.19.58.58,0,0,0-.27.51.6.6,0,0,0,.17.44,1.14,1.14,0,0,0,.53.25l.77.19a1.8,1.8,0,0,1,.94.45,1.06,1.06,0,0,1,.3.78,1.12,1.12,0,0,1-.48.94A2.17,2.17,0,0,1,323.53,294.09Z"
        />
        <path
          className="cls-51"
          d="M325.79,290.08v-.58h2.9v.58Zm2.88,3.3V294l-.3.07-.33,0a1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.37-1.08v-4.31l.73-.26v4.47a1.22,1.22,0,0,0,.1.56.56.56,0,0,0,.28.27,1.07,1.07,0,0,0,.41.08l.24,0Z"
        />
        <path
          className="cls-51"
          d="M333.28,293.49a2.24,2.24,0,0,1-.76.44,2.79,2.79,0,0,1-.95.16,2.43,2.43,0,0,1-1.21-.28,1.88,1.88,0,0,1-.78-.8,2.75,2.75,0,0,1-.28-1.26,2.65,2.65,0,0,1,.27-1.23,2,2,0,0,1,.76-.83,2.05,2.05,0,0,1,1.11-.3,1.91,1.91,0,0,1,1,.27,1.64,1.64,0,0,1,.66.76,2.69,2.69,0,0,1,.23,1.19v.13h-3.42v-.48h3l-.23.34a1.89,1.89,0,0,0-.32-1.22,1.12,1.12,0,0,0-.95-.42,1.23,1.23,0,0,0-1,.46,2.42,2.42,0,0,0,0,2.62,1.45,1.45,0,0,0,1.15.45,2.38,2.38,0,0,0,.76-.13,2.48,2.48,0,0,0,.7-.4Z"
        />
        <path
          className="cls-51"
          d="M334.7,294h-.89l1.88-2.33.43-.54,1.31-1.66h.89l-1.76,2.2-.44.54Zm2.85,0-1.43-1.79-.43-.54-1.77-2.2h.88l1.32,1.66.44.54,1.86,2.33Z"
        />
        <path
          className="cls-51"
          d="M338.59,290.08v-.58h2.91v.58Zm2.89,3.3V294l-.3.07-.33,0a1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.38-1.08v-4.31l.73-.26v4.47a1.21,1.21,0,0,0,.11.56.56.56,0,0,0,.28.27,1.06,1.06,0,0,0,.4.08l.25,0Z"
        />
        <path
          className="cls-51"
          d="M119.16,305v-6.41h2.57a2.31,2.31,0,0,1,1.52.44,1.64,1.64,0,0,1,.25,2.17,1.63,1.63,0,0,1-.83.55v-.07a1.51,1.51,0,0,1,.94.53,1.55,1.55,0,0,1,.34,1,1.57,1.57,0,0,1-.55,1.3,2.48,2.48,0,0,1-1.58.45Zm.73-3.57h1.72a1.77,1.77,0,0,0,1.1-.28,1,1,0,0,0,.36-.85,1,1,0,0,0-.36-.82,1.75,1.75,0,0,0-1.1-.28h-1.72Zm0,3h1.87a1.85,1.85,0,0,0,1.11-.27,1,1,0,0,0,.36-.88,1.08,1.08,0,0,0-.36-.88,1.71,1.71,0,0,0-1.11-.3h-1.87Z"
        />
        <path
          className="cls-51"
          d="M128.9,304.49a2.15,2.15,0,0,1-.76.44,2.75,2.75,0,0,1-.95.16,2.46,2.46,0,0,1-1.21-.28,1.94,1.94,0,0,1-.78-.8,2.75,2.75,0,0,1-.27-1.26,2.65,2.65,0,0,1,.27-1.23,2,2,0,0,1,.75-.83,2.05,2.05,0,0,1,1.11-.3,1.88,1.88,0,0,1,1,.27,1.72,1.72,0,0,1,.67.76,2.84,2.84,0,0,1,.23,1.19v.13h-3.42v-.48h3l-.23.34a1.89,1.89,0,0,0-.31-1.22,1.15,1.15,0,0,0-1-.42,1.24,1.24,0,0,0-1,.46,2.4,2.4,0,0,0,0,2.62,1.43,1.43,0,0,0,1.14.45,2.38,2.38,0,0,0,.76-.13,2.35,2.35,0,0,0,.7-.4Z"
        />
        <path
          className="cls-51"
          d="M131.62,305.09a2.61,2.61,0,0,1-1.81-.59l.25-.53a2.44,2.44,0,0,0,.74.4,2.53,2.53,0,0,0,.85.13,1.41,1.41,0,0,0,.78-.17.57.57,0,0,0,.26-.51.55.55,0,0,0-.18-.43,1.37,1.37,0,0,0-.59-.25l-.77-.18a1.76,1.76,0,0,1-.87-.45,1.09,1.09,0,0,1-.31-.78,1.17,1.17,0,0,1,.21-.69,1.47,1.47,0,0,1,.61-.48,2.27,2.27,0,0,1,.91-.17,2.66,2.66,0,0,1,.9.15,1.84,1.84,0,0,1,.71.45l-.24.53a2.09,2.09,0,0,0-.66-.4,1.87,1.87,0,0,0-.71-.13,1.26,1.26,0,0,0-.75.19.65.65,0,0,0-.1.95,1.13,1.13,0,0,0,.54.25l.76.19a1.76,1.76,0,0,1,.94.45,1,1,0,0,1,.31.78,1.12,1.12,0,0,1-.48.94A2.18,2.18,0,0,1,131.62,305.09Z"
        />
        <path
          className="cls-51"
          d="M136.46,305.09a2.27,2.27,0,0,1-1.16-.29,2,2,0,0,1-.75-.81,2.79,2.79,0,0,1-.26-1.23,2.73,2.73,0,0,1,.27-1.24,2,2,0,0,1,.76-.83,2.21,2.21,0,0,1,1.17-.3,2.46,2.46,0,0,1,.89.16,1.78,1.78,0,0,1,.7.44l-.24.54a2.72,2.72,0,0,0-.65-.4,1.85,1.85,0,0,0-.66-.13,1.4,1.4,0,0,0-1.09.46,2,2,0,0,0-.4,1.3,1.85,1.85,0,0,0,.4,1.28,1.37,1.37,0,0,0,1.09.45,1.84,1.84,0,0,0,.65-.13,2.85,2.85,0,0,0,.66-.39l.24.53a1.85,1.85,0,0,1-.72.43A2.51,2.51,0,0,1,136.46,305.09Z"
        />
        <path
          className="cls-51"
          d="M139,305V298.4h.73v3l-.12.09a1.54,1.54,0,0,1,.63-.83,1.87,1.87,0,0,1,1-.29c1.09,0,1.63.6,1.63,1.79V305h-.73v-2.81a1.37,1.37,0,0,0-.25-.92,1,1,0,0,0-.79-.3,1.34,1.34,0,0,0-1,.39,1.45,1.45,0,0,0-.38,1.05V305Z"
        />
        <path
          className="cls-51"
          d="M144.28,305v-3.26c0-.21,0-.42,0-.64s0-.42-.06-.63h.7l.1,1.12-.1,0a1.39,1.39,0,0,1,.54-.9,1.57,1.57,0,0,1,.94-.3l.22,0a.65.65,0,0,1,.2,0l0,.66a1.43,1.43,0,0,0-.48-.07,1.23,1.23,0,0,0-.75.21,1.15,1.15,0,0,0-.41.52,1.74,1.74,0,0,0-.13.67V305Z"
        />
        <path
          className="cls-51"
          d="M147.46,298.58h.89v.83h-.89Zm.07,6.45V300.5h.73V305Z"
        />
        <path
          className="cls-51"
          d="M149,301.08v-.58h2.71v.58Zm2.84-2a1.62,1.62,0,0,0-.47-.07,1,1,0,0,0-.39.07.53.53,0,0,0-.27.28,1.17,1.17,0,0,0-.1.55V305h-.73v-5.22a1.48,1.48,0,0,1,.36-1.09,1.37,1.37,0,0,1,1-.35,1.67,1.67,0,0,1,.31,0l.3.06Z"
        />
        <path
          className="cls-51"
          d="M151.87,301.08v-.58h2.91v.58Zm2.89,3.3V305l-.3.07-.33,0a1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.38-1.08v-4.31l.73-.26v4.47a1.21,1.21,0,0,0,.11.56.56.56,0,0,0,.28.27,1.07,1.07,0,0,0,.41.08l.24,0Z"
        />
        <path
          className="cls-51"
          d="M157.26,305.09a1.58,1.58,0,0,1-1.22-.45,1.92,1.92,0,0,1-.41-1.33V300.5h.73v2.79a1.38,1.38,0,0,0,.25.9,1,1,0,0,0,.77.29,1.27,1.27,0,0,0,1-.39,1.42,1.42,0,0,0,.37-1V300.5h.73V305h-.71v-1l.11-.06a1.56,1.56,0,0,1-.61.82A1.73,1.73,0,0,1,157.26,305.09Z"
        />
        <path
          className="cls-51"
          d="M160.85,305v-3.26c0-.21,0-.42,0-.64s0-.42-.06-.63h.7l.08.94-.09.07a1.45,1.45,0,0,1,.63-.83,1.81,1.81,0,0,1,1-.29c1.09,0,1.63.6,1.63,1.79V305H164v-2.81a1.37,1.37,0,0,0-.25-.92,1,1,0,0,0-.79-.3,1.34,1.34,0,0,0-1,.39,1.45,1.45,0,0,0-.38,1.05V305Z"
        />
        <path
          className="cls-51"
          d="M168.11,307a3.3,3.3,0,0,1-1.78-.46l.12-.6a3.61,3.61,0,0,0,.8.35,2.85,2.85,0,0,0,.86.11,1.3,1.3,0,0,0,1-.35,1.39,1.39,0,0,0,.34-1v-1.22l.1-.12a1.61,1.61,0,0,1-.34.63,1.54,1.54,0,0,1-.56.41,2,2,0,0,1-.76.14,1.92,1.92,0,0,1-1.05-.28,1.88,1.88,0,0,1-.71-.79,2.81,2.81,0,0,1,0-2.36,1.85,1.85,0,0,1,.71-.78,1.92,1.92,0,0,1,1.05-.29,1.85,1.85,0,0,1,1.07.31,1.54,1.54,0,0,1,.59.87l-.11-.1v-1h.73V305a2,2,0,0,1-.52,1.53A2.07,2.07,0,0,1,168.11,307Zm-.09-2.75a1.29,1.29,0,0,0,1-.44,2.13,2.13,0,0,0,0-2.4,1.29,1.29,0,0,0-1-.44,1.32,1.32,0,0,0-1.05.44,2.1,2.1,0,0,0,0,2.41A1.31,1.31,0,0,0,168,304.28Z"
        />
        <path
          className="cls-51"
          d="M173.09,305.09a2.58,2.58,0,0,1-1.81-.59l.24-.53a2.49,2.49,0,0,0,1.59.53,1.41,1.41,0,0,0,.78-.17.58.58,0,0,0,.27-.51.55.55,0,0,0-.18-.43,1.42,1.42,0,0,0-.6-.25l-.76-.18a1.79,1.79,0,0,1-.88-.45,1.09,1.09,0,0,1-.31-.78,1.12,1.12,0,0,1,.22-.69,1.38,1.38,0,0,1,.6-.48,2.32,2.32,0,0,1,.92-.17,2.74,2.74,0,0,1,.9.15,1.92,1.92,0,0,1,.71.45l-.25.53a2.09,2.09,0,0,0-.66-.4,1.85,1.85,0,0,0-.7-.13,1.28,1.28,0,0,0-.76.19.59.59,0,0,0-.26.51.57.57,0,0,0,.17.44,1.14,1.14,0,0,0,.53.25l.77.19a1.8,1.8,0,0,1,.94.45,1.06,1.06,0,0,1,.3.78,1.12,1.12,0,0,1-.48.94A2.17,2.17,0,0,1,173.09,305.09Z"
        />
        <path
          className="cls-51"
          d="M175.34,301.08v-.58h2.91v.58Zm2.89,3.3V305l-.3.07-.33,0a1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.37-1.08v-4.31l.72-.26v4.47a1.21,1.21,0,0,0,.11.56.56.56,0,0,0,.28.27,1.07,1.07,0,0,0,.41.08l.24,0Z"
        />
        <path
          className="cls-51"
          d="M182.84,304.49a2.24,2.24,0,0,1-.76.44,2.83,2.83,0,0,1-1,.16,2.43,2.43,0,0,1-1.21-.28,1.88,1.88,0,0,1-.78-.8,3,3,0,0,1,0-2.49,2,2,0,0,1,.75-.83,2.11,2.11,0,0,1,1.12-.3,1.91,1.91,0,0,1,1,.27,1.64,1.64,0,0,1,.66.76,2.69,2.69,0,0,1,.23,1.19v.13H179.5v-.48h3l-.24.34a1.83,1.83,0,0,0-.31-1.22,1.15,1.15,0,0,0-1-.42,1.26,1.26,0,0,0-1,.46,2.05,2.05,0,0,0-.37,1.28A2,2,0,0,0,180,304a1.45,1.45,0,0,0,1.15.45,2.43,2.43,0,0,0,.76-.13,2.48,2.48,0,0,0,.7-.4Z"
        />
        <path
          className="cls-51"
          d="M184.26,305h-.89l1.88-2.33.43-.54L187,300.5h.89l-1.76,2.2-.44.54Zm2.85,0-1.43-1.79-.43-.54-1.77-2.2h.88l1.32,1.66.44.54L188,305Z"
        />
        <path
          className="cls-51"
          d="M188.15,301.08v-.58h2.91v.58Zm2.89,3.3V305l-.3.07-.33,0a1.36,1.36,0,0,1-1-.36,1.43,1.43,0,0,1-.38-1.08v-4.31l.73-.26v4.47a1.37,1.37,0,0,0,.1.56.58.58,0,0,0,.29.27,1,1,0,0,0,.4.08l.25,0Z"
        />
        <path
          className="cls-51"
          d="M194.38,305v-6.41H197a2.31,2.31,0,0,1,1.52.44,1.64,1.64,0,0,1,.25,2.17,1.63,1.63,0,0,1-.83.55v-.07a1.48,1.48,0,0,1,.94.53,1.56,1.56,0,0,1,.35,1,1.58,1.58,0,0,1-.56,1.3A2.46,2.46,0,0,1,197,305Zm.73-3.57h1.73a1.75,1.75,0,0,0,1.09-.28,1,1,0,0,0,.36-.85,1,1,0,0,0-.36-.82,1.73,1.73,0,0,0-1.09-.28h-1.73Zm0,3H197a1.85,1.85,0,0,0,1.11-.27,1,1,0,0,0,.36-.88,1.08,1.08,0,0,0-.36-.88,1.71,1.71,0,0,0-1.11-.3h-1.87Z"
        />
        <path
          className="cls-51"
          d="M204.13,304.49a2.29,2.29,0,0,1-.77.44,2.73,2.73,0,0,1-.94.16,2.47,2.47,0,0,1-1.22-.28,2,2,0,0,1-.78-.8,2.75,2.75,0,0,1-.27-1.26,2.65,2.65,0,0,1,.27-1.23,2,2,0,0,1,.75-.83,2.05,2.05,0,0,1,1.11-.3,1.94,1.94,0,0,1,1,.27,1.76,1.76,0,0,1,.66.76,2.84,2.84,0,0,1,.23,1.19v.13h-3.42v-.48h3l-.23.34a1.89,1.89,0,0,0-.31-1.22,1.15,1.15,0,0,0-1-.42,1.24,1.24,0,0,0-1,.46,2.45,2.45,0,0,0,0,2.62,1.43,1.43,0,0,0,1.14.45,2.49,2.49,0,0,0,.77-.13,2.43,2.43,0,0,0,.69-.4Z"
        />
        <path
          className="cls-51"
          d="M206.84,305.09a2.61,2.61,0,0,1-1.81-.59l.25-.53a2.44,2.44,0,0,0,.74.4,2.57,2.57,0,0,0,.85.13,1.41,1.41,0,0,0,.78-.17.57.57,0,0,0,.26-.51.55.55,0,0,0-.18-.43,1.37,1.37,0,0,0-.59-.25l-.76-.18a1.75,1.75,0,0,1-.88-.45,1.09,1.09,0,0,1-.31-.78,1.17,1.17,0,0,1,.21-.69,1.47,1.47,0,0,1,.61-.48,2.27,2.27,0,0,1,.91-.17,2.66,2.66,0,0,1,.9.15,2,2,0,0,1,.72.45l-.25.53a2.09,2.09,0,0,0-.66-.4,1.87,1.87,0,0,0-.71-.13,1.26,1.26,0,0,0-.75.19.65.65,0,0,0-.1.95,1.13,1.13,0,0,0,.54.25l.76.19a1.84,1.84,0,0,1,.95.45,1.06,1.06,0,0,1,.3.78,1.12,1.12,0,0,1-.48.94A2.18,2.18,0,0,1,206.84,305.09Z"
        />
        <path
          className="cls-51"
          d="M211.68,305.09a2.27,2.27,0,0,1-1.16-.29,2,2,0,0,1-.75-.81,2.79,2.79,0,0,1-.26-1.23,2.73,2.73,0,0,1,.27-1.24,2,2,0,0,1,.76-.83,2.21,2.21,0,0,1,1.17-.3,2.46,2.46,0,0,1,.89.16,1.9,1.9,0,0,1,.71.44l-.25.54a2.72,2.72,0,0,0-.65-.4,1.85,1.85,0,0,0-.66-.13,1.4,1.4,0,0,0-1.09.46,2,2,0,0,0-.4,1.3,1.9,1.9,0,0,0,.4,1.28,1.37,1.37,0,0,0,1.09.45,1.94,1.94,0,0,0,.66-.13,3,3,0,0,0,.65-.39l.25.53a2,2,0,0,1-.73.43A2.51,2.51,0,0,1,211.68,305.09Z"
        />
        <path
          className="cls-51"
          d="M214.23,305V298.4H215v3l-.12.09a1.54,1.54,0,0,1,.63-.83,1.87,1.87,0,0,1,1-.29c1.09,0,1.63.6,1.63,1.79V305h-.73v-2.81a1.37,1.37,0,0,0-.25-.92,1,1,0,0,0-.79-.3,1.34,1.34,0,0,0-1,.39,1.45,1.45,0,0,0-.38,1.05V305Z"
        />
        <path
          className="cls-51"
          d="M219.5,305v-3.26c0-.21,0-.42,0-.64a4.48,4.48,0,0,0-.06-.63h.7l.1,1.12-.1,0a1.39,1.39,0,0,1,.54-.9,1.57,1.57,0,0,1,.94-.3l.22,0a.65.65,0,0,1,.2,0l0,.66a1.43,1.43,0,0,0-.48-.07,1.23,1.23,0,0,0-.75.21,1.15,1.15,0,0,0-.41.52,1.74,1.74,0,0,0-.13.67V305Z"
        />
        <path
          className="cls-51"
          d="M222.68,298.58h.89v.83h-.89Zm.08,6.45V300.5h.72V305Z"
        />
        <path
          className="cls-51"
          d="M224.26,301.08v-.58H227v.58Zm2.84-2a1.62,1.62,0,0,0-.47-.07,1,1,0,0,0-.39.07.57.57,0,0,0-.27.28,1.17,1.17,0,0,0-.1.55V305h-.73v-5.22a1.48,1.48,0,0,1,.36-1.09,1.37,1.37,0,0,1,1-.35,1.67,1.67,0,0,1,.31,0l.3.06Z"
        />
        <path
          className="cls-51"
          d="M227.09,301.08v-.58H230v.58Zm2.89,3.3V305l-.3.07-.33,0a1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.38-1.08v-4.31l.73-.26v4.47a1.21,1.21,0,0,0,.11.56.56.56,0,0,0,.28.27,1.07,1.07,0,0,0,.41.08l.24,0Z"
        />
        <path
          className="cls-51"
          d="M232.48,305.09a1.58,1.58,0,0,1-1.22-.45,1.92,1.92,0,0,1-.41-1.33V300.5h.73v2.79a1.32,1.32,0,0,0,.26.9,1,1,0,0,0,.76.29,1.27,1.27,0,0,0,1-.39,1.42,1.42,0,0,0,.37-1V300.5h.73V305H234v-1l.11-.06a1.51,1.51,0,0,1-.61.82A1.71,1.71,0,0,1,232.48,305.09Z"
        />
        <path
          className="cls-51"
          d="M236.07,305v-3.26c0-.21,0-.42,0-.64s0-.42-.06-.63h.7l.08.94-.09.07a1.45,1.45,0,0,1,.63-.83,1.81,1.81,0,0,1,1-.29c1.09,0,1.63.6,1.63,1.79V305h-.73v-2.81a1.37,1.37,0,0,0-.25-.92,1,1,0,0,0-.79-.3,1.34,1.34,0,0,0-1,.39,1.45,1.45,0,0,0-.38,1.05V305Z"
        />
        <path
          className="cls-51"
          d="M243.33,307a3.3,3.3,0,0,1-1.78-.46l.12-.6a3.61,3.61,0,0,0,.8.35,2.89,2.89,0,0,0,.86.11,1.3,1.3,0,0,0,1-.35,1.39,1.39,0,0,0,.34-1v-1.22l.1-.12a1.61,1.61,0,0,1-.34.63,1.54,1.54,0,0,1-.56.41,2,2,0,0,1-.76.14,1.92,1.92,0,0,1-1.05-.28,1.88,1.88,0,0,1-.71-.79,2.81,2.81,0,0,1,0-2.36,1.85,1.85,0,0,1,.71-.78,1.92,1.92,0,0,1,1.05-.29,1.85,1.85,0,0,1,1.07.31,1.54,1.54,0,0,1,.59.87l-.11-.1v-1h.73V305a2,2,0,0,1-.52,1.53A2.07,2.07,0,0,1,243.33,307Zm-.09-2.75a1.29,1.29,0,0,0,1-.44,2.13,2.13,0,0,0,0-2.4,1.29,1.29,0,0,0-1-.44,1.33,1.33,0,0,0-1.05.44,2.1,2.1,0,0,0,0,2.41A1.32,1.32,0,0,0,243.24,304.28Z"
        />
        <path
          className="cls-51"
          d="M248.31,305.09a2.58,2.58,0,0,1-1.81-.59l.24-.53a2.49,2.49,0,0,0,1.59.53,1.41,1.41,0,0,0,.78-.17.58.58,0,0,0,.27-.51.55.55,0,0,0-.18-.43,1.42,1.42,0,0,0-.6-.25l-.76-.18a1.79,1.79,0,0,1-.88-.45,1.09,1.09,0,0,1-.31-.78,1.12,1.12,0,0,1,.22-.69,1.38,1.38,0,0,1,.6-.48,2.32,2.32,0,0,1,.92-.17,2.74,2.74,0,0,1,.9.15,1.92,1.92,0,0,1,.71.45l-.25.53a2.09,2.09,0,0,0-.66-.4,1.85,1.85,0,0,0-.7-.13,1.22,1.22,0,0,0-.75.19.58.58,0,0,0-.27.51.6.6,0,0,0,.17.44,1.14,1.14,0,0,0,.53.25l.77.19a1.8,1.8,0,0,1,.94.45,1.06,1.06,0,0,1,.3.78,1.12,1.12,0,0,1-.48.94A2.17,2.17,0,0,1,248.31,305.09Z"
        />
        <path
          className="cls-51"
          d="M250.56,301.08v-.58h2.91v.58Zm2.89,3.3V305l-.3.07-.33,0a1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.37-1.08v-4.31l.73-.26v4.47a1.22,1.22,0,0,0,.1.56.56.56,0,0,0,.28.27,1.07,1.07,0,0,0,.41.08l.24,0Z"
        />
        <path
          className="cls-51"
          d="M258.06,304.49a2.24,2.24,0,0,1-.76.44,2.79,2.79,0,0,1-.95.16,2.43,2.43,0,0,1-1.21-.28,1.88,1.88,0,0,1-.78-.8,3,3,0,0,1,0-2.49,2,2,0,0,1,.76-.83,2.05,2.05,0,0,1,1.11-.3,1.91,1.91,0,0,1,1,.27,1.64,1.64,0,0,1,.66.76,2.69,2.69,0,0,1,.23,1.19v.13h-3.42v-.48h3l-.24.34a1.83,1.83,0,0,0-.31-1.22,1.13,1.13,0,0,0-.95-.42,1.26,1.26,0,0,0-1,.46,2.05,2.05,0,0,0-.37,1.28,2,2,0,0,0,.39,1.34,1.45,1.45,0,0,0,1.15.45,2.43,2.43,0,0,0,.76-.13,2.48,2.48,0,0,0,.7-.4Z"
        />
        <path
          className="cls-51"
          d="M259.48,305h-.89l1.88-2.33.43-.54,1.31-1.66h.89l-1.76,2.2-.44.54Zm2.85,0-1.43-1.79-.43-.54-1.77-2.2h.88l1.32,1.66.44.54L263.2,305Z"
        />
        <path
          className="cls-51"
          d="M263.37,301.08v-.58h2.91v.58Zm2.89,3.3V305l-.3.07-.33,0a1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.38-1.08v-4.31l.73-.26v4.47a1.21,1.21,0,0,0,.11.56.53.53,0,0,0,.28.27,1,1,0,0,0,.4.08l.25,0Z"
        />
      </g>
      <g className="cls-73" style={{ fill: 'rgb(var(--lotta-text-color))' }}>
        <text className="cls-42" transform="translate(118.37 359.3)">
          <tspan className="cls-43">T</tspan>
          <tspan className="cls-44" x="5.74" y="0">
            e
          </tspan>
          <tspan x="12.68" y="0">
            xt- und{' '}
          </tspan>
          <tspan className="cls-45" x="56.36" y="0">
            Ü
          </tspan>
          <tspan x="66.05" y="0">
            bers
          </tspan>
          <tspan className="cls-46" x="91.17" y="0">
            c
          </tspan>
          <tspan x="97.69" y="0">
            h
          </tspan>
          <tspan className="cls-47" x="104.82" y="0">
            r
          </tspan>
          <tspan x="109.88" y="0">
            i
          </tspan>
          <tspan className="cls-48" x="113.12" y="0">
            f
          </tspan>
          <tspan className="cls-49" x="117.44" y="0">
            t
          </tspan>
          <tspan x="121.1" y="0">
            en
          </tspan>
          <tspan className="cls-50" x="135.42" y="0">
            f
          </tspan>
          <tspan x="139.48" y="0">
            arbe{' '}
          </tspan>
        </text>
        <path
          className="cls-51"
          d="M119.16,381.81V375.4h2.57a2.37,2.37,0,0,1,1.52.44,1.65,1.65,0,0,1,.25,2.18,1.68,1.68,0,0,1-.83.54v-.07a1.6,1.6,0,0,1,.94.53,1.59,1.59,0,0,1,.34,1,1.57,1.57,0,0,1-.55,1.3,2.48,2.48,0,0,1-1.58.45Zm.73-3.56h1.72a1.76,1.76,0,0,0,1.1-.29,1,1,0,0,0,.36-.85,1,1,0,0,0-.36-.82,1.82,1.82,0,0,0-1.1-.27h-1.72Zm0,2.95h1.87a1.78,1.78,0,0,0,1.11-.28,1,1,0,0,0,.36-.87,1.1,1.1,0,0,0-.36-.89,1.78,1.78,0,0,0-1.11-.29h-1.87Z"
        />
        <path
          className="cls-51"
          d="M128.9,381.27a2,2,0,0,1-.76.44,2.75,2.75,0,0,1-.95.16,2.57,2.57,0,0,1-1.21-.27,2,2,0,0,1-.78-.81,2.73,2.73,0,0,1-.27-1.26,2.68,2.68,0,0,1,.27-1.23,2.08,2.08,0,0,1,.75-.83,2,2,0,0,1,1.11-.29,1.88,1.88,0,0,1,1,.26,1.78,1.78,0,0,1,.67.76,2.87,2.87,0,0,1,.23,1.19v.13h-3.42v-.47h3l-.23.33a1.86,1.86,0,0,0-.31-1.21,1.13,1.13,0,0,0-1-.43,1.25,1.25,0,0,0-1,.47,2.38,2.38,0,0,0,0,2.61,1.43,1.43,0,0,0,1.14.45,2.13,2.13,0,0,0,.76-.13,2.35,2.35,0,0,0,.7-.4Z"
        />
        <path
          className="cls-51"
          d="M131.62,381.87a2.66,2.66,0,0,1-1.81-.58l.25-.54a2.47,2.47,0,0,0,.74.41,2.53,2.53,0,0,0,.85.13,1.41,1.41,0,0,0,.78-.18.55.55,0,0,0,.26-.51.53.53,0,0,0-.18-.42,1.36,1.36,0,0,0-.59-.26l-.77-.18a1.61,1.61,0,0,1-.87-.45,1.06,1.06,0,0,1-.31-.77,1.18,1.18,0,0,1,.21-.7,1.45,1.45,0,0,1,.61-.47,2.11,2.11,0,0,1,.91-.17,2.66,2.66,0,0,1,.9.15,1.82,1.82,0,0,1,.71.44l-.24.53a2.29,2.29,0,0,0-.66-.4,1.87,1.87,0,0,0-.71-.13,1.26,1.26,0,0,0-.75.19.62.62,0,0,0-.26.51.57.57,0,0,0,.16.44,1.13,1.13,0,0,0,.54.25l.76.19a1.76,1.76,0,0,1,.94.45,1.06,1.06,0,0,1,.31.79,1.09,1.09,0,0,1-.48.93A2.11,2.11,0,0,1,131.62,381.87Z"
        />
        <path
          className="cls-51"
          d="M136.46,381.87a2.27,2.27,0,0,1-1.16-.28,2.09,2.09,0,0,1-.75-.81,2.8,2.8,0,0,1-.26-1.24,2.65,2.65,0,0,1,.27-1.23,2,2,0,0,1,.76-.84,2.21,2.21,0,0,1,1.17-.29,2.68,2.68,0,0,1,.89.15,1.9,1.9,0,0,1,.7.44l-.24.54a3,3,0,0,0-.65-.39,1.65,1.65,0,0,0-.66-.13,1.36,1.36,0,0,0-1.09.46,1.91,1.91,0,0,0-.4,1.29,1.84,1.84,0,0,0,.4,1.28,1.37,1.37,0,0,0,1.09.45,1.64,1.64,0,0,0,.65-.13,2.85,2.85,0,0,0,.66-.39l.24.54a2.12,2.12,0,0,1-.72.43A2.74,2.74,0,0,1,136.46,381.87Z"
        />
        <path
          className="cls-51"
          d="M139,381.81v-6.62h.73v3l-.12.09a1.61,1.61,0,0,1,.63-.83,1.86,1.86,0,0,1,1-.28c1.09,0,1.63.59,1.63,1.79v2.84h-.73V379a1.39,1.39,0,0,0-.25-.92,1,1,0,0,0-.79-.29,1.34,1.34,0,0,0-1,.39,1.41,1.41,0,0,0-.38,1v2.59Z"
        />
        <path
          className="cls-51"
          d="M144.28,381.81v-3.26c0-.21,0-.42,0-.63s0-.43-.06-.64h.7l.1,1.12-.1,0a1.39,1.39,0,0,1,.54-.89,1.57,1.57,0,0,1,.94-.3h.22l.2,0,0,.67a1.42,1.42,0,0,0-.48-.08,1.23,1.23,0,0,0-.75.21,1.13,1.13,0,0,0-.41.53,1.67,1.67,0,0,0-.13.67v2.58Z"
        />
        <path
          className="cls-51"
          d="M147.46,375.37h.89v.82h-.89Zm.07,6.44v-4.53h.73v4.53Z"
        />
        <path
          className="cls-51"
          d="M149,377.86v-.58h2.71v.58Zm2.84-2a2.06,2.06,0,0,0-.47-.07,1,1,0,0,0-.39.08.51.51,0,0,0-.27.27,1.2,1.2,0,0,0-.1.55v5.13h-.73v-5.22a1.44,1.44,0,0,1,.36-1.08,1.34,1.34,0,0,1,1-.36l.31,0a1.59,1.59,0,0,1,.3.06Z"
        />
        <path
          className="cls-51"
          d="M151.87,377.86v-.58h2.91v.58Zm2.89,3.3v.62a1.63,1.63,0,0,1-.3.07,1.72,1.72,0,0,1-.33,0,1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.38-1.08v-4.31l.73-.26v4.48a1.19,1.19,0,0,0,.11.55.58.58,0,0,0,.28.28,1.07,1.07,0,0,0,.41.07h.24Z"
        />
        <path
          className="cls-51"
          d="M157.26,381.87a1.58,1.58,0,0,1-1.22-.45,1.92,1.92,0,0,1-.41-1.33v-2.81h.73v2.79a1.38,1.38,0,0,0,.25.9,1,1,0,0,0,.77.29,1.3,1.3,0,0,0,1-.38,1.44,1.44,0,0,0,.37-1v-2.56h.73v4.53h-.71v-1l.11-.05a1.56,1.56,0,0,1-.61.82A1.8,1.8,0,0,1,157.26,381.87Z"
        />
        <path
          className="cls-51"
          d="M160.85,381.81v-3.26c0-.21,0-.42,0-.63s0-.43-.06-.64h.7l.08.94-.09.07a1.52,1.52,0,0,1,.63-.83,1.81,1.81,0,0,1,1-.28c1.09,0,1.63.59,1.63,1.79v2.84H164V379a1.39,1.39,0,0,0-.25-.92,1,1,0,0,0-.79-.29,1.34,1.34,0,0,0-1,.39,1.41,1.41,0,0,0-.38,1v2.59Z"
        />
        <path
          className="cls-51"
          d="M168.11,383.82a3.3,3.3,0,0,1-1.78-.47l.12-.59a4.15,4.15,0,0,0,.8.35,3.21,3.21,0,0,0,.86.11,1.3,1.3,0,0,0,1-.35,1.41,1.41,0,0,0,.34-1v-1.23l.1-.11a1.5,1.5,0,0,1-.34.62,1.43,1.43,0,0,1-.56.41,1.81,1.81,0,0,1-.76.15,1.92,1.92,0,0,1-1.05-.29,1.88,1.88,0,0,1-.71-.79,2.41,2.41,0,0,1-.26-1.17,2.45,2.45,0,0,1,.26-1.18,1.88,1.88,0,0,1,.71-.79,1.92,1.92,0,0,1,1.05-.28,1.78,1.78,0,0,1,1.07.31,1.48,1.48,0,0,1,.59.86l-.11-.09v-1h.73v4.49a1.82,1.82,0,0,1-2,2.05Zm-.09-2.76a1.28,1.28,0,0,0,1-.43,1.78,1.78,0,0,0,.37-1.2,1.82,1.82,0,0,0-.37-1.21,1.28,1.28,0,0,0-1-.43,1.31,1.31,0,0,0-1.05.43,1.77,1.77,0,0,0-.38,1.21,1.73,1.73,0,0,0,.38,1.2A1.31,1.31,0,0,0,168,381.06Z"
        />
        <path
          className="cls-51"
          d="M173.09,381.87a2.63,2.63,0,0,1-1.81-.58l.24-.54a2.6,2.6,0,0,0,.74.41,2.57,2.57,0,0,0,.85.13,1.41,1.41,0,0,0,.78-.18.56.56,0,0,0,.27-.51.53.53,0,0,0-.18-.42,1.41,1.41,0,0,0-.6-.26l-.76-.18a1.64,1.64,0,0,1-.88-.45,1.06,1.06,0,0,1-.31-.77,1.12,1.12,0,0,1,.22-.7,1.36,1.36,0,0,1,.6-.47,2.16,2.16,0,0,1,.92-.17,2.74,2.74,0,0,1,.9.15,1.9,1.9,0,0,1,.71.44l-.25.53a2.29,2.29,0,0,0-.66-.4,1.85,1.85,0,0,0-.7-.13,1.28,1.28,0,0,0-.76.19.62.62,0,0,0-.26.51.54.54,0,0,0,.17.44,1.14,1.14,0,0,0,.53.25l.77.19a1.8,1.8,0,0,1,.94.45,1.16,1.16,0,0,1-.18,1.72A2.1,2.1,0,0,1,173.09,381.87Z"
        />
        <path
          className="cls-51"
          d="M175.34,377.86v-.58h2.91v.58Zm2.89,3.3v.62a1.63,1.63,0,0,1-.3.07,1.72,1.72,0,0,1-.33,0,1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.37-1.08v-4.31l.72-.26v4.48a1.19,1.19,0,0,0,.11.55.58.58,0,0,0,.28.28,1.07,1.07,0,0,0,.41.07H178Z"
        />
        <path
          className="cls-51"
          d="M182.84,381.27a2.09,2.09,0,0,1-.76.44,2.83,2.83,0,0,1-1,.16,2.54,2.54,0,0,1-1.21-.27,1.91,1.91,0,0,1-.78-.81,2.61,2.61,0,0,1-.28-1.26,2.68,2.68,0,0,1,.27-1.23,2.08,2.08,0,0,1,.75-.83,2.1,2.1,0,0,1,1.12-.29,1.9,1.9,0,0,1,1,.26,1.69,1.69,0,0,1,.66.76,2.72,2.72,0,0,1,.23,1.19v.13H179.5v-.47h3l-.24.33a1.8,1.8,0,0,0-.31-1.21,1.13,1.13,0,0,0-1-.43,1.26,1.26,0,0,0-1,.47,2,2,0,0,0-.37,1.28,2,2,0,0,0,.39,1.33,1.45,1.45,0,0,0,1.15.45,2.17,2.17,0,0,0,.76-.13,2.48,2.48,0,0,0,.7-.4Z"
        />
        <path
          className="cls-51"
          d="M184.26,381.81h-.89l1.88-2.33.43-.53,1.31-1.67h.89l-1.76,2.2-.44.55Zm2.85,0L185.68,380l-.43-.55-1.77-2.2h.88l1.32,1.67.44.53,1.86,2.33Z"
        />
        <path
          className="cls-51"
          d="M188.15,377.86v-.58h2.91v.58Zm2.89,3.3v.62a1.63,1.63,0,0,1-.3.07,1.72,1.72,0,0,1-.33,0,1.36,1.36,0,0,1-1-.36,1.43,1.43,0,0,1-.38-1.08v-4.31l.73-.26v4.48a1.35,1.35,0,0,0,.1.55.6.6,0,0,0,.29.28,1,1,0,0,0,.4.07h.25Z"
        />
        <path
          className="cls-51"
          d="M194.38,381.81V375.4H197a2.37,2.37,0,0,1,1.52.44,1.65,1.65,0,0,1,.25,2.18,1.68,1.68,0,0,1-.83.54v-.07a1.57,1.57,0,0,1,.94.53,1.59,1.59,0,0,1,.35,1,1.58,1.58,0,0,1-.56,1.3,2.46,2.46,0,0,1-1.58.45Zm.73-3.56h1.73a1.75,1.75,0,0,0,1.09-.29,1,1,0,0,0,.36-.85,1,1,0,0,0-.36-.82,1.8,1.8,0,0,0-1.09-.27h-1.73Zm0,2.95H197a1.78,1.78,0,0,0,1.11-.28,1,1,0,0,0,.36-.87,1.1,1.1,0,0,0-.36-.89,1.78,1.78,0,0,0-1.11-.29h-1.87Z"
        />
        <path
          className="cls-51"
          d="M204.13,381.27a2.13,2.13,0,0,1-.77.44,2.73,2.73,0,0,1-.94.16,2.58,2.58,0,0,1-1.22-.27,2,2,0,0,1-.78-.81,2.73,2.73,0,0,1-.27-1.26,2.68,2.68,0,0,1,.27-1.23,2.08,2.08,0,0,1,.75-.83,2,2,0,0,1,1.11-.29,1.94,1.94,0,0,1,1,.26,1.82,1.82,0,0,1,.66.76,2.87,2.87,0,0,1,.23,1.19v.13h-3.42v-.47h3l-.23.33a1.86,1.86,0,0,0-.31-1.21,1.13,1.13,0,0,0-1-.43,1.25,1.25,0,0,0-1,.47,2.43,2.43,0,0,0,0,2.61,1.43,1.43,0,0,0,1.14.45,2.22,2.22,0,0,0,.77-.13,2.43,2.43,0,0,0,.69-.4Z"
        />
        <path
          className="cls-51"
          d="M206.84,381.87a2.66,2.66,0,0,1-1.81-.58l.25-.54a2.47,2.47,0,0,0,.74.41,2.57,2.57,0,0,0,.85.13,1.41,1.41,0,0,0,.78-.18.55.55,0,0,0,.26-.51.53.53,0,0,0-.18-.42,1.36,1.36,0,0,0-.59-.26l-.76-.18a1.61,1.61,0,0,1-.88-.45,1.06,1.06,0,0,1-.31-.77,1.18,1.18,0,0,1,.21-.7,1.45,1.45,0,0,1,.61-.47,2.11,2.11,0,0,1,.91-.17,2.66,2.66,0,0,1,.9.15,1.94,1.94,0,0,1,.72.44l-.25.53a2.29,2.29,0,0,0-.66-.4,1.87,1.87,0,0,0-.71-.13,1.26,1.26,0,0,0-.75.19.62.62,0,0,0-.26.51.57.57,0,0,0,.16.44,1.13,1.13,0,0,0,.54.25l.76.19a1.84,1.84,0,0,1,.95.45,1.16,1.16,0,0,1-.18,1.72A2.11,2.11,0,0,1,206.84,381.87Z"
        />
        <path
          className="cls-51"
          d="M211.68,381.87a2.27,2.27,0,0,1-1.16-.28,2.09,2.09,0,0,1-.75-.81,2.8,2.8,0,0,1-.26-1.24,2.65,2.65,0,0,1,.27-1.23,2,2,0,0,1,.76-.84,2.21,2.21,0,0,1,1.17-.29,2.68,2.68,0,0,1,.89.15,2,2,0,0,1,.71.44l-.25.54a3,3,0,0,0-.65-.39,1.65,1.65,0,0,0-.66-.13,1.36,1.36,0,0,0-1.09.46,1.91,1.91,0,0,0-.4,1.29,1.89,1.89,0,0,0,.4,1.28,1.37,1.37,0,0,0,1.09.45,1.72,1.72,0,0,0,.66-.13,3,3,0,0,0,.65-.39l.25.54a2.27,2.27,0,0,1-.73.43A2.74,2.74,0,0,1,211.68,381.87Z"
        />
        <path
          className="cls-51"
          d="M214.23,381.81v-6.62H215v3l-.12.09a1.61,1.61,0,0,1,.63-.83,1.86,1.86,0,0,1,1-.28c1.09,0,1.63.59,1.63,1.79v2.84h-.73V379a1.39,1.39,0,0,0-.25-.92,1,1,0,0,0-.79-.29,1.34,1.34,0,0,0-1,.39,1.41,1.41,0,0,0-.38,1v2.59Z"
        />
        <path
          className="cls-51"
          d="M219.5,381.81v-3.26c0-.21,0-.42,0-.63a4.62,4.62,0,0,0-.06-.64h.7l.1,1.12-.1,0a1.39,1.39,0,0,1,.54-.89,1.57,1.57,0,0,1,.94-.3h.22l.2,0,0,.67a1.42,1.42,0,0,0-.48-.08,1.23,1.23,0,0,0-.75.21,1.13,1.13,0,0,0-.41.53,1.67,1.67,0,0,0-.13.67v2.58Z"
        />
        <path
          className="cls-51"
          d="M222.68,375.37h.89v.82h-.89Zm.08,6.44v-4.53h.72v4.53Z"
        />
        <path
          className="cls-51"
          d="M224.26,377.86v-.58H227v.58Zm2.84-2a2.06,2.06,0,0,0-.47-.07,1,1,0,0,0-.39.08.55.55,0,0,0-.27.27,1.2,1.2,0,0,0-.1.55v5.13h-.73v-5.22a1.44,1.44,0,0,1,.36-1.08,1.34,1.34,0,0,1,1-.36l.31,0a1.59,1.59,0,0,1,.3.06Z"
        />
        <path
          className="cls-51"
          d="M227.09,377.86v-.58H230v.58Zm2.89,3.3v.62a1.63,1.63,0,0,1-.3.07,1.72,1.72,0,0,1-.33,0,1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.38-1.08v-4.31l.73-.26v4.48a1.19,1.19,0,0,0,.11.55.58.58,0,0,0,.28.28,1.07,1.07,0,0,0,.41.07h.24Z"
        />
        <path
          className="cls-51"
          d="M232.48,381.87a1.58,1.58,0,0,1-1.22-.45,1.92,1.92,0,0,1-.41-1.33v-2.81h.73v2.79a1.32,1.32,0,0,0,.26.9.92.92,0,0,0,.76.29,1.3,1.3,0,0,0,1-.38,1.44,1.44,0,0,0,.37-1v-2.56h.73v4.53H234v-1l.11-.05a1.51,1.51,0,0,1-.61.82A1.78,1.78,0,0,1,232.48,381.87Z"
        />
        <path
          className="cls-51"
          d="M236.07,381.81v-3.26c0-.21,0-.42,0-.63s0-.43-.06-.64h.7l.08.94-.09.07a1.52,1.52,0,0,1,.63-.83,1.81,1.81,0,0,1,1-.28c1.09,0,1.63.59,1.63,1.79v2.84h-.73V379a1.39,1.39,0,0,0-.25-.92,1,1,0,0,0-.79-.29,1.34,1.34,0,0,0-1,.39,1.41,1.41,0,0,0-.38,1v2.59Z"
        />
        <path
          className="cls-51"
          d="M243.33,383.82a3.3,3.3,0,0,1-1.78-.47l.12-.59a4.15,4.15,0,0,0,.8.35,3.26,3.26,0,0,0,.86.11,1.3,1.3,0,0,0,1-.35,1.41,1.41,0,0,0,.34-1v-1.23l.1-.11a1.5,1.5,0,0,1-.34.62,1.43,1.43,0,0,1-.56.41,1.81,1.81,0,0,1-.76.15,1.92,1.92,0,0,1-1.05-.29,1.88,1.88,0,0,1-.71-.79,2.52,2.52,0,0,1-.26-1.17,2.57,2.57,0,0,1,.26-1.18,1.88,1.88,0,0,1,.71-.79,1.92,1.92,0,0,1,1.05-.28,1.78,1.78,0,0,1,1.07.31,1.48,1.48,0,0,1,.59.86l-.11-.09v-1h.73v4.49a1.82,1.82,0,0,1-2,2.05Zm-.09-2.76a1.28,1.28,0,0,0,1-.43,1.78,1.78,0,0,0,.37-1.2,1.82,1.82,0,0,0-.37-1.21,1.28,1.28,0,0,0-1-.43,1.32,1.32,0,0,0-1.05.43,1.83,1.83,0,0,0-.38,1.21,1.78,1.78,0,0,0,.38,1.2A1.32,1.32,0,0,0,243.24,381.06Z"
        />
        <path
          className="cls-51"
          d="M248.31,381.87a2.63,2.63,0,0,1-1.81-.58l.24-.54a2.6,2.6,0,0,0,.74.41,2.57,2.57,0,0,0,.85.13,1.41,1.41,0,0,0,.78-.18.56.56,0,0,0,.27-.51.53.53,0,0,0-.18-.42,1.41,1.41,0,0,0-.6-.26l-.76-.18a1.64,1.64,0,0,1-.88-.45,1.06,1.06,0,0,1-.31-.77,1.12,1.12,0,0,1,.22-.7,1.36,1.36,0,0,1,.6-.47,2.16,2.16,0,0,1,.92-.17,2.74,2.74,0,0,1,.9.15,1.9,1.9,0,0,1,.71.44l-.25.53a2.29,2.29,0,0,0-.66-.4,1.85,1.85,0,0,0-.7-.13,1.22,1.22,0,0,0-.75.19.6.6,0,0,0-.27.51.57.57,0,0,0,.17.44,1.14,1.14,0,0,0,.53.25l.77.19a1.8,1.8,0,0,1,.94.45,1.16,1.16,0,0,1-.18,1.72A2.1,2.1,0,0,1,248.31,381.87Z"
        />
        <path
          className="cls-51"
          d="M250.56,377.86v-.58h2.91v.58Zm2.89,3.3v.62a1.63,1.63,0,0,1-.3.07,1.72,1.72,0,0,1-.33,0,1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.37-1.08v-4.31l.73-.26v4.48a1.2,1.2,0,0,0,.1.55.58.58,0,0,0,.28.28,1.07,1.07,0,0,0,.41.07h.24Z"
        />
        <path
          className="cls-51"
          d="M258.06,381.27a2.09,2.09,0,0,1-.76.44,2.79,2.79,0,0,1-.95.16,2.54,2.54,0,0,1-1.21-.27,1.91,1.91,0,0,1-.78-.81,2.61,2.61,0,0,1-.28-1.26,2.68,2.68,0,0,1,.27-1.23,2,2,0,0,1,1.87-1.12,1.9,1.9,0,0,1,1,.26,1.69,1.69,0,0,1,.66.76,2.72,2.72,0,0,1,.23,1.19v.13h-3.42v-.47h3l-.24.33a1.8,1.8,0,0,0-.31-1.21,1.11,1.11,0,0,0-.95-.43,1.27,1.27,0,0,0-1,.47,2,2,0,0,0-.37,1.28,2,2,0,0,0,.39,1.33,1.45,1.45,0,0,0,1.15.45,2.17,2.17,0,0,0,.76-.13,2.48,2.48,0,0,0,.7-.4Z"
        />
        <path
          className="cls-51"
          d="M259.48,381.81h-.89l1.88-2.33.43-.53,1.31-1.67h.89l-1.76,2.2-.44.55Zm2.85,0L260.9,380l-.43-.55-1.77-2.2h.88L260.9,379l.44.53,1.86,2.33Z"
        />
        <path
          className="cls-51"
          d="M263.37,377.86v-.58h2.91v.58Zm2.89,3.3v.62a1.63,1.63,0,0,1-.3.07,1.72,1.72,0,0,1-.33,0,1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.38-1.08v-4.31l.73-.26v4.48a1.19,1.19,0,0,0,.11.55.55.55,0,0,0,.28.28,1,1,0,0,0,.4.07H266Z"
        />
        <path
          className="cls-51"
          d="M269.6,381.81V375.4h2.57a2.37,2.37,0,0,1,1.52.44,1.65,1.65,0,0,1,.25,2.18,1.68,1.68,0,0,1-.83.54v-.07a1.57,1.57,0,0,1,.94.53,1.59,1.59,0,0,1,.35,1,1.58,1.58,0,0,1-.56,1.3,2.46,2.46,0,0,1-1.58.45Zm.73-3.56h1.73a1.75,1.75,0,0,0,1.09-.29,1,1,0,0,0,.36-.85,1,1,0,0,0-.36-.82,1.8,1.8,0,0,0-1.09-.27h-1.73Zm0,2.95h1.87a1.78,1.78,0,0,0,1.11-.28,1,1,0,0,0,.36-.87,1.1,1.1,0,0,0-.36-.89,1.78,1.78,0,0,0-1.11-.29h-1.87Z"
        />
        <path
          className="cls-51"
          d="M279.35,381.27a2.09,2.09,0,0,1-.76.44,2.83,2.83,0,0,1-.95.16,2.54,2.54,0,0,1-1.21-.27,2,2,0,0,1-.79-.81,2.73,2.73,0,0,1-.27-1.26,2.68,2.68,0,0,1,.27-1.23,2.08,2.08,0,0,1,.75-.83,2,2,0,0,1,1.11-.29,1.94,1.94,0,0,1,1,.26,1.82,1.82,0,0,1,.66.76,2.87,2.87,0,0,1,.23,1.19v.13H276v-.47h3l-.23.33a1.86,1.86,0,0,0-.31-1.21,1.13,1.13,0,0,0-1-.43,1.25,1.25,0,0,0-1,.47,2.43,2.43,0,0,0,0,2.61,1.43,1.43,0,0,0,1.15.45,2.21,2.21,0,0,0,.76-.13,2.43,2.43,0,0,0,.69-.4Z"
        />
        <path
          className="cls-51"
          d="M282.06,381.87a2.62,2.62,0,0,1-1.8-.58l.24-.54a2.6,2.6,0,0,0,.74.41,2.57,2.57,0,0,0,.85.13,1.41,1.41,0,0,0,.78-.18.56.56,0,0,0,.27-.51.53.53,0,0,0-.18-.42,1.41,1.41,0,0,0-.6-.26l-.76-.18a1.64,1.64,0,0,1-.88-.45,1.06,1.06,0,0,1-.31-.77,1.18,1.18,0,0,1,.21-.7,1.45,1.45,0,0,1,.61-.47,2.13,2.13,0,0,1,.92-.17,2.74,2.74,0,0,1,.9.15,2,2,0,0,1,.71.44l-.25.53a2.29,2.29,0,0,0-.66-.4,1.85,1.85,0,0,0-.7-.13,1.28,1.28,0,0,0-.76.19.62.62,0,0,0-.26.51.57.57,0,0,0,.16.44,1.18,1.18,0,0,0,.54.25l.77.19a1.84,1.84,0,0,1,.94.45,1.16,1.16,0,0,1-.18,1.72A2.11,2.11,0,0,1,282.06,381.87Z"
        />
        <path
          className="cls-51"
          d="M286.9,381.87a2.2,2.2,0,0,1-1.15-.28,2,2,0,0,1-.76-.81,2.8,2.8,0,0,1-.26-1.24,2.65,2.65,0,0,1,.27-1.23,2,2,0,0,1,.76-.84,2.21,2.21,0,0,1,1.17-.29,2.68,2.68,0,0,1,.89.15,2,2,0,0,1,.71.44l-.25.54a3,3,0,0,0-.65-.39,1.65,1.65,0,0,0-.66-.13,1.36,1.36,0,0,0-1.09.46,1.91,1.91,0,0,0-.4,1.29,1.89,1.89,0,0,0,.4,1.28,1.37,1.37,0,0,0,1.09.45,1.72,1.72,0,0,0,.66-.13,3,3,0,0,0,.65-.39l.25.54a2.27,2.27,0,0,1-.73.43A2.74,2.74,0,0,1,286.9,381.87Z"
        />
        <path
          className="cls-51"
          d="M289.45,381.81v-6.62h.73v3l-.11.09a1.55,1.55,0,0,1,.62-.83,1.86,1.86,0,0,1,1-.28c1.09,0,1.63.59,1.63,1.79v2.84h-.73V379a1.39,1.39,0,0,0-.25-.92,1,1,0,0,0-.79-.29,1.34,1.34,0,0,0-1,.39,1.41,1.41,0,0,0-.38,1v2.59Z"
        />
        <path
          className="cls-51"
          d="M294.72,381.81v-3.26c0-.21,0-.42,0-.63a4.6,4.6,0,0,0-.05-.64h.69l.1,1.12-.1,0a1.39,1.39,0,0,1,.54-.89,1.59,1.59,0,0,1,.94-.3H297l.2,0,0,.67a1.42,1.42,0,0,0-.48-.08,1.23,1.23,0,0,0-.75.21,1.13,1.13,0,0,0-.41.53,1.67,1.67,0,0,0-.13.67v2.58Z"
        />
        <path
          className="cls-51"
          d="M297.9,375.37h.89v.82h-.89Zm.08,6.44v-4.53h.72v4.53Z"
        />
        <path
          className="cls-51"
          d="M299.48,377.86v-.58h2.72v.58Zm2.84-2a2.06,2.06,0,0,0-.46-.07,1,1,0,0,0-.4.08.55.55,0,0,0-.27.27,1.2,1.2,0,0,0-.1.55v5.13h-.73v-5.22a1.44,1.44,0,0,1,.36-1.08,1.34,1.34,0,0,1,1-.36l.31,0a1.59,1.59,0,0,1,.3.06Z"
        />
        <path
          className="cls-51"
          d="M302.31,377.86v-.58h2.91v.58Zm2.89,3.3v.62a1.63,1.63,0,0,1-.3.07,1.72,1.72,0,0,1-.33,0,1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.37-1.08v-4.31l.72-.26v4.48a1.19,1.19,0,0,0,.11.55.58.58,0,0,0,.28.28,1.07,1.07,0,0,0,.41.07H305Z"
        />
        <path
          className="cls-51"
          d="M307.7,381.87a1.58,1.58,0,0,1-1.22-.45,1.92,1.92,0,0,1-.4-1.33v-2.81h.72v2.79a1.32,1.32,0,0,0,.26.9.92.92,0,0,0,.76.29,1.3,1.3,0,0,0,1-.38,1.44,1.44,0,0,0,.37-1v-2.56h.73v4.53h-.71v-1l.11-.05a1.51,1.51,0,0,1-.61.82A1.78,1.78,0,0,1,307.7,381.87Z"
        />
        <path
          className="cls-51"
          d="M311.3,381.81v-3.26c0-.21,0-.42,0-.63s0-.43-.06-.64h.7l.08.94-.09.07a1.52,1.52,0,0,1,.63-.83,1.81,1.81,0,0,1,1-.28c1.09,0,1.63.59,1.63,1.79v2.84h-.73V379a1.39,1.39,0,0,0-.25-.92,1,1,0,0,0-.79-.29,1.34,1.34,0,0,0-1,.39,1.41,1.41,0,0,0-.37,1v2.59Z"
        />
        <path
          className="cls-51"
          d="M318.55,383.82a3.33,3.33,0,0,1-1.78-.47l.12-.59a4.43,4.43,0,0,0,.8.35,3.26,3.26,0,0,0,.86.11,1.3,1.3,0,0,0,1-.35,1.41,1.41,0,0,0,.34-1v-1.23l.1-.11a1.5,1.5,0,0,1-.34.62,1.43,1.43,0,0,1-.56.41,1.79,1.79,0,0,1-.75.15,1.92,1.92,0,0,1-1.77-1.08,2.52,2.52,0,0,1-.26-1.17,2.57,2.57,0,0,1,.26-1.18,1.89,1.89,0,0,1,1.77-1.07,1.75,1.75,0,0,1,1.06.31,1.48,1.48,0,0,1,.59.86l-.11-.09v-1h.73v4.49a1.82,1.82,0,0,1-2,2.05Zm-.09-2.76a1.28,1.28,0,0,0,1-.43,1.78,1.78,0,0,0,.37-1.2,1.82,1.82,0,0,0-.37-1.21,1.28,1.28,0,0,0-1-.43,1.34,1.34,0,0,0-1,.43,1.83,1.83,0,0,0-.38,1.21,1.78,1.78,0,0,0,.38,1.2A1.34,1.34,0,0,0,318.46,381.06Z"
        />
        <path
          className="cls-51"
          d="M323.53,381.87a2.63,2.63,0,0,1-1.81-.58l.24-.54a2.6,2.6,0,0,0,.74.41,2.57,2.57,0,0,0,.85.13,1.38,1.38,0,0,0,.78-.18.56.56,0,0,0,.27-.51.53.53,0,0,0-.18-.42,1.41,1.41,0,0,0-.6-.26l-.76-.18a1.64,1.64,0,0,1-.88-.45,1.06,1.06,0,0,1-.31-.77,1.12,1.12,0,0,1,.22-.7,1.36,1.36,0,0,1,.6-.47,2.16,2.16,0,0,1,.92-.17,2.66,2.66,0,0,1,.9.15,1.9,1.9,0,0,1,.71.44l-.24.53a2.48,2.48,0,0,0-.67-.4,1.85,1.85,0,0,0-.7-.13,1.22,1.22,0,0,0-.75.19.6.6,0,0,0-.27.51.57.57,0,0,0,.17.44,1.14,1.14,0,0,0,.53.25l.77.19a1.8,1.8,0,0,1,.94.45,1.16,1.16,0,0,1-.18,1.72A2.1,2.1,0,0,1,323.53,381.87Z"
        />
        <path
          className="cls-51"
          d="M325.79,377.86v-.58h2.9v.58Zm2.88,3.3v.62a1.63,1.63,0,0,1-.3.07,1.72,1.72,0,0,1-.33,0,1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.37-1.08v-4.31l.73-.26v4.48a1.2,1.2,0,0,0,.1.55.58.58,0,0,0,.28.28,1.07,1.07,0,0,0,.41.07h.24Z"
        />
        <path
          className="cls-51"
          d="M333.28,381.27a2.09,2.09,0,0,1-.76.44,2.79,2.79,0,0,1-.95.16,2.54,2.54,0,0,1-1.21-.27,1.91,1.91,0,0,1-.78-.81,2.72,2.72,0,0,1-.28-1.26,2.68,2.68,0,0,1,.27-1.23,2,2,0,0,1,1.87-1.12,1.9,1.9,0,0,1,1,.26,1.69,1.69,0,0,1,.66.76,2.72,2.72,0,0,1,.23,1.19v.13h-3.42v-.47h3l-.23.33a1.86,1.86,0,0,0-.32-1.21,1.1,1.1,0,0,0-.95-.43,1.24,1.24,0,0,0-1,.47,2.4,2.4,0,0,0,0,2.61,1.45,1.45,0,0,0,1.15.45,2.13,2.13,0,0,0,.76-.13,2.48,2.48,0,0,0,.7-.4Z"
        />
        <path
          className="cls-51"
          d="M334.7,381.81h-.89l1.88-2.33.43-.53,1.31-1.67h.89l-1.76,2.2-.44.55Zm2.85,0L336.12,380l-.43-.55-1.77-2.2h.88l1.32,1.67.44.53,1.86,2.33Z"
        />
        <path
          className="cls-51"
          d="M338.59,377.86v-.58h2.91v.58Zm2.89,3.3v.62a1.63,1.63,0,0,1-.3.07,1.72,1.72,0,0,1-.33,0,1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.38-1.08v-4.31l.73-.26v4.48a1.19,1.19,0,0,0,.11.55.58.58,0,0,0,.28.28,1.05,1.05,0,0,0,.4.07h.25Z"
        />
        <path
          className="cls-51"
          d="M119.16,392.81V386.4h2.57a2.37,2.37,0,0,1,1.52.44,1.65,1.65,0,0,1,.25,2.18,1.68,1.68,0,0,1-.83.54v-.07a1.6,1.6,0,0,1,.94.53,1.59,1.59,0,0,1,.34,1,1.57,1.57,0,0,1-.55,1.3,2.48,2.48,0,0,1-1.58.45Zm.73-3.56h1.72a1.76,1.76,0,0,0,1.1-.29,1,1,0,0,0,.36-.85,1,1,0,0,0-.36-.82,1.82,1.82,0,0,0-1.1-.27h-1.72Zm0,2.95h1.87a1.78,1.78,0,0,0,1.11-.28,1,1,0,0,0,.36-.87,1.1,1.1,0,0,0-.36-.89,1.78,1.78,0,0,0-1.11-.29h-1.87Z"
        />
        <path
          className="cls-51"
          d="M128.9,392.27a2,2,0,0,1-.76.44,2.75,2.75,0,0,1-.95.16,2.57,2.57,0,0,1-1.21-.27,2,2,0,0,1-.78-.81,2.73,2.73,0,0,1-.27-1.26,2.68,2.68,0,0,1,.27-1.23,2.08,2.08,0,0,1,.75-.83,2,2,0,0,1,1.11-.29,1.88,1.88,0,0,1,1,.26,1.78,1.78,0,0,1,.67.76,2.87,2.87,0,0,1,.23,1.19v.13h-3.42v-.47h3l-.23.33a1.86,1.86,0,0,0-.31-1.21,1.13,1.13,0,0,0-1-.43,1.25,1.25,0,0,0-1,.47,2.38,2.38,0,0,0,0,2.61,1.43,1.43,0,0,0,1.14.45,2.13,2.13,0,0,0,.76-.13,2.35,2.35,0,0,0,.7-.4Z"
        />
        <path
          className="cls-51"
          d="M131.62,392.87a2.66,2.66,0,0,1-1.81-.58l.25-.54a2.47,2.47,0,0,0,.74.41,2.53,2.53,0,0,0,.85.13,1.41,1.41,0,0,0,.78-.18.55.55,0,0,0,.26-.51.53.53,0,0,0-.18-.42,1.36,1.36,0,0,0-.59-.26l-.77-.18a1.61,1.61,0,0,1-.87-.45,1.06,1.06,0,0,1-.31-.77,1.18,1.18,0,0,1,.21-.7,1.45,1.45,0,0,1,.61-.47,2.11,2.11,0,0,1,.91-.17,2.66,2.66,0,0,1,.9.15,1.82,1.82,0,0,1,.71.44l-.24.53a2.29,2.29,0,0,0-.66-.4,1.87,1.87,0,0,0-.71-.13,1.26,1.26,0,0,0-.75.19.62.62,0,0,0-.26.51.57.57,0,0,0,.16.44,1.13,1.13,0,0,0,.54.25l.76.19a1.76,1.76,0,0,1,.94.45,1.06,1.06,0,0,1,.31.79,1.09,1.09,0,0,1-.48.93A2.11,2.11,0,0,1,131.62,392.87Z"
        />
        <path
          className="cls-51"
          d="M136.46,392.87a2.27,2.27,0,0,1-1.16-.28,2.09,2.09,0,0,1-.75-.81,2.8,2.8,0,0,1-.26-1.24,2.65,2.65,0,0,1,.27-1.23,2,2,0,0,1,.76-.84,2.21,2.21,0,0,1,1.17-.29,2.68,2.68,0,0,1,.89.15,1.9,1.9,0,0,1,.7.44l-.24.54a3,3,0,0,0-.65-.39,1.65,1.65,0,0,0-.66-.13,1.36,1.36,0,0,0-1.09.46,1.91,1.91,0,0,0-.4,1.29,1.84,1.84,0,0,0,.4,1.28,1.37,1.37,0,0,0,1.09.45,1.64,1.64,0,0,0,.65-.13,2.85,2.85,0,0,0,.66-.39l.24.54a2.12,2.12,0,0,1-.72.43A2.74,2.74,0,0,1,136.46,392.87Z"
        />
        <path
          className="cls-51"
          d="M139,392.81v-6.62h.73v3l-.12.09a1.61,1.61,0,0,1,.63-.83,1.86,1.86,0,0,1,1-.28c1.09,0,1.63.59,1.63,1.79v2.84h-.73V390a1.39,1.39,0,0,0-.25-.92,1,1,0,0,0-.79-.29,1.34,1.34,0,0,0-1,.39,1.41,1.41,0,0,0-.38,1v2.59Z"
        />
        <path
          className="cls-51"
          d="M144.28,392.81v-3.26c0-.21,0-.42,0-.63s0-.43-.06-.64h.7l.1,1.12-.1,0a1.39,1.39,0,0,1,.54-.89,1.57,1.57,0,0,1,.94-.3h.22l.2,0,0,.67a1.42,1.42,0,0,0-.48-.08,1.23,1.23,0,0,0-.75.21,1.13,1.13,0,0,0-.41.53,1.67,1.67,0,0,0-.13.67v2.58Z"
        />
        <path
          className="cls-51"
          d="M147.46,386.37h.89v.82h-.89Zm.07,6.44v-4.53h.73v4.53Z"
        />
        <path
          className="cls-51"
          d="M149,388.86v-.58h2.71v.58Zm2.84-2a2.06,2.06,0,0,0-.47-.07,1,1,0,0,0-.39.08.51.51,0,0,0-.27.27,1.2,1.2,0,0,0-.1.55v5.13h-.73v-5.22a1.44,1.44,0,0,1,.36-1.08,1.34,1.34,0,0,1,1-.36l.31,0a1.59,1.59,0,0,1,.3.06Z"
        />
        <path
          className="cls-51"
          d="M151.87,388.86v-.58h2.91v.58Zm2.89,3.3v.62a1.63,1.63,0,0,1-.3.07,1.72,1.72,0,0,1-.33,0,1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.38-1.08v-4.31l.73-.26v4.48a1.19,1.19,0,0,0,.11.55.58.58,0,0,0,.28.28,1.07,1.07,0,0,0,.41.07h.24Z"
        />
        <path
          className="cls-51"
          d="M157.26,392.87a1.58,1.58,0,0,1-1.22-.45,1.92,1.92,0,0,1-.41-1.33v-2.81h.73v2.79a1.38,1.38,0,0,0,.25.9,1,1,0,0,0,.77.29,1.3,1.3,0,0,0,1-.38,1.44,1.44,0,0,0,.37-1v-2.56h.73v4.53h-.71v-1l.11-.05a1.56,1.56,0,0,1-.61.82A1.8,1.8,0,0,1,157.26,392.87Z"
        />
        <path
          className="cls-51"
          d="M160.85,392.81v-3.26c0-.21,0-.42,0-.63s0-.43-.06-.64h.7l.08.94-.09.07a1.52,1.52,0,0,1,.63-.83,1.81,1.81,0,0,1,1-.28c1.09,0,1.63.59,1.63,1.79v2.84H164V390a1.39,1.39,0,0,0-.25-.92,1,1,0,0,0-.79-.29,1.34,1.34,0,0,0-1,.39,1.41,1.41,0,0,0-.38,1v2.59Z"
        />
        <path
          className="cls-51"
          d="M168.11,394.82a3.3,3.3,0,0,1-1.78-.47l.12-.59a4.15,4.15,0,0,0,.8.35,3.21,3.21,0,0,0,.86.11,1.3,1.3,0,0,0,1-.35,1.41,1.41,0,0,0,.34-1v-1.23l.1-.11a1.5,1.5,0,0,1-.34.62,1.43,1.43,0,0,1-.56.41,1.81,1.81,0,0,1-.76.15,1.92,1.92,0,0,1-1.05-.29,1.88,1.88,0,0,1-.71-.79,2.41,2.41,0,0,1-.26-1.17,2.45,2.45,0,0,1,.26-1.18,1.88,1.88,0,0,1,.71-.79,1.92,1.92,0,0,1,1.05-.28,1.78,1.78,0,0,1,1.07.31,1.48,1.48,0,0,1,.59.86l-.11-.09v-1h.73v4.49a1.82,1.82,0,0,1-2,2.05Zm-.09-2.76a1.28,1.28,0,0,0,1-.43,1.78,1.78,0,0,0,.37-1.2,1.82,1.82,0,0,0-.37-1.21,1.28,1.28,0,0,0-1-.43,1.31,1.31,0,0,0-1.05.43,1.77,1.77,0,0,0-.38,1.21,1.73,1.73,0,0,0,.38,1.2A1.31,1.31,0,0,0,168,392.06Z"
        />
        <path
          className="cls-51"
          d="M173.09,392.87a2.63,2.63,0,0,1-1.81-.58l.24-.54a2.6,2.6,0,0,0,.74.41,2.57,2.57,0,0,0,.85.13,1.41,1.41,0,0,0,.78-.18.56.56,0,0,0,.27-.51.53.53,0,0,0-.18-.42,1.41,1.41,0,0,0-.6-.26l-.76-.18a1.64,1.64,0,0,1-.88-.45,1.06,1.06,0,0,1-.31-.77,1.12,1.12,0,0,1,.22-.7,1.36,1.36,0,0,1,.6-.47,2.16,2.16,0,0,1,.92-.17,2.74,2.74,0,0,1,.9.15,1.9,1.9,0,0,1,.71.44l-.25.53a2.29,2.29,0,0,0-.66-.4,1.85,1.85,0,0,0-.7-.13,1.28,1.28,0,0,0-.76.19.62.62,0,0,0-.26.51.54.54,0,0,0,.17.44,1.14,1.14,0,0,0,.53.25l.77.19a1.8,1.8,0,0,1,.94.45,1.16,1.16,0,0,1-.18,1.72A2.1,2.1,0,0,1,173.09,392.87Z"
        />
        <path
          className="cls-51"
          d="M175.34,388.86v-.58h2.91v.58Zm2.89,3.3v.62a1.63,1.63,0,0,1-.3.07,1.72,1.72,0,0,1-.33,0,1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.37-1.08v-4.31l.72-.26v4.48a1.19,1.19,0,0,0,.11.55.58.58,0,0,0,.28.28,1.07,1.07,0,0,0,.41.07H178Z"
        />
        <path
          className="cls-51"
          d="M182.84,392.27a2.09,2.09,0,0,1-.76.44,2.83,2.83,0,0,1-1,.16,2.54,2.54,0,0,1-1.21-.27,1.91,1.91,0,0,1-.78-.81,2.61,2.61,0,0,1-.28-1.26,2.68,2.68,0,0,1,.27-1.23,2.08,2.08,0,0,1,.75-.83,2.1,2.1,0,0,1,1.12-.29,1.9,1.9,0,0,1,1,.26,1.69,1.69,0,0,1,.66.76,2.72,2.72,0,0,1,.23,1.19v.13H179.5v-.47h3l-.24.33a1.8,1.8,0,0,0-.31-1.21,1.13,1.13,0,0,0-1-.43,1.26,1.26,0,0,0-1,.47,2,2,0,0,0-.37,1.28,2,2,0,0,0,.39,1.33,1.45,1.45,0,0,0,1.15.45,2.17,2.17,0,0,0,.76-.13,2.48,2.48,0,0,0,.7-.4Z"
        />
        <path
          className="cls-51"
          d="M184.26,392.81h-.89l1.88-2.33.43-.53,1.31-1.67h.89l-1.76,2.2-.44.55Zm2.85,0L185.68,391l-.43-.55-1.77-2.2h.88l1.32,1.67.44.53,1.86,2.33Z"
        />
        <path
          className="cls-51"
          d="M188.15,388.86v-.58h2.91v.58Zm2.89,3.3v.62a1.63,1.63,0,0,1-.3.07,1.72,1.72,0,0,1-.33,0,1.36,1.36,0,0,1-1-.36,1.43,1.43,0,0,1-.38-1.08v-4.31l.73-.26v4.48a1.35,1.35,0,0,0,.1.55.6.6,0,0,0,.29.28,1,1,0,0,0,.4.07h.25Z"
        />
        <path
          className="cls-51"
          d="M194.38,392.81V386.4H197a2.37,2.37,0,0,1,1.52.44,1.65,1.65,0,0,1,.25,2.18,1.68,1.68,0,0,1-.83.54v-.07a1.57,1.57,0,0,1,.94.53,1.59,1.59,0,0,1,.35,1,1.58,1.58,0,0,1-.56,1.3,2.46,2.46,0,0,1-1.58.45Zm.73-3.56h1.73a1.75,1.75,0,0,0,1.09-.29,1,1,0,0,0,.36-.85,1,1,0,0,0-.36-.82,1.8,1.8,0,0,0-1.09-.27h-1.73Zm0,2.95H197a1.78,1.78,0,0,0,1.11-.28,1,1,0,0,0,.36-.87,1.1,1.1,0,0,0-.36-.89,1.78,1.78,0,0,0-1.11-.29h-1.87Z"
        />
        <path
          className="cls-51"
          d="M204.13,392.27a2.13,2.13,0,0,1-.77.44,2.73,2.73,0,0,1-.94.16,2.58,2.58,0,0,1-1.22-.27,2,2,0,0,1-.78-.81,2.73,2.73,0,0,1-.27-1.26,2.68,2.68,0,0,1,.27-1.23,2.08,2.08,0,0,1,.75-.83,2,2,0,0,1,1.11-.29,1.94,1.94,0,0,1,1,.26,1.82,1.82,0,0,1,.66.76,2.87,2.87,0,0,1,.23,1.19v.13h-3.42v-.47h3l-.23.33a1.86,1.86,0,0,0-.31-1.21,1.13,1.13,0,0,0-1-.43,1.25,1.25,0,0,0-1,.47,2.43,2.43,0,0,0,0,2.61,1.43,1.43,0,0,0,1.14.45,2.22,2.22,0,0,0,.77-.13,2.43,2.43,0,0,0,.69-.4Z"
        />
        <path
          className="cls-51"
          d="M206.84,392.87a2.66,2.66,0,0,1-1.81-.58l.25-.54a2.47,2.47,0,0,0,.74.41,2.57,2.57,0,0,0,.85.13,1.41,1.41,0,0,0,.78-.18.55.55,0,0,0,.26-.51.53.53,0,0,0-.18-.42,1.36,1.36,0,0,0-.59-.26l-.76-.18a1.61,1.61,0,0,1-.88-.45,1.06,1.06,0,0,1-.31-.77,1.18,1.18,0,0,1,.21-.7,1.45,1.45,0,0,1,.61-.47,2.11,2.11,0,0,1,.91-.17,2.66,2.66,0,0,1,.9.15,1.94,1.94,0,0,1,.72.44l-.25.53a2.29,2.29,0,0,0-.66-.4,1.87,1.87,0,0,0-.71-.13,1.26,1.26,0,0,0-.75.19.62.62,0,0,0-.26.51.57.57,0,0,0,.16.44,1.13,1.13,0,0,0,.54.25l.76.19a1.84,1.84,0,0,1,.95.45,1.16,1.16,0,0,1-.18,1.72A2.11,2.11,0,0,1,206.84,392.87Z"
        />
        <path
          className="cls-51"
          d="M211.68,392.87a2.27,2.27,0,0,1-1.16-.28,2.09,2.09,0,0,1-.75-.81,2.8,2.8,0,0,1-.26-1.24,2.65,2.65,0,0,1,.27-1.23,2,2,0,0,1,.76-.84,2.21,2.21,0,0,1,1.17-.29,2.68,2.68,0,0,1,.89.15,2,2,0,0,1,.71.44l-.25.54a3,3,0,0,0-.65-.39,1.65,1.65,0,0,0-.66-.13,1.36,1.36,0,0,0-1.09.46,1.91,1.91,0,0,0-.4,1.29,1.89,1.89,0,0,0,.4,1.28,1.37,1.37,0,0,0,1.09.45,1.72,1.72,0,0,0,.66-.13,3,3,0,0,0,.65-.39l.25.54a2.27,2.27,0,0,1-.73.43A2.74,2.74,0,0,1,211.68,392.87Z"
        />
        <path
          className="cls-51"
          d="M214.23,392.81v-6.62H215v3l-.12.09a1.61,1.61,0,0,1,.63-.83,1.86,1.86,0,0,1,1-.28c1.09,0,1.63.59,1.63,1.79v2.84h-.73V390a1.39,1.39,0,0,0-.25-.92,1,1,0,0,0-.79-.29,1.34,1.34,0,0,0-1,.39,1.41,1.41,0,0,0-.38,1v2.59Z"
        />
        <path
          className="cls-51"
          d="M219.5,392.81v-3.26c0-.21,0-.42,0-.63a4.62,4.62,0,0,0-.06-.64h.7l.1,1.12-.1,0a1.39,1.39,0,0,1,.54-.89,1.57,1.57,0,0,1,.94-.3h.22l.2,0,0,.67a1.42,1.42,0,0,0-.48-.08,1.23,1.23,0,0,0-.75.21,1.13,1.13,0,0,0-.41.53,1.67,1.67,0,0,0-.13.67v2.58Z"
        />
        <path
          className="cls-51"
          d="M222.68,386.37h.89v.82h-.89Zm.08,6.44v-4.53h.72v4.53Z"
        />
        <path
          className="cls-51"
          d="M224.26,388.86v-.58H227v.58Zm2.84-2a2.06,2.06,0,0,0-.47-.07,1,1,0,0,0-.39.08.55.55,0,0,0-.27.27,1.2,1.2,0,0,0-.1.55v5.13h-.73v-5.22a1.44,1.44,0,0,1,.36-1.08,1.34,1.34,0,0,1,1-.36l.31,0a1.59,1.59,0,0,1,.3.06Z"
        />
        <path
          className="cls-51"
          d="M227.09,388.86v-.58H230v.58Zm2.89,3.3v.62a1.63,1.63,0,0,1-.3.07,1.72,1.72,0,0,1-.33,0,1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.38-1.08v-4.31l.73-.26v4.48a1.19,1.19,0,0,0,.11.55.58.58,0,0,0,.28.28,1.07,1.07,0,0,0,.41.07h.24Z"
        />
        <path
          className="cls-51"
          d="M232.48,392.87a1.58,1.58,0,0,1-1.22-.45,1.92,1.92,0,0,1-.41-1.33v-2.81h.73v2.79a1.32,1.32,0,0,0,.26.9.92.92,0,0,0,.76.29,1.3,1.3,0,0,0,1-.38,1.44,1.44,0,0,0,.37-1v-2.56h.73v4.53H234v-1l.11-.05a1.51,1.51,0,0,1-.61.82A1.78,1.78,0,0,1,232.48,392.87Z"
        />
        <path
          className="cls-51"
          d="M236.07,392.81v-3.26c0-.21,0-.42,0-.63s0-.43-.06-.64h.7l.08.94-.09.07a1.52,1.52,0,0,1,.63-.83,1.81,1.81,0,0,1,1-.28c1.09,0,1.63.59,1.63,1.79v2.84h-.73V390a1.39,1.39,0,0,0-.25-.92,1,1,0,0,0-.79-.29,1.34,1.34,0,0,0-1,.39,1.41,1.41,0,0,0-.38,1v2.59Z"
        />
        <path
          className="cls-51"
          d="M243.33,394.82a3.3,3.3,0,0,1-1.78-.47l.12-.59a4.15,4.15,0,0,0,.8.35,3.26,3.26,0,0,0,.86.11,1.3,1.3,0,0,0,1-.35,1.41,1.41,0,0,0,.34-1v-1.23l.1-.11a1.5,1.5,0,0,1-.34.62,1.43,1.43,0,0,1-.56.41,1.81,1.81,0,0,1-.76.15,1.92,1.92,0,0,1-1.05-.29,1.88,1.88,0,0,1-.71-.79,2.52,2.52,0,0,1-.26-1.17,2.57,2.57,0,0,1,.26-1.18,1.88,1.88,0,0,1,.71-.79,1.92,1.92,0,0,1,1.05-.28,1.78,1.78,0,0,1,1.07.31,1.48,1.48,0,0,1,.59.86l-.11-.09v-1h.73v4.49a1.82,1.82,0,0,1-2,2.05Zm-.09-2.76a1.28,1.28,0,0,0,1-.43,1.78,1.78,0,0,0,.37-1.2,1.82,1.82,0,0,0-.37-1.21,1.28,1.28,0,0,0-1-.43,1.32,1.32,0,0,0-1.05.43,1.83,1.83,0,0,0-.38,1.21,1.78,1.78,0,0,0,.38,1.2A1.32,1.32,0,0,0,243.24,392.06Z"
        />
        <path
          className="cls-51"
          d="M248.31,392.87a2.63,2.63,0,0,1-1.81-.58l.24-.54a2.6,2.6,0,0,0,.74.41,2.57,2.57,0,0,0,.85.13,1.41,1.41,0,0,0,.78-.18.56.56,0,0,0,.27-.51.53.53,0,0,0-.18-.42,1.41,1.41,0,0,0-.6-.26l-.76-.18a1.64,1.64,0,0,1-.88-.45,1.06,1.06,0,0,1-.31-.77,1.12,1.12,0,0,1,.22-.7,1.36,1.36,0,0,1,.6-.47,2.16,2.16,0,0,1,.92-.17,2.74,2.74,0,0,1,.9.15,1.9,1.9,0,0,1,.71.44l-.25.53a2.29,2.29,0,0,0-.66-.4,1.85,1.85,0,0,0-.7-.13,1.22,1.22,0,0,0-.75.19.6.6,0,0,0-.27.51.57.57,0,0,0,.17.44,1.14,1.14,0,0,0,.53.25l.77.19a1.8,1.8,0,0,1,.94.45,1.16,1.16,0,0,1-.18,1.72A2.1,2.1,0,0,1,248.31,392.87Z"
        />
        <path
          className="cls-51"
          d="M250.56,388.86v-.58h2.91v.58Zm2.89,3.3v.62a1.63,1.63,0,0,1-.3.07,1.72,1.72,0,0,1-.33,0,1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.37-1.08v-4.31l.73-.26v4.48a1.2,1.2,0,0,0,.1.55.58.58,0,0,0,.28.28,1.07,1.07,0,0,0,.41.07h.24Z"
        />
        <path
          className="cls-51"
          d="M258.06,392.27a2.09,2.09,0,0,1-.76.44,2.79,2.79,0,0,1-.95.16,2.54,2.54,0,0,1-1.21-.27,1.91,1.91,0,0,1-.78-.81,2.61,2.61,0,0,1-.28-1.26,2.68,2.68,0,0,1,.27-1.23,2,2,0,0,1,1.87-1.12,1.9,1.9,0,0,1,1,.26,1.69,1.69,0,0,1,.66.76,2.72,2.72,0,0,1,.23,1.19v.13h-3.42v-.47h3l-.24.33a1.8,1.8,0,0,0-.31-1.21,1.11,1.11,0,0,0-.95-.43,1.27,1.27,0,0,0-1,.47,2,2,0,0,0-.37,1.28,2,2,0,0,0,.39,1.33,1.45,1.45,0,0,0,1.15.45,2.17,2.17,0,0,0,.76-.13,2.48,2.48,0,0,0,.7-.4Z"
        />
        <path
          className="cls-51"
          d="M259.48,392.81h-.89l1.88-2.33.43-.53,1.31-1.67h.89l-1.76,2.2-.44.55Zm2.85,0L260.9,391l-.43-.55-1.77-2.2h.88L260.9,390l.44.53,1.86,2.33Z"
        />
        <path
          className="cls-51"
          d="M263.37,388.86v-.58h2.91v.58Zm2.89,3.3v.62a1.63,1.63,0,0,1-.3.07,1.72,1.72,0,0,1-.33,0,1.38,1.38,0,0,1-1-.36,1.43,1.43,0,0,1-.38-1.08v-4.31l.73-.26v4.48a1.19,1.19,0,0,0,.11.55.55.55,0,0,0,.28.28,1,1,0,0,0,.4.07H266Z"
        />
      </g>
      <g className="cls-74">
        <polygon
          className="cls-10"
          points="151.34 128.01 146.15 134.76 143.57 131.4 139.46 136.74 137.71 134.47 130.53 143.83 134.02 143.83 139.19 143.83 144.9 143.83 153.12 143.83 163.49 143.83 151.34 128.01"
        />
      </g>
      <g className="cls-75">
        <polygon
          className="cls-10"
          points="195.56 143.83 200.74 137.08 203.33 140.44 207.44 135.09 209.18 137.36 216.37 128.01 212.88 128.01 207.71 128.01 202 128.01 193.78 128.01 183.4 128.01 195.56 143.83"
        />
      </g>
      <g className="cls-76">
        <polygon
          className="cls-10"
          points="247.34 128.01 242.15 134.76 239.57 131.4 235.46 136.74 233.71 134.47 226.53 143.83 230.02 143.83 235.19 143.83 240.9 143.83 249.12 143.83 259.49 143.83 247.34 128.01"
        />
      </g>
      <g className="cls-77">
        <polygon
          className="cls-10"
          points="291.56 143.83 296.74 137.08 299.33 140.44 303.44 135.09 305.18 137.36 312.37 128.01 308.88 128.01 303.71 128.01 298 128.01 289.78 128.01 279.4 128.01 291.56 143.83"
        />
      </g>
      <g className="cls-78">
        <polygon
          className="cls-10"
          points="344.96 128.01 339.77 134.76 337.19 131.4 333.08 136.74 331.33 134.47 324.15 143.83 327.64 143.83 332.8 143.83 338.52 143.83 346.74 143.83 357.11 143.83 344.96 128.01"
        />
      </g>
      <g className="cls-79">
        <path
          className="cls-80"
          d="M164.62,53.44H246.8c5.06,0,8.1,0,10.12.7a11.62,11.62,0,0,1,0,21.85c-2,.71-5.06.71-10.12.71H164.62c-5.06,0-8.1,0-10.12-.71a11.61,11.61,0,0,1-6.95-6.94,11.66,11.66,0,0,1,0-8,11.63,11.63,0,0,1,6.95-7C156.52,53.44,159.56,53.44,164.62,53.44Z"
        />
      </g>
      <g className="cls-81">
        <path
          className="cls-32"
          d="M109.72,176.73a2.84,2.84,0,1,1-4,0A2.83,2.83,0,0,1,109.72,176.73Z"
        />
      </g>
      <g className="cls-82">
        <line
          className="cls-83"
          x1="383.39"
          y1="142.83"
          x2="505.41"
          y2="142.83"
        />
      </g>
      <g className="cls-84">
        <rect
          className="cls-5"
          x="383.39"
          y="161.43"
          width="122.02"
          height="21.14"
        />
      </g>
      <g className="cls-85">
        <line
          className="cls-83"
          x1="383.39"
          y1="162.43"
          x2="505.41"
          y2="162.43"
        />
      </g>
      <g className="cls-86">
        <line
          className="cls-83"
          x1="383.39"
          y1="182.57"
          x2="505.41"
          y2="182.57"
        />
      </g>
      <g
        className="cls-87"
        style={{ fill: 'rgb(var(--lotta-highlight-color))' }}
      >
        <rect
          className="cls-5"
          x="383.39"
          y="200.93"
          width="122.02"
          height="21.14"
        />
      </g>
      <g className="cls-88">
        <line
          className="cls-83"
          x1="383.39"
          y1="202.07"
          x2="505.41"
          y2="202.07"
        />
      </g>
      <g className="cls-89">
        <line
          className="cls-83"
          x1="383.39"
          y1="223.07"
          x2="505.41"
          y2="223.07"
        />
      </g>
      <g className="cls-90">
        <line
          className="cls-83"
          x1="383.39"
          y1="243.31"
          x2="505.41"
          y2="243.31"
        />
      </g>
      <g className="cls-91">
        <circle className="cls-92" cx="503.41" cy="108.66" r="5.67" />
      </g>
    </svg>
  )
);
PagePreview.displayName = 'PagePreview';
