import type { ReactNode } from "react";
import { Typography } from "@mui/material";

export const EmptyState = ({ icon, title, description, action }: {
  icon: ReactNode; title: string; description?: string; action?: ReactNode;
}) => (
  <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 px-6 py-12 text-center">
    <div className="text-slate-400 [&_svg]:text-5xl">{icon}</div>
    <Typography variant="subtitle1" fontWeight={600}>{title}</Typography>
    {description && <Typography variant="body2" color="text.secondary">{description}</Typography>}
    {action && <div className="mt-2">{action}</div>}
  </div>
);
