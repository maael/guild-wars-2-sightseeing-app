export default function WelcomeScreen() {
  return (
    <div>
      <div
        style={{
          color: "white",
          fontSize: "3em",
          textAlign: "center",
          marginTop: 10,
          position: "relative",
        }}
      >
        Guild Wars 2 Sightseeing Log
      </div>
      <button
        style={{
          backgroundImage: "url(/ui/new.png)",
          height: 75,
          width: 75,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundColor: "rgba(0, 0, 0, 0)",
          border: "none",
          opacity: 0.5,
          cursor: "pointer",
          userSelect: "none",
        }}
      ></button>
    </div>
  );
}
