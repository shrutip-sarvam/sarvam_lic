/**
 * Icon — minimal line icon component using pure Views (no external deps, no emojis).
 * Every icon renders to a fixed-size square with stroke lines composed of Views.
 * Works flawlessly on web and native, no font loading delays.
 */
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Svg, { Path, Polyline } from 'react-native-svg';

type IconName =
  | 'plus' | 'close' | 'check' | 'chevron-down' | 'chevron-right' | 'chevron-left'
  | 'arrow-up' | 'arrow-right' | 'arrow-left'
  | 'camera' | 'upload' | 'file' | 'image' | 'menu'
  | 'search' | 'settings' | 'user' | 'home'
  | 'more' | 'trash' | 'edit' | 'download' | 'share'
  | 'clock' | 'dot' | 'sparkle'
  | 'shield' | 'eye' | 'check-circle';

interface Props {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export function Icon({ name, size = 20, color = '#0A0A0A', strokeWidth = 1.75 }: Props) {
  const s = size;
  const sw = strokeWidth;

  const line = (props: {
    w?: number; h?: number; top?: number; left?: number;
    rot?: number; br?: number;
  }) => (
    <View
      style={[
        styles.line,
        {
          width: props.w ?? sw,
          height: props.h ?? sw,
          top: props.top,
          left: props.left,
          backgroundColor: color,
          transform: props.rot ? [{ rotate: `${props.rot}deg` }] : undefined,
          borderRadius: props.br ?? sw / 2,
        },
      ]}
    />
  );

  const container: any = {
    width: s, height: s, position: 'relative',
    alignItems: 'center', justifyContent: 'center',
  };

