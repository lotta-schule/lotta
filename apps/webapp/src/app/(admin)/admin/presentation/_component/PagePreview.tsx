import * as React from 'react';
import { Theme } from '@lotta-schule/theme';

export type PagePreviewProps = {
  theme: Theme;
} & React.SVGProps<SVGSVGElement>;

export const PagePreview = React.memo(
  ({ className, theme, ...props }: PagePreviewProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 527.46 419.08"
      className={className}
      data-testid="page-preview"
      {...props}
    >
      <defs>
        <style>
          {
            '.cls-1{fill:none}.cls-5{fill:#d5d5d5}.cls-10{fill:#fff}.cls-39{fill:#c6c3f9}'
          }
        </style>
        <clipPath id="clip-path" transform="translate(-1 -1)">
          <path className="cls-1" d="M1 0.5H528.46V419.58H1z" />
        </clipPath>
        <clipPath id="clip-path-2" transform="translate(-1 -1)">
          <path className="cls-1" d="M0.5 16.14H528.96V33.78H0.5z" />
        </clipPath>
        <clipPath id="clip-path-3" transform="translate(-1 -1)">
          <path className="cls-1" d="M0.5 0.5H528.96V33.79H0.5z" />
        </clipPath>
        <clipPath id="clip-path-4" transform="translate(-1 -1)">
          <path className="cls-1" d="M0 0H529.46V421.08H0z" />
        </clipPath>
        <clipPath id="clip-path-5" transform="translate(-1 -1)">
          <path
            className="cls-1"
            d="M132.27 9.03H397.19000000000005V25.259999999999998H132.27z"
          />
        </clipPath>
        <clipPath id="clip-path-6" transform="translate(-1 -1)">
          <path className="cls-1" d="M13.73 10.5H26.94V23.78H13.73z" />
        </clipPath>
        <clipPath id="clip-path-7" transform="translate(-1 -1)">
          <path className="cls-1" d="M27.93 10.22H41.5V23.79H27.93z" />
        </clipPath>
        <clipPath id="clip-path-8" transform="translate(-1 -1)">
          <path
            className="cls-1"
            d="M43.51 10.5H57.14V24.130000000000003H43.51z"
          />
        </clipPath>
        <clipPath id="clip-path-9" transform="translate(-1 -1)">
          <path className="cls-1" d="M9.33 244.64H365.56V321.81H9.33z" />
        </clipPath>
        <clipPath id="clip-path-10" transform="translate(-1 -1)">
          <path className="cls-1" d="M9.33 332.64H365.56V409.81H9.33z" />
        </clipPath>
        <clipPath id="clip-path-11" transform="translate(-1 -1)">
          <path className="cls-1" d="M9.33 157.47H365.56V234.64H9.33z" />
        </clipPath>
        <clipPath id="clip-path-12" transform="translate(-1 -1)">
          <path className="cls-1" d="M9.33 94.42H365.56V151.3H9.33z" />
        </clipPath>
        <clipPath id="clip-path-13" transform="translate(-1 -1)">
          <path
            className="cls-1"
            d="M19.33 167.47H100.17999999999999V224.64H19.33z"
          />
        </clipPath>
        <clipPath id="clip-path-14" transform="translate(-1 -1)">
          <path
            className="cls-1"
            d="M19.33 254.64H100.17999999999999V311.81H19.33z"
          />
        </clipPath>
        <clipPath id="clip-path-15" transform="translate(-1 -1)">
          <path
            className="cls-1"
            d="M19.33 342.64H100.17999999999999V399.81H19.33z"
          />
        </clipPath>
        <clipPath id="clip-path-16" transform="translate(-1 -1)">
          <path className="cls-1" d="M25.79 179.23H93.72V212.87H25.79z" />
        </clipPath>
        <clipPath id="clip-path-17" transform="translate(-1 -1)">
          <path
            className="cls-1"
            d="M33.71 259.86H78.56V306.58000000000004H33.71z"
          />
        </clipPath>
        <clipPath id="clip-path-18" transform="translate(-1 -1)">
          <path
            className="cls-1"
            d="M33.71 348.96H81.64V393.47999999999996H33.71z"
          />
        </clipPath>
        <clipPath id="clip-path-19" transform="translate(-1 -1)">
          <path className="cls-1" d="M373.73 94.42H517.61V409.8H373.73z" />
        </clipPath>
        <clipPath id="clip-path-20" transform="translate(-1 -1)">
          <path
            className="cls-1"
            d="M386.05 105.97H419.84000000000003V123.87H386.05z"
          />
        </clipPath>
        <clipPath id="clip-path-21" transform="translate(-1 -1)">
          <path className="cls-1" d="M428.83 105.97H462.62V123.87H428.83z" />
        </clipPath>
        <clipPath id="clip-path-22" transform="translate(-1 -1)">
          <path className="cls-1" d="M471.5 105.97H505.29V123.87H471.5z" />
        </clipPath>
        <clipPath id="clip-path-23" transform="translate(-1 -1)">
          <path className="cls-1" d="M110.33 167.47H224.99V185.8H110.33z" />
        </clipPath>
        <clipPath id="clip-path-24" transform="translate(-1 -1)">
          <path className="cls-1" d="M110.33 206.31H355.96V213H110.33z" />
        </clipPath>
        <clipPath id="clip-path-25" transform="translate(-1 -1)">
          <path className="cls-1" d="M110.33 217.95H307.32V224.64H110.33z" />
        </clipPath>
        <clipPath id="clip-path-26" transform="translate(-1 -1)">
          <path
            className="cls-1"
            d="M334.05 167.47H355.96000000000004V189.38H334.05z"
          />
        </clipPath>
        <clipPath id="clip-path-27" transform="translate(-1 -1)">
          <path
            className="cls-1"
            d="M334.05 254.64H355.96000000000004V276.55H334.05z"
          />
        </clipPath>
        <clipPath id="clip-path-28" transform="translate(-1 -1)">
          <path
            className="cls-1"
            d="M334.05 342.64H355.96000000000004V364.55H334.05z"
          />
        </clipPath>
        <clipPath id="clip-path-29" transform="translate(-1 -1)">
          <path
            className="cls-1"
            d="M110.33 254.64H224.99V272.96999999999997H110.33z"
          />
        </clipPath>
        <clipPath id="clip-path-30" transform="translate(-1 -1)">
          <path className="cls-1" d="M110.33 293.48H355.96V300.17H110.33z" />
        </clipPath>
        <clipPath id="clip-path-31" transform="translate(-1 -1)">
          <path className="cls-1" d="M110.33 305.12H307.32V311.81H110.33z" />
        </clipPath>
        <clipPath id="clip-path-32" transform="translate(-1 -1)">
          <path
            className="cls-1"
            d="M110.33 342.64H224.99V360.96999999999997H110.33z"
          />
        </clipPath>
        <clipPath id="clip-path-33" transform="translate(-1 -1)">
          <path className="cls-1" d="M110.33 381.48H355.96V388.17H110.33z" />
        </clipPath>
        <clipPath id="clip-path-34" transform="translate(-1 -1)">
          <path className="cls-1" d="M110.33 393.12H307.32V399.81H110.33z" />
        </clipPath>
        <clipPath id="clip-path-35" transform="translate(-1 -1)">
          <path className="cls-1" d="M9.33 47.25H518.13V83.12H9.33z" />
        </clipPath>
      </defs>
      <g clipPath="url(#clip-path)">
        <path
          d="M22.53 1.5h484.41c6 0 9.63 0 12 1a12.5 12.5 0 017.52 7.5c1 2.41 1 6 1 12.05v376c0 6 0 9.64-1 12.05a12.5 12.5 0 01-7.48 7.47c-2.41 1-6 1-12 1H22.53c-6 0-9.64 0-12-1A12.49 12.49 0 013 410.1c-1-2.41-1-6-1-12.05V22c0-6 0-9.64 1-12a12.49 12.49 0 017.47-7.47C12.89 1.5 16.5 1.5 22.53 1.5z"
          transform="translate(-1 -1)"
          fill="#dce8f8"
        />
      </g>
      <g clipPath="url(#clip-path-2)">
        <path className="cls-5" d="M0.5 16.14H526.96V31.78H0.5z" />
      </g>
      <g clipPath="url(#clip-path-3)">
        <path
          className="cls-5"
          d="M22 1.5h485.44c5.9 0 9.44 0 11.8.87a13.14 13.14 0 017.85 7.85c.64 1.45.87 4.77.87 6.92s-.23 5.48-.87 6.92a13.15 13.15 0 01-7.85 7.86c-2.36.87-5.9.87-11.8.87H22c-5.9 0-9.44 0-11.81-.87a13.15 13.15 0 01-7.85-7.86c-.64-1.44-.87-4.76-.87-6.92s.23-5.47.87-6.92a13.14 13.14 0 017.85-7.85c2.4-.87 5.94-.87 11.81-.87z"
          transform="translate(-1 -1)"
        />
      </g>
      <g clipPath="url(#clip-path-4)">
        <path
          d="M21.53 1h484.41c6 0 9.63 0 12 1a12.5 12.5 0 017.48 7.47c1 2.41 1 6 1 12.05v376c0 6 0 9.64-1 12.05a12.5 12.5 0 01-7.48 7.47c-2.41 1-6 1-12 1H21.53c-6 0-9.64 0-12-1A12.49 12.49 0 012 409.6c-1-2.41-1-6-1-12.05v-376c0-6 0-9.64 1-12A12.49 12.49 0 019.48 2c2.41-1 6.02-1 12.05-1z"
          stroke="#929292"
          strokeWidth="2px"
          fill="none"
        />
      </g>
      <g clipPath="url(#clip-path-5)">
        <path
          className="cls-10"
          d="M144.15 10h241.16c3.1 0 5 0 6.2.43a7.12 7.12 0 014.25 4.25 7.11 7.11 0 010 4.87 7.12 7.12 0 01-4.25 4.25c-1.24.43-3.1.43-6.2.43H144.15c-3.09 0-5 0-6.19-.43a7.11 7.11 0 01-4.26-4.25 7.11 7.11 0 010-4.87 7.11 7.11 0 014.3-4.22c1.2-.46 3.06-.46 6.15-.46z"
          transform="translate(-1 -1)"
        />
      </g>
      <g clipPath="url(#clip-path-6)">
        <path
          d="M24.3 13.16a5.67 5.67 0 010 8 5.59 5.59 0 01-7.93 0 5.66 5.66 0 010-8 5.57 5.57 0 017.93 0z"
          transform="translate(-1 -1)"
          fill="#ed220d"
        />
      </g>
      <g clipPath="url(#clip-path-7)">
        <circle cx={33.71} cy={16} r={5.78} fill="#ffd932" />
      </g>
      <g clipPath="url(#clip-path-8)">
        <circle cx={49.32} cy={16.32} r={5.81} fill="#60d937" />
      </g>
      <g clipPath="url(#clip-path-9)">
        <path
          className="cls-10"
          d="M26 245.64h322.88c4.6 0 7.36 0 9.2.77a9.53 9.53 0 015.72 5.71c.77 1.84.77 4.6.77 9.21v43.79c0 4.6 0 7.36-.77 9.21a9.58 9.58 0 01-5.72 5.71c-1.84.77-4.6.77-9.2.77H26c-4.6 0-7.36 0-9.21-.77a9.59 9.59 0 01-5.71-5.71c-.77-1.85-.77-4.61-.77-9.21v-43.79c0-4.61 0-7.37.77-9.21a9.54 9.54 0 015.71-5.71c1.87-.77 4.63-.77 9.21-.77z"
          transform="translate(-1 -1)"
        />
      </g>
      <g clipPath="url(#clip-path-10)">
        <path
          className="cls-10"
          d="M26 333.64h322.88c4.6 0 7.36 0 9.2.77a9.53 9.53 0 015.72 5.71c.77 1.84.77 4.6.77 9.21v43.79c0 4.6 0 7.36-.77 9.21a9.58 9.58 0 01-5.72 5.71c-1.84.77-4.6.77-9.2.77H26c-4.6 0-7.36 0-9.21-.77a9.59 9.59 0 01-5.71-5.71c-.77-1.85-.77-4.61-.77-9.21v-43.79c0-4.61 0-7.37.77-9.21a9.54 9.54 0 015.71-5.71c1.87-.77 4.63-.77 9.21-.77z"
          transform="translate(-1 -1)"
        />
      </g>
      <g clipPath="url(#clip-path-11)">
        <path
          className="cls-10"
          d="M26 158.47h322.88c4.6 0 7.36 0 9.2.77a9.58 9.58 0 015.72 5.76c.77 1.84.77 4.61.77 9.21V218c0 4.61 0 7.37-.77 9.21a9.56 9.56 0 01-5.72 5.71c-1.84.77-4.6.77-9.2.77H26c-4.6 0-7.36 0-9.21-.77a9.57 9.57 0 01-5.71-5.71c-.77-1.84-.77-4.6-.77-9.21v-43.84c0-4.6 0-7.37.77-9.21a9.59 9.59 0 015.71-5.71c1.87-.77 4.63-.77 9.21-.77z"
          transform="translate(-1 -1)"
        />
      </g>
      <g clipPath="url(#clip-path-12)">
        <path
          d="M26 95.42h322.88c4.6 0 7.36 0 9.2.77a9.58 9.58 0 015.72 5.71c.77 1.84.77 4.61.77 9.21v23.51c0 4.6 0 7.36-.77 9.21a9.58 9.58 0 01-5.72 5.71c-1.84.77-4.6.77-9.2.77H26c-4.6 0-7.36 0-9.21-.77a9.59 9.59 0 01-5.71-5.71c-.77-1.85-.77-4.61-.77-9.21v-23.51c0-4.6 0-7.37.77-9.21a9.59 9.59 0 015.71-5.71c1.87-.77 4.63-.77 9.21-.77z"
          transform="translate(-1 -1)"
          fill="#fff1e8"
        />
      </g>
      <g clipPath="url(#clip-path-13)">
        <path
          className="cls-5"
          d="M27.53 168.47H92a12.7 12.7 0 014.23.35 4.46 4.46 0 012.62 2.62 12.7 12.7 0 01.35 4.23v40.78a12.67 12.67 0 01-.35 4.22 4.43 4.43 0 01-2.62 2.62 12.7 12.7 0 01-4.23.35H27.53a12.63 12.63 0 01-4.22-.35 4.38 4.38 0 01-2.62-2.62 12.33 12.33 0 01-.36-4.22v-40.78a12.36 12.36 0 01.36-4.23 4.41 4.41 0 012.62-2.62 12.63 12.63 0 014.22-.35z"
          transform="translate(-1 -1)"
        />
      </g>
      <g clipPath="url(#clip-path-14)">
        <path
          className="cls-5"
          d="M27.53 255.64H92a12.7 12.7 0 014.23.35 4.41 4.41 0 012.62 2.62 12.63 12.63 0 01.35 4.22v40.78a12.63 12.63 0 01-.35 4.22 4.41 4.41 0 01-2.62 2.62 12.36 12.36 0 01-4.23.36H27.53c-2.11 0-3.38 0-4.22-.36a4.36 4.36 0 01-2.62-2.62c-.36-.84-.36-2.11-.36-4.22v-40.78c0-2.11 0-3.38.36-4.22a4.36 4.36 0 012.62-2.61 12.63 12.63 0 014.22-.36z"
          transform="translate(-1 -1)"
        />
      </g>
      <g clipPath="url(#clip-path-15)">
        <path
          className="cls-5"
          d="M27.53 343.64H92a12.7 12.7 0 014.23.35 4.41 4.41 0 012.62 2.62 12.63 12.63 0 01.35 4.22v40.78a12.63 12.63 0 01-.35 4.22 4.41 4.41 0 01-2.62 2.62 12.36 12.36 0 01-4.23.36H27.53c-2.11 0-3.38 0-4.22-.36a4.36 4.36 0 01-2.62-2.62c-.36-.84-.36-2.11-.36-4.22v-40.78c0-2.11 0-3.38.36-4.22a4.36 4.36 0 012.62-2.61 12.63 12.63 0 014.22-.36z"
          transform="translate(-1 -1)"
        />
      </g>
      <g clipPath="url(#clip-path-16)">
        <path
          className="cls-10"
          d="M67.41 179.23L57.04 192.74 51.87 186.01 43.65 196.71 40.16 192.17 25.79 210.88 32.77 210.88 43.1 210.88 54.53 210.88 70.97 210.88 91.72 210.88 67.41 179.23z"
        />
      </g>
      <g clipPath="url(#clip-path-17)">
        <path
          className="cls-10"
          d="M39.7 296.94h34.51v1H39.7zm0-7.3h34.51v1H39.7zm2.48-10a.79.79 0 01.91.91.79.79 0 11-.91-.91zm-3.64 0a.8.8 0 01.92.91.83.83 0 01-.66.67.81.81 0 01-.92-.92.82.82 0 01.66-.7zm28.27-1.31h4.58l3.46 4.88h-4.58zm-9 0h4.58l3.46 4.88h-4.6zm-9 0h4.58l3.46 4.88h-4.62zm-4.44 0l3.46 4.88h-3.5zm-6.48-4.15a.79.79 0 010 1.58.79.79 0 110-1.58zm6.44-3.87l4.61 3.82-4.43 1.18-4.6-3.82zm8.67-2.37l4.61 3.82-4.42 1.18-4.61-3.82zm8.72-2.34l4.61 3.82-4.43 1.19-4.61-3.82zm8.71-2.33l4.57 3.82-4.42 1.19-4.58-3.82zm5.28-2.41l-41 11 1.72 6.26V302a3.57 3.57 0 003.57 3.58h33.77a3.57 3.57 0 003.57-3.58v-24.84H43.5l-.3-.41 34.36-9.18z"
          transform="translate(-1 -1)"
        />
      </g>
      <g clipPath="url(#clip-path-18)">
        <path
          className="cls-10"
          d="M54.54 361.43v31.05h6.27v-31.05zm26.1-8.05L62 360.67v30.62L80.64 384zm-45.93 0V384l18.62 7.29v-30.62zm7.73-3.38l-.94.46 12.5 4.86a4 4 0 012.17 2.84 7.06 7.06 0 00-2.84-2.07l-13-5.13-.93.45 13.59 5.38a6.27 6.27 0 012.56 1.86L38.31 352l-.93.45 19.75 7.63v-.55a6.66 6.66 0 00-.46-2.36 4.47 4.47 0 00-2.34-2.52zm30.49 0L61 354.62a4.47 4.47 0 00-2.34 2.52 6.66 6.66 0 00-.46 2.36v.55l19.8-7.63-1-.42-17.3 6.69a6.23 6.23 0 012.55-1.86l13.61-5.38L75 351l-13 5.13a7.06 7.06 0 00-2.84 2.07 4 4 0 012.17-2.84l12.54-4.91z"
          transform="translate(-1 -1)"
        />
      </g>
      <g clipPath="url(#clip-path-19)">
        <path
          className="cls-10"
          d="M390.42 95.42h110.51c4.6 0 7.36 0 9.2.77a9.58 9.58 0 015.72 5.71c.76 1.84.76 4.61.76 9.21v282c0 4.6 0 7.36-.76 9.21a9.58 9.58 0 01-5.72 5.71c-1.84.77-4.6.77-9.2.77H390.42c-4.6 0-7.37 0-9.21-.77a9.59 9.59 0 01-5.71-5.71c-.77-1.85-.77-4.61-.77-9.21v-282c0-4.6 0-7.37.77-9.21a9.59 9.59 0 015.71-5.71c1.84-.77 4.61-.77 9.21-.77z"
          transform="translate(-1 -1)"
        />
      </g>
      <g clipPath="url(#clip-path-20)">
        <path
          d="M395 107a7.95 7.95 0 100 15.89h15.9a7.95 7.95 0 100-15.89z"
          transform="translate(-1 -1)"
          fill="#1db100"
        />
      </g>
      <g clipPath="url(#clip-path-21)">
        <path
          d="M437.78 107a7.95 7.95 0 100 15.89h15.9a7.95 7.95 0 100-15.89z"
          transform="translate(-1 -1)"
          fill="#00ab8e"
        />
      </g>
      <g clipPath="url(#clip-path-22)">
        <path
          d="M480.45 107a7.95 7.95 0 100 15.89h15.89a7.95 7.95 0 100-15.89z"
          transform="translate(-1 -1)"
          fill="#00a2ff"
        />
      </g>
      <g clipPath="url(#clip-path-23)">
        <path className="cls-5" d="M110.33 167.47H222.99V183.8H110.33z" />
      </g>
      <g clipPath="url(#clip-path-24)">
        <path className="cls-5" d="M110.33 206.31H353.96V211H110.33z" />
      </g>
      <g clipPath="url(#clip-path-25)">
        <path className="cls-5" d="M110.33 217.95H305.32V222.64H110.33z" />
      </g>
      <g clipPath="url(#clip-path-26)">
        <path
          className="cls-39"
          d="M352 171.39a9.95 9.95 0 11-14.07 0 9.94 9.94 0 0114.07 0z"
          transform="translate(-1 -1)"
        />
      </g>
      <g clipPath="url(#clip-path-27)">
        <path
          className="cls-39"
          d="M352 258.55a10 10 0 11-14.07 0 10 10 0 0114.07 0z"
          transform="translate(-1 -1)"
        />
      </g>
      <g clipPath="url(#clip-path-28)">
        <path
          className="cls-39"
          d="M352 346.55a10 10 0 11-14.07 0 10 10 0 0114.07 0z"
          transform="translate(-1 -1)"
        />
      </g>
      <g clipPath="url(#clip-path-29)">
        <path
          className="cls-5"
          d="M110.33 254.64H222.99V270.96999999999997H110.33z"
        />
      </g>
      <g clipPath="url(#clip-path-30)">
        <path className="cls-5" d="M110.33 293.48H353.96V298.17H110.33z" />
      </g>
      <g clipPath="url(#clip-path-31)">
        <path className="cls-5" d="M110.33 305.12H305.32V309.81H110.33z" />
      </g>
      <g clipPath="url(#clip-path-32)">
        <path
          className="cls-5"
          d="M110.33 342.64H222.99V358.96999999999997H110.33z"
        />
      </g>
      <g clipPath="url(#clip-path-33)">
        <path className="cls-5" d="M110.33 381.48H353.96V386.17H110.33z" />
      </g>
      <g clipPath="url(#clip-path-34)">
        <path className="cls-5" d="M110.33 393.12H305.32V397.81H110.33z" />
      </g>
      <g clipPath="url(#clip-path-35)" id="navigation-clippath">
        <path
          fill={theme.navigationBackgroundColor}
          d="M9.33 47.25H516.13V81.12H9.33z"
        />
      </g>
    </svg>
  )
);
PagePreview.displayName = 'PagePreview';
