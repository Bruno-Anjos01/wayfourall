const paths = {
  search: "m21 21-5-5 M19 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0",
  pin: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z M15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  heart:
    "M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
  user: "M20 21v-2a6 6 0 0 0-6-6h-4a6 6 0 0 0-6 6v2 M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
  access: "M13 4a1 1 0 1 1 0 .1 M12 7v7h6l3 6 M12 10H8 M8 12a6 6 0 1 0 8 8",
  arrow: "M5 12h14 m-6-6 6 6-6 6",
  check: "m5 12 4 4L19 6",
  plus: "M12 5v14 M5 12h14",
  map: "m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3Z M9 3v15 M15 6v15",
  food: "M5 3v6 M9 3v6 M3 3v6a3 3 0 0 0 6 0 M6 12v9 M19 3c-5 4-5 9 0 9V3v18",
  health: "M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z",
  park: "m12 2 7 9h-4l6 7H3l6-7H5Z M12 18v4",
  building:
    "M4 21V3h16v18 M2 21h20 M8 7h1 M15 7h1 M8 11h1 M15 11h1 M10 21v-6h4v6",
  bus: "M5 17V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v12H5Z M5 11h14 M8 17v4 M16 17v4 M8 14h.1 M16 14h.1",
  eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
  shield: "m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6Z m-5 10 3 3 7-7",
  menu: "M4 6h16 M4 12h16 M4 18h16",
  globe:
    "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0 M2 12h20 M12 2c6 6 6 14 0 20-6-6-6-14 0-20",
  filter: "M4 7h16 M4 17h16 M8 4v6 M16 14v6",
  out: "M9 5H4v14h5 M10 12h12 m-5-5 5 5-5 5",
  star: "m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1Z",
};
export default function Icon({ name = "pin", size = 22, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] || paths.pin} />
    </svg>
  );
}
