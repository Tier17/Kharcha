import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'mic'
  | 'micFilled'
  | 'pencil'
  | 'camera'
  | 'settings'
  | 'clock'
  | 'play'
  | 'pause'
  | 'close'
  | 'back'
  | 'delete'
  | 'check'
  | 'chart'
  | 'plus'
  | 'forward'
  | 'sparkle'
  | 'grid'
  | 'coin';

/** Thin-stroke, hand-drawn icon set (24×24 grid). */
export function Icon({
  name,
  size = 22,
  color,
  strokeWidth = 1.6,
}: {
  name: IconName;
  size?: number;
  color: string;
  strokeWidth?: number;
}) {
  const p = {
    stroke: color,
    strokeWidth,
    fill: 'none',
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'mic' && (
        <>
          <Rect x={9} y={3} width={6} height={11} rx={3} {...p} />
          <Path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" {...p} />
        </>
      )}
      {name === 'micFilled' && (
        <>
          <Rect x={8.75} y={2.75} width={6.5} height={11.5} rx={3.25} fill={color} />
          <Path d="M5.5 11.5a6.5 6.5 0 0 0 13 0M12 18v3" {...p} />
        </>
      )}
      {name === 'pencil' && <Path d="M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4" {...p} />}
      {name === 'camera' && (
        <>
          <Path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.5-2h6l1.5 2h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-9Z" {...p} />
          <Circle cx={12} cy={12.5} r={3.25} {...p} />
        </>
      )}
      {name === 'settings' && (
        <>
          <Path d="M10.3 3.5h3.4l.5 2.3 1.6.9 2.2-.8 1.7 2.9-1.8 1.6v1.8l1.8 1.6-1.7 2.9-2.2-.8-1.6.9-.5 2.3h-3.4l-.5-2.3-1.6-.9-2.2.8-1.7-2.9 1.8-1.6v-1.8L4.3 8.8 6 5.9l2.2.8 1.6-.9.5-2.3Z" {...p} />
          <Circle cx={12} cy={12} r={2.75} {...p} />
        </>
      )}
      {name === 'clock' && (
        <>
          <Circle cx={12} cy={12} r={8.25} {...p} />
          <Path d="M12 7.5V12l3 2" {...p} />
        </>
      )}
      {name === 'play' && <Path d="M8 5.5v13l10.5-6.5L8 5.5Z" {...p} fill={color} />}
      {name === 'pause' && <Path d="M8.5 5.5v13M15.5 5.5v13" {...p} strokeWidth={strokeWidth + 1} />}
      {name === 'close' && <Path d="M6 6l12 12M18 6 6 18" {...p} />}
      {name === 'back' && <Path d="M15 5l-7 7 7 7" {...p} />}
      {name === 'delete' && <Path d="M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13" {...p} />}
      {name === 'check' && <Path d="M5 12.5l4.5 4.5L19 7.5" {...p} />}
      {name === 'chart' && <Path d="M5 19.5V13M10 19.5V5.5M15 19.5v-9M20 19.5v-4" {...p} />}
      {name === 'plus' && <Path d="M12 5v14M5 12h14" {...p} />}
      {name === 'forward' && <Path d="M9 5l7 7-7 7" {...p} />}
      {name === 'sparkle' && (
        <Path d="M12 3c.5 4.6 2 6.5 8 9-6 2.5-7.5 4.4-8 9-.5-4.6-2-6.5-8-9 6-2.5 7.5-4.4 8-9Z" {...p} />
      )}
      {name === 'grid' && (
        <Path d="M5 5h5.5v5.5H5V5ZM13.5 5H19v5.5h-5.5V5ZM5 13.5h5.5V19H5v-5.5ZM13.5 13.5H19V19h-5.5v-5.5Z" {...p} />
      )}
      {name === 'coin' && (
        <>
          <Circle cx={12} cy={12} r={8} {...p} />
          <Path d="M14.5 9.5c-.5-.9-1.4-1.3-2.5-1.3-1.5 0-2.5.8-2.5 1.9 0 2.6 5.2 1.4 5.2 4 0 1.1-1.1 1.9-2.7 1.9-1.2 0-2.1-.5-2.6-1.4M12 6.8v1.4M12 15.9v1.3" {...p} />
        </>
      )}
    </Svg>
  );
}
