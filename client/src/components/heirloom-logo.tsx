export function HeirloomLogo({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg
      width="49"
      height="48"
      viewBox="0 0 49 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath="url(#clip0_1_126)">
        <path
          d="M33.0998 40.9766L24.1631 48.0053L15.2262 40.9762V32.4492H0.163086V15.5461H15.2262V7.02931L24.1631 -0.000137329L33.0998 7.02931V15.5566H48.1631V32.4598H33.0998V40.9766Z"
          fill="currentColor"
        />
        <path
          d="M24.1631 34.7599C29.7764 34.7599 34.3298 30.2066 34.3298 24.5932C34.3298 18.9799 29.7764 14.4268 24.1631 14.4268C18.55 14.4268 13.9966 18.9799 13.9966 24.5932C13.9966 30.2066 18.55 34.7599 24.1631 34.7599Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_1_126">
          <rect
            width="48"
            height="48"
            fill="white"
            transform="translate(0.163086)"
          />
        </clipPath>
      </defs>
    </svg>
  );
}