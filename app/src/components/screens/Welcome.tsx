import { Link } from "react-router-dom";

export default function WelcomeScreen() {
  return (
    <div>
      <div className="relative mt-3 text-center text-4xl text-white">
        Guild Wars 2 Sightseeing Log
      </div>
      <Link to="/groups">
        <div className="flex flex-row justify-center items-center">List</div>
      </Link>
      <Link to="/connected">
        <div className="flex flex-row justify-center items-center">
          Connecting
        </div>
      </Link>
    </div>
  );
}