  switch (name) {
    case 'plus':
      return (
        <View style={container}>
          <View style={{ width: s * 0.65, height: sw, backgroundColor: color, borderRadius: sw / 2 }} />
          <View style={{ width: sw, height: s * 0.65, backgroundColor: color, borderRadius: sw / 2, position: 'absolute' }} />
        </View>
      );

    case 'close':
      return (
        <View style={container}>
          <View style={{ width: s * 0.7, height: sw, backgroundColor: color, borderRadius: sw / 2, transform: [{ rotate: '45deg' }] }} />
          <View style={{ width: s * 0.7, height: sw, backgroundColor: color, borderRadius: sw / 2, position: 'absolute', transform: [{ rotate: '-45deg' }] }} />
        </View>
      );

    case 'check':
      return (
        <View style={container}>
          <View style={{ width: s * 0.28, height: sw, backgroundColor: color, borderRadius: sw / 2, position: 'absolute', left: s * 0.18, top: s * 0.55, transform: [{ rotate: '45deg' }] }} />
          <View style={{ width: s * 0.5, height: sw, backgroundColor: color, borderRadius: sw / 2, position: 'absolute', left: s * 0.35, top: s * 0.48, transform: [{ rotate: '-45deg' }] }} />
        </View>
      );

    case 'chevron-down':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <Polyline
            points="6 9 12 15 18 9"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'chevron-right':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <Polyline
            points="9 6 15 12 9 18"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'chevron-left':
      return (
        <Svg width={s} height={s} viewBox="0 0 24 24" fill="none">
          <Polyline
            points="15 6 9 12 15 18"
            stroke={color}
            strokeWidth={sw}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </Svg>
      );

    case 'arrow-up':
      return (
        <View style={container}>
          <View style={{ width: sw, height: s * 0.6, backgroundColor: color, borderRadius: sw / 2 }} />
          <View style={{ width: s * 0.3, height: sw, backgroundColor: color, borderRadius: sw / 2, position: 'absolute', top: s * 0.25, left: s * 0.28, transform: [{ rotate: '45deg' }] }} />
          <View style={{ width: s * 0.3, height: sw, backgroundColor: color, borderRadius: sw / 2, position: 'absolute', top: s * 0.25, left: s * 0.42, transform: [{ rotate: '-45deg' }] }} />
        </View>
      );

    case 'arrow-right':
      return (
        <View style={container}>
          <View style={{ width: s * 0.6, height: sw, backgroundColor: color, borderRadius: sw / 2 }} />
          <View style={{ width: s * 0.3, height: sw, backgroundColor: color, borderRadius: sw / 2, position: 'absolute', top: s * 0.32, right: s * 0.2, transform: [{ rotate: '45deg' }] }} />
          <View style={{ width: s * 0.3, height: sw, backgroundColor: color, borderRadius: sw / 2, position: 'absolute', bottom: s * 0.32, right: s * 0.2, transform: [{ rotate: '-45deg' }] }} />
        </View>
      );

    case 'arrow-left':
      return (
        <View style={container}>
          <View style={{ width: s * 0.6, height: sw, backgroundColor: color, borderRadius: sw / 2 }} />
          <View style={{ width: s * 0.3, height: sw, backgroundColor: color, borderRadius: sw / 2, position: 'absolute', top: s * 0.32, left: s * 0.2, transform: [{ rotate: '-45deg' }] }} />
          <View style={{ width: s * 0.3, height: sw, backgroundColor: color, borderRadius: sw / 2, position: 'absolute', bottom: s * 0.32, left: s * 0.2, transform: [{ rotate: '45deg' }] }} />
        </View>
      );

    case 'camera':
      return (
        <View style={container}>
          <View style={{ width: s * 0.85, height: s * 0.65, borderWidth: sw, borderColor: color, borderRadius: 3, position: 'absolute', top: s * 0.2 }} />
          <View style={{ width: s * 0.25, height: sw * 1.5, backgroundColor: color, position: 'absolute', top: s * 0.12, left: s * 0.375, borderRadius: 2 }} />
          <View style={{ width: s * 0.3, height: s * 0.3, borderWidth: sw, borderColor: color, borderRadius: s * 0.15, position: 'absolute', top: s * 0.38 }} />
        </View>
      );

    case 'upload':
      return (
        <View style={container}>
          <View style={{ width: sw, height: s * 0.5, backgroundColor: color, borderRadius: sw / 2, position: 'absolute', top: s * 0.1 }} />
          <View style={{ width: s * 0.3, height: sw, backgroundColor: color, borderRadius: sw / 2, position: 'absolute', top: s * 0.22, left: s * 0.28, transform: [{ rotate: '45deg' }] }} />
          <View style={{ width: s * 0.3, height: sw, backgroundColor: color, borderRadius: sw / 2, position: 'absolute', top: s * 0.22, left: s * 0.42, transform: [{ rotate: '-45deg' }] }} />
          <View style={{ width: s * 0.75, height: sw, backgroundColor: color, borderRadius: sw / 2, position: 'absolute', bottom: s * 0.2 }} />
        </View>
      );

    case 'file':
      return (
        <View style={container}>
          <View style={{ width: s * 0.65, height: s * 0.8, borderWidth: sw, borderColor: color, borderRadius: 2, position: 'absolute', top: s * 0.1 }} />
          <View style={{ width: s * 0.35, height: sw, backgroundColor: color, position: 'absolute', top: s * 0.38, left: s * 0.325, borderRadius: sw / 2 }} />
          <View style={{ width: s * 0.35, height: sw, backgroundColor: color, position: 'absolute', top: s * 0.55, left: s * 0.325, borderRadius: sw / 2 }} />
          <View style={{ width: s * 0.25, height: sw, backgroundColor: color, position: 'absolute', top: s * 0.72, left: s * 0.325, borderRadius: sw / 2 }} />
        </View>
      );

    case 'image':
      return (
        <View style={container}>
          <View style={{ width: s * 0.85, height: s * 0.75, borderWidth: sw, borderColor: color, borderRadius: 3, position: 'absolute', top: s * 0.125 }} />
          <View style={{ width: s * 0.12, height: s * 0.12, borderRadius: s * 0.06, backgroundColor: color, position: 'absolute', top: s * 0.25, left: s * 0.25 }} />
          <View style={{ width: 0, height: 0, borderLeftWidth: s * 0.15, borderRightWidth: s * 0.15, borderBottomWidth: s * 0.25, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color, position: 'absolute', bottom: s * 0.2, left: s * 0.35 }} />
        </View>
      );

    case 'menu':
      return (
        <View style={container}>
          <View style={{ width: s * 0.7, height: sw, backgroundColor: color, borderRadius: sw / 2, position: 'absolute', top: s * 0.28 }} />
          <View style={{ width: s * 0.7, height: sw, backgroundColor: color, borderRadius: sw / 2, position: 'absolute', top: s * 0.48 }} />
          <View style={{ width: s * 0.7, height: sw, backgroundColor: color, borderRadius: sw / 2, position: 'absolute', top: s * 0.68 }} />
        </View>
      );

    case 'search':
      return (
        <View style={container}>
          <View style={{ width: s * 0.55, height: s * 0.55, borderWidth: sw, borderColor: color, borderRadius: s * 0.275, position: 'absolute', top: s * 0.1, left: s * 0.1 }} />
          <View style={{ width: s * 0.3, height: sw, backgroundColor: color, borderRadius: sw / 2, position: 'absolute', bottom: s * 0.13, right: s * 0.1, transform: [{ rotate: '45deg' }] }} />
        </View>
      );

    case 'settings':
      return (
        <View style={container}>
          <View style={{ width: s * 0.35, height: s * 0.35, borderWidth: sw, borderColor: color, borderRadius: s * 0.175, position: 'absolute', top: s * 0.325, left: s * 0.325 }} />
        </View>
      );

    case 'user':
      return (
        <View style={container}>
          <View style={{ width: s * 0.4, height: s * 0.4, borderWidth: sw, borderColor: color, borderRadius: s * 0.2, position: 'absolute', top: s * 0.12 }} />
          <View style={{ width: s * 0.7, height: s * 0.4, borderWidth: sw, borderColor: color, borderTopLeftRadius: s * 0.35, borderTopRightRadius: s * 0.35, borderBottomWidth: 0, position: 'absolute', bottom: 0 }} />
        </View>
      );

    case 'home':
      return (
        <View style={container}>
          <View style={{ width: 0, height: 0, borderLeftWidth: s * 0.4, borderRightWidth: s * 0.4, borderBottomWidth: s * 0.35, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: color, position: 'absolute', top: s * 0.1 }} />
          <View style={{ width: s * 0.6, height: s * 0.4, borderWidth: sw, borderColor: color, position: 'absolute', bottom: s * 0.15, left: s * 0.2 }} />
        </View>
      );

    case 'more':
      return (
        <View style={container}>
          <View style={{ width: sw * 1.4, height: sw * 1.4, borderRadius: sw, backgroundColor: color, position: 'absolute', left: s * 0.2 }} />
          <View style={{ width: sw * 1.4, height: sw * 1.4, borderRadius: sw, backgroundColor: color, position: 'absolute' }} />
          <View style={{ width: sw * 1.4, height: sw * 1.4, borderRadius: sw, backgroundColor: color, position: 'absolute', right: s * 0.2 }} />
        </View>
      );

    case 'trash':
      return (
        <View style={container}>
          <View style={{ width: s * 0.7, height: sw, backgroundColor: color, borderRadius: sw / 2, position: 'absolute', top: s * 0.25 }} />
          <View style={{ width: s * 0.25, height: s * 0.08, borderWidth: sw, borderColor: color, borderRadius: 2, position: 'absolute', top: s * 0.15, borderBottomWidth: 0 }} />
          <View style={{ width: s * 0.55, height: s * 0.5, borderWidth: sw, borderColor: color, borderRadius: 2, position: 'absolute', bottom: s * 0.1, borderTopWidth: 0 }} />
        </View>
      );

    case 'clock':
      return (
        <View style={container}>
          <View style={{ width: s * 0.8, height: s * 0.8, borderWidth: sw, borderColor: color, borderRadius: s * 0.4 }} />
          <View style={{ width: sw, height: s * 0.25, backgroundColor: color, borderRadius: sw / 2, position: 'absolute', top: s * 0.25, left: s * 0.48 }} />
          <View style={{ width: s * 0.2, height: sw, backgroundColor: color, borderRadius: sw / 2, position: 'absolute', top: s * 0.48, left: s * 0.48 }} />
        </View>
      );

    case 'dot':
      return (
        <View style={[container, { borderRadius: s / 2, backgroundColor: color }]} />
      );

    case 'sparkle':
      return (
        <View style={container}>
          <View style={{ width: sw, height: s * 0.7, backgroundColor: color, borderRadius: sw / 2, position: 'absolute' }} />
          <View style={{ width: s * 0.7, height: sw, backgroundColor: color, borderRadius: sw / 2, position: 'absolute' }} />
          <View style={{ width: sw, height: s * 0.4, backgroundColor: color, borderRadius: sw / 2, position: 'absolute', transform: [{ rotate: '45deg' }], opacity: 0.7 }} />
          <View style={{ width: sw, height: s * 0.4, backgroundColor: color, borderRadius: sw / 2, position: 'absolute', transform: [{ rotate: '-45deg' }], opacity: 0.7 }} />
        </View>
      );

    case 'edit':
      return (
        <View style={container}>
          <View style={{ width: s * 0.65, height: sw, backgroundColor: color, borderRadius: sw / 2, position: 'absolute', top: s * 0.35, left: s * 0.1, transform: [{ rotate: '-45deg' }] }} />
          <View style={{ width: s * 0.18, height: sw * 2, backgroundColor: color, position: 'absolute', top: s * 0.12, right: s * 0.08, transform: [{ rotate: '-45deg' }], borderRadius: sw }} />
          <View style={{ width: s * 0.45, height: sw, backgroundColor: color, borderRadius: sw / 2, position: 'absolute', bottom: s * 0.1, left: s * 0.1 }} />
        </View>
      );

    case 'shield':
      return (
        <View style={container}>
          <View style={{
            width: s * 0.7, height: s * 0.8,
            borderWidth: sw, borderColor: color,
            borderTopLeftRadius: s * 0.12, borderTopRightRadius: s * 0.12,
            borderBottomLeftRadius: s * 0.35, borderBottomRightRadius: s * 0.35,
            position: 'absolute', top: s * 0.1,
          }} />
          <View style={{
            width: s * 0.2, height: sw,
            backgroundColor: color, borderRadius: sw / 2,
            position: 'absolute', top: s * 0.48, left: s * 0.32,
            transform: [{ rotate: '45deg' }],
          }} />
          <View style={{
            width: s * 0.3, height: sw,
            backgroundColor: color, borderRadius: sw / 2,
            position: 'absolute', top: s * 0.45, left: s * 0.42,
            transform: [{ rotate: '-45deg' }],
          }} />
        </View>
      );

    case 'eye':
      return (
        <View style={container}>
          <View style={{
            width: s * 0.9, height: s * 0.55,
            borderWidth: sw, borderColor: color,
            borderRadius: s * 0.275,
            position: 'absolute', top: s * 0.225,
          }} />
          <View style={{
            width: s * 0.28, height: s * 0.28,
            borderWidth: sw, borderColor: color,
            borderRadius: s * 0.14,
            position: 'absolute', top: s * 0.36, left: s * 0.36,
          }} />
        </View>
      );

    case 'check-circle':
      return (
        <View style={container}>
          <View style={{
            width: s * 0.85, height: s * 0.85,
            borderWidth: sw, borderColor: color,
            borderRadius: s * 0.425,
            position: 'absolute', top: s * 0.075, left: s * 0.075,
          }} />
          <View style={{ width: s * 0.2, height: sw, backgroundColor: color, borderRadius: sw / 2, position: 'absolute', left: s * 0.28, top: s * 0.52, transform: [{ rotate: '45deg' }] }} />
          <View style={{ width: s * 0.38, height: sw, backgroundColor: color, borderRadius: sw / 2, position: 'absolute', left: s * 0.4, top: s * 0.46, transform: [{ rotate: '-45deg' }] }} />
        </View>
      );

    case 'share':
    case 'download':
      return (
        <View style={container}>
          <View style={{ width: sw, height: s * 0.5, backgroundColor: color, borderRadius: sw / 2, position: 'absolute', top: s * 0.2 }} />
          <View style={{ width: s * 0.3, height: sw, backgroundColor: color, borderRadius: sw / 2, position: 'absolute', top: s * 0.48, left: s * 0.28, transform: [{ rotate: '-45deg' }] }} />
          <View style={{ width: s * 0.3, height: sw, backgroundColor: color, borderRadius: sw / 2, position: 'absolute', top: s * 0.48, left: s * 0.42, transform: [{ rotate: '45deg' }] }} />
          <View style={{ width: s * 0.75, height: sw, backgroundColor: color, borderRadius: sw / 2, position: 'absolute', bottom: s * 0.15 }} />
        </View>
      );

    default:
      return <Text style={{ fontSize: size * 0.7, color }}>·</Text>;
  }
}

const styles = StyleSheet.create({
  line: { position: 'absolute' },
});
