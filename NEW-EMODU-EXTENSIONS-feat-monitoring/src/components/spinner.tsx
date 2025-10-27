interface SpinnerProps {
  className?: string;
}
export default function Spinner({className=''}: SpinnerProps) {
  return (
    <div
      className={`${className} rounded-full animate-spin
      border-2 border-solid border-blue-500 border-t-transparent`}
    ></div>
  );
}
