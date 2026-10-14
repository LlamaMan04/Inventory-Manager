import { StyleSheet, Text, View } from "react-native";
import { ScreenHeader, colors } from "@/components";
import type { InventoryData } from "@/types";

// Summarizes the current inventory into high-level operational metrics.
export function OverviewScreen({ data }: { data: InventoryData }) {
  const units = data.stocks.reduce((sum, stock) => sum + stock.quantity, 0);

  return (
    <>
      <ScreenHeader eyebrow="Operations / Overview" title="Good morning" />
      <Text style={styles.copy}>Your inventory snapshot, ready for the next move.</Text>
      <View style={styles.grid}>
        <Metric
          label="Units on hand"
          value={units.toLocaleString()}
          detail={`${data.stocks.length} stock positions`}
        />
        <Metric
          label="Catalog items"
          value={data.items.length.toLocaleString()}
          detail="Active item records"
        />
        <Metric
          label="Locations"
          value={data.locations.length.toLocaleString()}
          detail="Storage destinations"
        />
      </View>
    </>
  );
}

// Renders one reusable metric card on the overview screen.
function Metric({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.detail}>{detail}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  copy: { color: colors.inkMuted, fontSize: 15, lineHeight: 21, marginBottom: 18 },
  grid: { gap: 11 },
  card: { backgroundColor: colors.panel, borderRadius: 17, padding: 19, borderWidth: 1, borderColor: "#E4EEEE" },
  label: { color: colors.inkMuted, fontSize: 14, fontWeight: "700" },
  value: { color: colors.ink, fontSize: 38, fontWeight: "800", marginTop: 8 },
  detail: { color: colors.muted, fontSize: 13, marginTop: 4 },
});
