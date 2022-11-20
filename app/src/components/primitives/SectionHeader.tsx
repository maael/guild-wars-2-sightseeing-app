import { PropsWithChildren } from "react";

export default function SectionHeader({ children }: PropsWithChildren) {
  return <h2 className="text-center text-2xl mb-1 capitalize">{children}</h2>;
}
