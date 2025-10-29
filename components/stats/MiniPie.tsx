import React from "react";
import Pie, { PieSlice } from "./Pie";

// Mini‑pajer: inga ikoner, bara färgade tårtbitar
export default function MiniPie({ data }: { data: PieSlice[] }) {
  return <Pie data={data} size={64} showSliceIcons={false} />;
}
