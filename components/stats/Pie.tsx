import React from "react";
import { StyleSheet, View } from "react-native";
import Svg, { Circle, Path, Text as SvgText } from "react-native-svg";

export type PieSlice = { value: number; color: string; icon?: string };

type Props = {
  data: PieSlice[];
  size?: number; // total diameter i px
  showSliceIcons?: boolean; // visa emoji/ikon i respektive slice (endast totals)
  iconSize?: number; // emoji-storlek
};

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

// Skapar en fylld sektor (tårtbit) som path: M center -> L start -> Arc -> Z
function sectorPath(
  cx: number,
  cy: number,
  r: number,
  startDeg: number,
  endDeg: number
) {
  // Särfall: full cirkel (en enda slice = 100%)
  if (Math.abs(endDeg - startDeg) >= 360 - 0.0001) {
    // Draw a full circle via Circle fill
    return null;
  }

  const start = polarToCartesian(cx, cy, r, startDeg);
  const end = polarToCartesian(cx, cy, r, endDeg);
  const largeArcFlag = endDeg - startDeg > 180 ? 1 : 0;

  // M center L start A r r 0 largeArc 1 end Z
  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 1 ${end.x} ${end.y} Z`;
}

export default function Pie({
  data,
  size = 160,
  showSliceIcons = false,
  iconSize = 18,
}: Props) {
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2;

  const total = data.reduce((sum, d) => sum + (d?.value ?? 0), 0);
  const slices = data.filter((d) => (d?.value ?? 0) > 0);

  // Ingen data: visa en neutral, fylld cirkel (som i Figma “tom paj”)
  if (total <= 0) {
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Circle cx={cx} cy={cy} r={r} fill="#E5E5E5" />
        </Svg>
      </View>
    );
  }

  if (slices.length === 1) {
    const only = slices[0];
    return (
      <View style={[styles.container, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Circle cx={cx} cy={cy} r={r} fill={only.color} />
          {showSliceIcons && only.icon ? (
            <SvgText
              x={cx}
              y={cy + iconSize * 0.35}
              fontSize={iconSize}
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {only.icon}
            </SvgText>
          ) : null}
        </Svg>
      </View>
    );
  }

  let cursorDeg = -90;
  const paths: React.ReactNode[] = [];
  const icons: React.ReactNode[] = [];

  slices.forEach((s, i) => {
    const sweep = (s.value / total) * 360;
    const start = cursorDeg;
    const end = cursorDeg + sweep;

    const d = sectorPath(cx, cy, r, start, end);
    if (d) {
      paths.push(<Path key={`p-${i}`} d={d} fill={s.color} />);
    } else {
      paths.push(
        <Circle key={`c-${i}`} cx={cx} cy={cy} r={r} fill={s.color} />
      );
    }

    if (showSliceIcons && s.icon) {
      const mid = (start + end) / 2;
      const labelR = r * 0.5;
      const pos = polarToCartesian(cx, cy, labelR, mid);
      icons.push(
        <SvgText
          key={`t-${i}`}
          x={pos.x}
          y={pos.y + iconSize * 0.35}
          fontSize={iconSize}
          textAnchor="middle"
          alignmentBaseline="middle"
        >
          {s.icon}
        </SvgText>
      );
    }

    cursorDeg = end;
  });

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {paths}
        {icons}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: "center", justifyContent: "center" },
});
