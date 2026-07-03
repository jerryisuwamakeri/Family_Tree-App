import React, {useState, useEffect, useRef} from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Dimensions, Alert,
} from 'react-native';
import Svg, {Line, Rect, Text as SvgText, G} from 'react-native-svg';
import {membersApi} from '../../api/members';
import {COLORS, FONTS, SPACING, RADIUS, SHADOWS} from '../../utils/theme';
import LoadingSpinner from '../../components/LoadingSpinner';

const {width: SCREEN_W} = Dimensions.get('window');

// Node dimensions
const NODE_W = 130;
const NODE_H = 50;
const H_GAP = 20;
const V_GAP = 70;

function TreeNode({node, onPress}) {
  const x = node.x - NODE_W / 2;
  const y = node.y - NODE_H / 2;
  const isDeceased = node.is_deceased;

  return (
    <G onPress={() => onPress(node)}>
      <Rect
        x={x} y={y} width={NODE_W} height={NODE_H}
        rx={8} ry={8}
        fill={isDeceased ? '#f3f4f6' : '#ffffff'}
        stroke={node.isRoot ? COLORS.primary : COLORS.border}
        strokeWidth={node.isRoot ? 2.5 : 1.5}
      />
      <SvgText
        x={node.x} y={node.y - 7}
        textAnchor="middle" fontSize={11}
        fontWeight={node.isRoot ? '700' : '500'}
        fill={isDeceased ? COLORS.textMuted : COLORS.text}
        numberOfLines={1}>
        {node.name?.length > 16 ? node.name.slice(0, 15) + '…' : node.name}
      </SvgText>
      {node.dob && (
        <SvgText
          x={node.x} y={node.y + 10}
          textAnchor="middle" fontSize={9}
          fill={COLORS.textMuted}>
          {node.dob}
        </SvgText>
      )}
      {isDeceased && (
        <SvgText x={node.x} y={node.y + 22} textAnchor="middle" fontSize={8} fill={COLORS.danger}>
          †
        </SvgText>
      )}
    </G>
  );
}

function buildTree(data) {
  if (!data) return {nodes: [], edges: [], width: 400, height: 300};

  const nodes = [];
  const edges = [];

  const centerX = 300;
  const rootY = 200;

  // Root member
  const root = {
    id: data.id,
    name: data.full_name,
    dob: data.date_of_birth?.slice(0, 4),
    is_deceased: data.is_deceased,
    isRoot: true,
    x: centerX,
    y: rootY,
    memberId: data.id,
  };
  nodes.push(root);

  // Parents row above root
  const parents = [];
  if (data.father) {
    parents.push({
      id: data.father.id,
      name: data.father.full_name,
      dob: data.father.date_of_birth?.slice(0, 4),
      is_deceased: data.father.is_deceased,
      memberId: data.father.id,
    });
  }
  if (data.mother) {
    parents.push({
      id: data.mother.id,
      name: data.mother.full_name,
      dob: data.mother.date_of_birth?.slice(0, 4),
      is_deceased: data.mother.is_deceased,
      memberId: data.mother.id,
    });
  }

  const parentY = rootY - NODE_H - V_GAP;
  const totalParentW = parents.length * NODE_W + (parents.length - 1) * H_GAP;
  let px = centerX - totalParentW / 2 + NODE_W / 2;

  parents.forEach(p => {
    const node = {...p, x: px, y: parentY};
    nodes.push(node);
    edges.push({x1: centerX, y1: rootY - NODE_H / 2, x2: px, y2: parentY + NODE_H / 2});
    px += NODE_W + H_GAP;
  });

  // Spouses row beside root
  if (data.spouses?.length) {
    data.spouses.forEach((s, i) => {
      const sx = centerX + NODE_W + H_GAP + i * (NODE_W + H_GAP);
      nodes.push({
        id: s.id, name: s.full_name,
        dob: s.date_of_birth?.slice(0, 4),
        is_deceased: s.is_deceased,
        memberId: s.id, x: sx, y: rootY,
      });
      edges.push({x1: centerX + NODE_W / 2, y1: rootY, x2: sx - NODE_W / 2, y2: rootY});
    });
  }

  // Children row below root
  const children = data.children || [];
  const childY = rootY + NODE_H + V_GAP;
  const totalChildW = children.length * NODE_W + (children.length - 1) * H_GAP;
  let cx = centerX - totalChildW / 2 + NODE_W / 2;

  children.forEach(c => {
    const node = {
      id: c.id, name: c.full_name,
      dob: c.date_of_birth?.slice(0, 4),
      is_deceased: c.is_deceased,
      memberId: c.id, x: cx, y: childY,
    };
    nodes.push(node);
    edges.push({x1: centerX, y1: rootY + NODE_H / 2, x2: cx, y2: childY - NODE_H / 2});
    cx += NODE_W + H_GAP;
  });

  // Calculate SVG dimensions
  const allX = nodes.map(n => n.x);
  const allY = nodes.map(n => n.y);
  const minX = Math.min(...allX) - NODE_W / 2 - SPACING.base;
  const maxX = Math.max(...allX) + NODE_W / 2 + SPACING.base;
  const minY = Math.min(...allY) - NODE_H / 2 - SPACING.base;
  const maxY = Math.max(...allY) + NODE_H / 2 + SPACING.base;

  // Offset all nodes so minX/minY start at 0
  const offsetX = -minX + SPACING.base;
  const offsetY = -minY + SPACING.base;

  return {
    nodes: nodes.map(n => ({...n, x: n.x + offsetX, y: n.y + offsetY})),
    edges: edges.map(e => ({
      x1: e.x1 + offsetX, y1: e.y1 + offsetY,
      x2: e.x2 + offsetX, y2: e.y2 + offsetY,
    })),
    width: maxX - minX + SPACING.xl,
    height: maxY - minY + SPACING.xl,
  };
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

  const {nodes, edges, width, height} = buildTree(data);

  const handleNodePress = node => {
    navigation.push('MemberDetail', {memberId: node.memberId});
  };

  return (
    <View style={styles.screen}>
      <View style={styles.legend}>
        <View style={styles.legendItem}>
          <View style={[styles.dot, {backgroundColor: COLORS.primary}]} />
          <Text style={styles.legendText}>Root member</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.dot, {backgroundColor: COLORS.textMuted}]} />
          <Text style={styles.legendText}>† Deceased</Text>
        </View>
        <Text style={styles.legendHint}>Tap a node to view profile</Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator>
        <ScrollView showsVerticalScrollIndicator>
          <Svg width={Math.max(width, SCREEN_W)} height={height}>
            {edges.map((e, i) => (
              <Line
                key={i}
                x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                stroke={COLORS.border} strokeWidth={1.5}
              />
            ))}
            {nodes.map(node => (
              <TreeNode key={node.id} node={node} onPress={handleNodePress} />
            ))}
          </Svg>
        </ScrollView>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: COLORS.background},
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    padding: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: SPACING.base,
  },
  legendItem: {flexDirection: 'row', alignItems: 'center', gap: 4},
  dot: {width: 10, height: 10, borderRadius: 5},
  legendText: {fontSize: FONTS.sizes.xs, color: COLORS.textMuted},
  legendHint: {fontSize: FONTS.sizes.xs, color: COLORS.textLight, marginLeft: 'auto'},
});
