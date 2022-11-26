import { CSSProperties } from "react";
import cls from "classnames";

export default function RingedItems({
  type,
  items,
  selected,
  label,
  mapping,
  onClick,
}: {
  type: "expansion" | "mount";
  selected?: string[];
  items?: string[];
  label: string;
  onClick?: (key: string) => void;
  mapping: {
    [k: string]: {
      icon: string;
      label: string;
      bg: CSSProperties;
      ring: CSSProperties;
    };
  };
}) {
  const listItems = items || Object.keys(mapping);
  const isInteractive = !!onClick;
  return (
    <div className="flex flex-col xs:flex-row gap-2 xs:gap-3 w-full justify-center items-center my-1">
      <div>{label}</div>
      <div className="flex flex-row gap-3 justify-center items-center flex-wrap">
        {listItems.map((key) =>
          mapping[key] ? (
            <img
              key={key}
              onClick={onClick ? () => onClick(key) : undefined}
              src={
                type === "expansion"
                  ? `/ui/logos/${mapping[key].icon}.png`
                  : `https://gw2-sightseeing.maael.xyz/avatars/${mapping[key].icon}.jpg`
              }
              title={mapping[key].label}
              className={cls(
                "w-6 h-6 rounded-full transition-opacity outline-1 outline-offset-2",
                {
                  outline:
                    !isInteractive ||
                    (isInteractive && selected?.includes(key)),
                  "opacity-50 hover:opacity-80 hover:outline":
                    isInteractive && !selected?.includes(key),
                  "gwcursor-btn": isInteractive,
                }
              )}
              style={{
                ...mapping[key].bg,
                ...mapping[key].ring,
              }}
            />
          ) : null
        )}
      </div>
    </div>
  );
}
