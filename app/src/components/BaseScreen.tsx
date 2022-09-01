import React from "react";

export default function BaseScreen({ children }: React.PropsWithChildren) {
  return <div className="container">{children}</div>;
}
