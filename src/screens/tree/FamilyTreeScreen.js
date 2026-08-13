import React, {useState, useEffect, useCallback} from 'react';
import {
  View, Text, StyleSheet, ScrollView, Dimensions, Alert, TouchableOpacity,
} from 'react-native';
import Svg, {Line, Rect, Text as SvgText, G} from 'react-native-svg';
import {membersApi} from '../../api/members';
import {COLORS, FONTS, SPACING, RADIUS, SHADOWS} from '../../utils/theme';
import LoadingSpinner from '../../components/LoadingSpinner';
import EmptyState from '../../components/EmptyState';
import Icon from '../../components/Icon';

const {width: SCREEN_W} = Dimensions.get('window');

const NODE_W = 152;
const NODE_H = 64;
const CHILD_GAP = 18;
const BLOCK_GAP = 40;
const ROW_GAP = 84;
const PAD = SPACING.lg;
const ZOOM_MIN = 0.5;
const ZOOM_MAX = 1.75;
const ZOOM_STEP = 0.25;

// Household chart: root + each spouse (marriage line) + each spouse's children
// (drop line + spread), matching the same /chart shape the web app's
// "Interactive chart" tab already renders correctly.
function layoutChart(chart) {
  const nodes = [];
  const marriageEdges = [];
  const descentEdges = [];

  const households = chart.households || [];
  let cursorX = PAD;
  const blocks = [];

  households.forEach(h => {
    const childCount = (h.children || []).length;
    const childrenWidth = childCount
      ? childCount * NODE_W + (childCount - 1) * CHILD_GAP
      : 0;
    const blockWidth = Math.max(NODE_W, childrenWidth);
    blocks.push({household: h, blockWidth, startX: cursorX});
    cursorX += blockWidth + BLOCK_GAP;
  });
  const totalWidth = Math.max(cursorX - BLOCK_GAP + PAD, NODE_W + PAD * 2);

  const spouseY = NODE_H / 2 + PAD;
  const childY = spouseY + ROW_GAP;

  const hasSpouses = blocks.some(b => b.household.id !== 0);
  const rootX = hasSpouses
    ? (blocks[0].startX + blocks[0].blockWidth / 2 +
       blocks[blocks.length - 1].startX + blocks[blocks.length - 1].blockWidth / 2) / 2
    : totalWidth / 2;

  nodes.push({
    id: chart.root.id,
    name: chart.root.name || 'Unknown',
    subtitle: chart.root.compound,
    isRoot: true,
    x: rootX,
    y: spouseY,
  });

  blocks.forEach(({household, blockWidth, startX}) => {
    const isDirect = household.id === 0;
    const centerX = startX + blockWidth / 2;
    const children = household.children || [];

    if (!isDirect) {
      nodes.push({
        id: household.id,
        name: household.name || 'Unknown',
        subtitle: household.compound,
        isSpouse: true,
        x: centerX,
        y: spouseY,
      });
      marriageEdges.push({x1: rootX, y1: spouseY, x2: centerX, y2: spouseY});
    }

    if (children.length) {
      const parentX = isDirect ? rootX : centerX;
      const dropFromY = isDirect ? spouseY + NODE_H / 2 : spouseY + NODE_H / 2;
      children.forEach((c, i) => {
        const cx = startX + i * (NODE_W + CHILD_GAP) + NODE_W / 2;
        nodes.push({
          id: c.id,
          name: c.name || 'Unknown',
          subtitle: c.compound,
          isChild: true,
          x: cx,
          y: childY,
        });
        descentEdges.push({x1: parentX, y1: dropFromY, x2: cx, y2: childY - NODE_H / 2});
      });
    }
  });

  const anyChildren = blocks.some(b => (b.household.children || []).length);
  const contentBottom = anyChildren ? childY + NODE_H / 2 : spouseY + NODE_H / 2;
  const height = contentBottom - PAD + PAD * 2;
  return {nodes, marriageEdges, descentEdges, width: totalWidth, height, count: nodes.length};
}

function TreeNode({node}) {
  const x = node.x - NODE_W / 2;
  const y = node.y - NODE_H / 2;
  const stroke = node.isRoot ? COLORS.primary : node.isSpouse ? COLORS.secondary : COLORS.border;
  const fill = node.isRoot ? COLORS.primaryLight : COLORS.white;
  const name = node.name.length > 20 ? node.name.slice(0, 19) + '…' : node.name;

  return (
    <G>
      <Rect
        x={x} y={y} width={NODE_W} height={NODE_H} rx={14} ry={14}
        fill={fill}
        stroke={stroke}
        strokeWidth={node.isRoot ? 2.5 : 1.5}
      />
      <SvgText
        x={node.x} y={node.subtitle ? node.y - 3 : node.y + 5}
        textAnchor="middle" fontSize={13}
        fontWeight={node.isRoot ? '800' : '600'}
        fill={COLORS.text}>
        {name}
      </SvgText>
      {node.subtitle ? (
        <SvgText x={node.x} y={node.y + 15} textAnchor="middle" fontSize={10} fill={COLORS.textMuted}>
          {node.subtitle}
        </SvgText>
      ) : null}
    </G>
  );
}

// SVG's own touch hit-testing is unreliable once an ancestor View has a
// `transform` on it (needed here for zoom) and inside nested ScrollViews --
// taps can silently stop registering. Draw nodes in the Svg for visuals only
// and overlay real RN touchables at the same coordinates for interaction.
function NodeTouchOverlay({nodes, onPress}) {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {nodes.map(n => (
        <TouchableOpacity
          key={n.id}
          onPress={() => onPress(n)}
          activeOpacity={0.6}
          style={{
            position: 'absolute',
            left: n.x - NODE_W / 2,
            top: n.y - NODE_H / 2,
            width: NODE_W,
            height: NODE_H,
          }}
        />
      ))}
    </View>
  );
}

