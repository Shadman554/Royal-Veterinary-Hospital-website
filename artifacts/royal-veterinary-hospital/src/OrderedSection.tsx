import { Children, isValidElement, type ReactNode } from "react";
import { useSite } from "./site-state";

export function OrderedPage({ children }: { children: ReactNode }) {
  const { sectionOrder } = useSite().content;
  const items = Children.toArray(children).sort((a, b) => {
    const left = isValidElement<{ id: string }>(a) ? sectionOrder[a.props.id] ?? 0 : 0;
    const right = isValidElement<{ id: string }>(b) ? sectionOrder[b.props.id] ?? 0 : 0;
    return left - right;
  });
  return <div className="royal-home royal-ordered-page">{items}</div>;
}
export function OrderedSection({ id, children }: { id: string; children: ReactNode }) {
  return <div className="royal-order-block" data-section={id}>{children}</div>;
}
