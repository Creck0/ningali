export default function Card({ as: Tag = "div", className = "", children, ...props }) {
  return (
    <Tag
      className={`bg-base-card border border-base-border rounded-xl shadow-card ${className}`}
      {...props}
    >
      {children}
    </Tag>
  );
}