export default function FamilyTreeScreen({route, navigation}) {
  const [currentId, setCurrentId] = useState(route.params.memberId);
  const [history, setHistory] = useState([]);
  const [chart, setChart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    setLoading(true);
    membersApi.chart(currentId)
      .then(setChart)
      .catch(e => Alert.alert('Error', e.message))
      .finally(() => setLoading(false));
  }, [currentId]);

  const drillTo = useCallback(id => {
    if (id === currentId) return;
    setHistory(h => [...h, currentId]);
    setCurrentId(id);
    setZoom(1);
  }, [currentId]);

  const goBack = () => {
    setHistory(h => {
      if (!h.length) return h;
      const next = h.slice(0, -1);
      setCurrentId(h[h.length - 1]);
      return next;
    });
  };

  const onNode = node => {
    if (node.isRoot) {
      navigation.push('MemberDetail', {memberId: node.id});
    } else {
      drillTo(node.id);
    }
  };

  if (loading) return <LoadingSpinner fullScreen message="Building family chart…" />;
  if (!chart) return null;

  const {nodes, marriageEdges, descentEdges, width, height, count} = layoutChart(chart);
  const noFamily = count <= 1;

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        {history.length ? (
          <TouchableOpacity style={styles.backBtn} onPress={goBack} activeOpacity={0.75}>
            <Icon name="chevron-back" size={18} color={COLORS.primary} />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
        ) : null}
        <View style={styles.legendRow}>
          <Legend color={COLORS.primaryLight} border={COLORS.primary} label="Viewing" />
          <Legend color={COLORS.white} border={COLORS.secondary} label="Spouse" />
          <Legend color={COLORS.white} border={COLORS.border} label="Child" />
        </View>
        <Text style={styles.hint}>Tap a card to open their household · tap the highlighted card for their profile</Text>
      </View>

      {noFamily ? (
        <EmptyState
          icon="git-branch-outline"
          title="No spouses or children recorded yet"
          subtitle="Add a marriage or children to this person to grow the chart."
        />
      ) : (
        <>
          <ScrollView horizontal>
            <ScrollView>
              <View style={{
                width: Math.max(width, SCREEN_W) * zoom,
                height: height * zoom,
              }}>
                <View style={{transform: [{scale: zoom}], transformOrigin: 'top left'}}>
                  <Svg width={Math.max(width, SCREEN_W)} height={height}>
                    {marriageEdges.map((e, i) => (
                      <Line key={`m${i}`} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                        stroke={COLORS.secondary} strokeWidth={2.5} />
                    ))}
                    {descentEdges.map((e, i) => (
                      <Line key={`d${i}`} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                        stroke={COLORS.border} strokeWidth={1.5} />
                    ))}
                    {nodes.map(n => (
                      <TreeNode key={n.id} node={n} />
                    ))}
                  </Svg>
                  <NodeTouchOverlay nodes={nodes} onPress={onNode} />
                </View>
              </View>
            </ScrollView>
          </ScrollView>

          <View style={styles.zoomControls}>
            <TouchableOpacity
              style={styles.zoomBtn}
              onPress={() => setZoom(z => Math.max(ZOOM_MIN, +(z - ZOOM_STEP).toFixed(2)))}
              activeOpacity={0.8}>
              <Icon name="remove" size={20} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.zoomLabel}>{Math.round(zoom * 100)}%</Text>
            <TouchableOpacity
              style={styles.zoomBtn}
              onPress={() => setZoom(z => Math.min(ZOOM_MAX, +(z + ZOOM_STEP).toFixed(2)))}
              activeOpacity={0.8}>
              <Icon name="add" size={20} color={COLORS.text} />
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

function Legend({color, border, label}) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, {backgroundColor: color, borderColor: border}]} />
      <Text style={styles.legendText} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {flex: 1, backgroundColor: COLORS.background},
  topBar: {
    padding: SPACING.sm,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  backBtn: {
    flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start',
    marginBottom: SPACING.xs,
  },
  backText: {color: COLORS.primary, fontWeight: FONTS.weights.semibold, fontSize: FONTS.sizes.sm},
  legendRow: {flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.base},
  legendItem: {flexDirection: 'row', alignItems: 'center', gap: 4, maxWidth: 150},
  dot: {width: 10, height: 10, borderRadius: 5, borderWidth: 1.5},
  legendText: {fontSize: FONTS.sizes.xs, color: COLORS.textMuted},
  hint: {fontSize: FONTS.sizes.xs, color: COLORS.textLight, marginTop: SPACING.xs},
  zoomControls: {
    position: 'absolute', right: SPACING.base, bottom: SPACING.base,
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.white, borderRadius: RADIUS.full,
    paddingHorizontal: SPACING.xs, paddingVertical: SPACING.xs,
    ...SHADOWS.md,
  },
  zoomBtn: {
    width: 32, height: 32, borderRadius: RADIUS.full,
    alignItems: 'center', justifyContent: 'center',
  },
  zoomLabel: {
    fontSize: FONTS.sizes.xs, fontWeight: FONTS.weights.semibold,
    color: COLORS.textMuted, marginHorizontal: SPACING.xs, minWidth: 36, textAlign: 'center',
  },
});
