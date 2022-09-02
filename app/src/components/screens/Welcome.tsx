import { Link } from "react-router-dom";

export default function WelcomeScreen() {
  return (
    <div>
      <div className="relative mt-3 text-center text-4xl text-white">
        Guild Wars 2 Sightseeing Log
      </div>
      <Link to="/groups/new">
        <button
          className="h-20 w-20 cursor-pointer select-none opacity-50 hover:opacity-100 bg-no-repeat bg-cover bg-center"
          style={{
            backgroundImage: "url(/ui/new.png)",
          }}
        ></button>
      </Link>
    </div>
  );
}
