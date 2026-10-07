import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { EmptyState, Field, PrimaryButton, ScreenHeader, colors } from "@/components";
import type { InventoryData, Stock } from "@/types";

// Lets users search current stock positions and jump to movement entry.
export function StockScreen({ data, onMove }: { data: InventoryData; onMove: () => void }) {
  const [query, setQuery] = useState("");
  const stocks = useMemo(
    () =>
      data.stocks.filter((stock) =>
        [stock.item?.name, stock.item?.barcode, stock.location?.name].some((value) =>
          value?.toLowerCase().includes(query.trim().toLowerCase()),
        ),
      ),
    [data.stocks, query],
  );

  return (
    <>
      <ScreenHeader
        eyebrow="Operations / Stock ledger"
        title="Stock ledger"
        action={<PrimaryButton label="Move stock" onPress={onMove} compact />}
      />
      <Text style={styles.copy}>Search current quantities by item, barcode, or location.</Text>
      <Field
        label="Search stock"
        value={query}
        onChangeText={setQuery}
        placeholder="Item, barcode, or location"
        autoCapitalize="none"
      />
      <View style={styles.list}>
        {stocks.map((stock) => <StockCard key={stock.id} stock={stock} />)}
        {!stocks.length ? (
          <EmptyState message={query ? "No stock matches your search." : "No stock positions yet."} />
        ) : null}
      </View>
    </>
  );
}

// Displays an item's quantity together with its location and barcode metadata.
function StockCard({ stock }: { stock: Stock }) {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{stock.item?.name || `Item #${stock.itemId}`}</Text>
          <Text style={styles.description}>{stock.item?.description || "No description"}</Text>
        </View>
        <Text style={styles.quantity}>{stock.quantity.toLocaleString()}</Text>
      </View>
      <Text style={styles.meta}>
        {stock.location?.name || "Unknown location"} · {stock.item?.barcode || "No barcode"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  copy: { 
    color: colors.inkMuted, 
    fontSize: 15, 
    lineHeight: 21, 
    marginBottom: 16 
  },
  list: { 
    gap: 10, 
    marginTop: 17 
  },
  card: { 
    backgroundColor: colors.panel, 
    borderRadius: 17, 
    padding: 16, 
    borderWidth: 1, 
    borderColor: "#E4EEEE", 
    gap: 13 
  },
  row: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    gap: 14 
  },
  name: { 
    color: colors.ink, 
    fontSize: 17, 
    fontWeight: "800" 
  },
  description: { 
    color: colors.inkMuted, 
    fontSize: 13, 
    marginTop: 3 
  },
  quantity: { 
    color: colors.ink, 
    fontSize: 21, 
    fontWeight: "900" 
  },
  meta: { 
    color: colors.muted, 
    fontSize: 12 
  },
});
