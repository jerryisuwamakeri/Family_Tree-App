import React, {useState, useEffect} from 'react';
import {
  View, Text, StyleSheet, ScrollView, Dimensions, Alert,
} from 'react-native';
import Svg, {Line, Rect, Text as SvgText, G} from 'react-native-svg';
import {membersApi} from '../../api/members';
import {COLORS, FONTS, SPACING} from '../../utils/theme';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';

const {width: SCREEN_W} = Dimensions.get('window');

const NODE_W = 132;
const NODE_H = 50;
const H_GAP = 16;
const V_GAP = 52;
const PAD = SPACING.base;

// Lay out the recursive /tree node into positioned boxes + connector lines.
// Leaves claim the next horizontal slot; a parent centers over its children.
function layoutTree(root) {
  const nodes = [];
  const edges = [];
  let slot = 0;
  let maxDepth = 0;

  const place = (node, depth) => {
    maxDepth = Math.max(maxDepth, depth);
    const children = node.children || [];
    const y = depth * (NODE_H + V_GAP) + NODE_H / 2 + PAD;

    let x;
    if (children.length === 0) {
      x = slot * (NODE_W + H_GAP) + NODE_W / 2 + PAD;
      slot += 1;
    } else {
      const kids = children.map(c => place(c, depth + 1));
      x = (kids[0].x + kids[kids.length - 1].x) / 2;
      kids.forEach(k =>
        edges.push({x1: x, y1: y + NODE_H / 2, x2: k.x, y2: k.y - NODE_H / 2}),
      );
    }

    const positioned = {
      id: node.id,
      name: node.name || 'Unknown',
      year: node.dob ? String(node.dob).slice(0, 4) : null,
      isDeceased: !!node.is_deceased,
      isProgenitor: !!node.is_progenitor,
      isRoot: depth === 0,
      x,
      y,
    };
    nodes.push(positioned);
    return positioned;
  };

  place(root, 0);

  const width = slot * (NODE_W + H_GAP) + PAD * 2;
  const height = (maxDepth + 1) * (NODE_H + V_GAP) + PAD * 2;
  return {nodes, edges, width, height, count: nodes.length};
}

function TreeNode({node, onPress}) {
  const x = node.x - NODE_W / 2;
  const y = node.y - NODE_H / 2;
  const stroke = node.isRoot
    ? COLORS.primary
    : node.isProgenitor
    ? COLORS.secondary
    : COLORS.border;

  return (
    <G onPress={() => onPress(node)}>
      <Rect
        x={x} y={y} width={NODE_W} height={NODE_H} rx={10} ry={10}
        fill={node.isDeceased ? '#F3F4F6' : COLORS.white}
        stroke={stroke}
        strokeWidth={node.isRoot || node.isProgenitor ? 2.5 : 1.5}
      />
      <SvgText
        x={node.x} y={node.year ? node.y - 4 : node.y + 4}
        textAnchor="middle" fontSize={11}
        fontWeight={node.isRoot ? '700' : '500'}
        fill={node.isDeceased ? COLORS.textMuted : COLORS.text}>
        {node.name.length > 17 ? node.name.slice(0, 16) + '…' : node.name}
      </SvgText>
      {node.year ? (
        <SvgText x={node.x} y={node.y + 12} textAnchor="middle" fontSize={9} fill={COLORS.textMuted}>
          {node.isDeceased ? `† ${node.year}` : `b. ${node.year}`}
        </SvgText>
      ) : node.isDeceased ? (
        <SvgText x={node.x} y={node.y + 12} textAnchor="middle" fontSize={9} fill={COLORS.textMuted}>†</SvgText>
      ) : null}
    </G>
  );
}

export default function FamilyTreeScreen({route, navigation}) {
  const {memberId} = route.params;
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    membersApi.tree(memberId)
      .then(setData)
      .catch(e => Alert.alert('Error', e.message))
      .finally(() => setLoading(false));
  }, [memberId]);

  if (loading) return <LoadingSpinner fullScreen message="Building family tree…" />;
  if (!data) return null;

  const {nodes, edges, width, height, count} = layoutTree(data);

  const onNode = node => navigation.push('MemberDetail', {memberId: node.id});

  return (
    <View style={styles.screen}>
      <View style={styles.legend}>
        <Legend color={COLORS.primary} label={data.name} />
        <Legend color={COLORS.secondary} label="Progenitor" />
        <Legend color={COLORS.textMuted} label="† Deceased" />
        <Text style={styles.hint}>{count} in view · tap to open</Text>
      </View>

      {count <= 1 && !(data.children || []).length ? (
        <EmptyState
          icon="git-branch-outline"
          title="No descendants recorded yet"
          subtitle="Add children to this person to grow the tree."
        />
      ) : (
        <ScrollView horizontal>
          <ScrollView>
            <Svg width={Math.max(width, SCREEN_W)} height={height}>
              {edges.map((e, i) => (
                <Line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} stroke={COLORS.border} strokeWidth={1.5} />
              ))}
              {nodes.map(n => (
                <TreeNode key={n.id} node={n} onPress={onNode} />
              ))}
            </Svg>
          </ScrollView>
        </ScrollView>
      )}
    </View>
  );
}

function Legend({color, label}) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, {backgroundColor: color}]} />
      <Text style={styles.legendText} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: COLORS.background},
  legend: {
    flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center',
    padding: SPACING.sm, backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.border, gap: SPACING.base,
  },
  legendItem: {flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: 150},
  dot: {width: 10, height: 10, borderRadius: 5},
  legendText: {fontSize: FONTS.sizes.xs, color: COLORS.textMuted},
  hint: {fontSize: FONTS.sizes.xs, color: COLORS.textLight, marginLeft: 'auto'},
});
