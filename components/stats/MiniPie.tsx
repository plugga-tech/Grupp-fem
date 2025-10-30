import React from "react";
import Pie, { PieSlice } from "./Pie";

export default function MiniPie({
  data,
  size = 64,
}: {
  data: PieSlice[];
  size?: number;
}) {
  return <Pie data={data} size={size} showSliceIcons={false} />;
}
