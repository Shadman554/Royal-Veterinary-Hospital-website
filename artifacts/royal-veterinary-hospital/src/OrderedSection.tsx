import { Children, isValidElement, type ReactNode } from "react";
import { useHospital, useSite } from "./site-state";
import { useLocation } from "wouter";
import { assetUrl } from "./website-content";

export function OrderedPage({ children }: { children: ReactNode }) {
  const { sectionOrder } = useSite().content;
  const { customSections } = useHospital();
  const [location] = useLocation();
  const builtIn = Children.toArray(children).map((node) => ({ node, order: isValidElement<{ id: string }>(node) ? sectionOrder[node.props.id] ?? 0 : 0 }));
  const custom = customSections.filter((item) => item.visible && item.page === location).map((item) => ({
    order: item.after === "start" ? -0.5 : (sectionOrder[item.after] ?? 0) + 0.5,
    node: <section className="royal-custom-section" key={item.id}><div className="royal-custom-content"><div><h2>{item.title}</h2>{item.body && <p>{item.body}</p>}</div>{item.image && <img src={assetUrl(item.image)} alt="" loading="lazy" />}</div></section>,
  }));
  const items = [...builtIn, ...custom].sort((a, b) => a.order - b.order).map((item) => item.node);
  return <div className="royal-home royal-ordered-page">{items}</div>;
}
export function OrderedSection({ id, children }: { id: string; children: ReactNode }) {
  return <div className="royal-order-block" data-section={id}>{children}</div>;
}
