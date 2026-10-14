import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import {
  ChoiceSheet,
  colors,
  EmptyState,
  Field,
  PrimaryButton,
  ScreenHeader,
  SegmentedControl,
  SelectField,
  SecondaryButton,
} from "@/components";
import type { InventoryData, MovementType, PendingMove } from "@/types";

type Picker = "item" | "from" | "to" | null;

// Stages receive, ship, and transfer operations before final submission.
export function MoveScreen({
  data,
  pending,
  setPending,
  onFinalize,
  onError,
}: {
  data: InventoryData;
  pending: PendingMove[];
  setPending: (moves: PendingMove[]) => void;
  onFinalize: () => Promise<boolean>;
  onError: (message: string) => void;
}) {
  const [type, setType] = useState<MovementType>("receive");
  const [itemId, setItemId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [quantity, setQuantity] = useState("");
  const [picker, setPicker] = useState<Picker>(null);
  const [saving, setSaving] = useState(false);

  // Validates the movement form and appends a staged operation.
  const addMove = () => {
    const item = Number(itemId);
    const amount = Number(quantity);

    if (!item) 
      return onError("Select an item.");
    if (!Number.isInteger(amount) || amount < 1) {
      return onError("Enter a whole quantity of at least 1.");
    }
    if (type !== "receive" && !from) 
      return onError("Select a source location.");
    if (type !== "ship" && !to) 
      return onError("Select a destination location.");

    setPending([
      ...pending,
      {
        type,
        itemId: item,
        quantity: amount,
        ...(type !== "receive" ? { from: Number(from) } : {}),
        ...(type !== "ship" ? { to: Number(to) } : {}),
      },
    ]);
    setQuantity("");
  };

  // Applies the selected item or location to the appropriate form field.
  const select = (id: number) => {
    if (picker === "item") setItemId(String(id));
    if (picker === "from") setFrom(String(id));
    if (picker === "to") setTo(String(id));
    setPicker(null);
  };

  const choices = picker === "item"
    ? data.items.map((item) => ({ id: item.id, label: item.name, detail: item.barcode || undefined }))
    : data.locations.map((location) => ({ id: location.id, label: location.name, detail: location.description || undefined }));

  return (
    <>
      <ScreenHeader eyebrow="Operations / Movement" title="Move stock" />
      <View style={styles.panel}>
        <SegmentedControl
          options={[
            { value: "receive", label: "Receive" },
            { value: "ship", label: "Ship" },
            { value: "transfer", label: "Transfer" },
          ]}
          value={type}
          onChange={setType}
        />
        <SelectField
          label="Item"
          value={data.items.find((item) => item.id === Number(itemId))?.name}
          placeholder="Select an item"
          onPress={() => setPicker("item")}
        />
        {type !== "receive" ? (
          <SelectField
            label="From location"
            value={data.locations.find((location) => location.id === Number(from))?.name}
            placeholder="Select source"
            onPress={() => setPicker("from")}
          />
        ) : null}
        {type !== "ship" ? (
          <SelectField
            label="To location"
            value={data.locations.find((location) => location.id === Number(to))?.name}
            placeholder="Select destination"
            onPress={() => setPicker("to")}
          />
        ) : null}
        <Field label="Quantity" value={quantity} onChangeText={setQuantity} placeholder="0" keyboardType="number-pad" />
        <PrimaryButton label="Add to pending moves" onPress={addMove} />
      </View>

      <View style={styles.pendingHeader}>
        <Text style={styles.heading}>{pending.length} staged</Text>
        {pending.length ? <SecondaryButton label="Clear" onPress={() => setPending([])} compact /> : null}
      </View>
      <View style={styles.list}>
        {pending.map((move, index) => (
          <View key={`${move.itemId}-${index}`} style={styles.card}>
            <Text style={styles.name}>{data.items.find((item) => item.id === move.itemId)?.name || `Item #${move.itemId}`}</Text>
            <Text style={styles.meta}>{move.type} · {move.quantity} units</Text>
          </View>
        ))}
        {!pending.length ? <EmptyState message="No movements staged yet." /> : null}
      </View>
      {pending.length ? (
        <PrimaryButton
          label="Finalize all moves"
          loading={saving}
          onPress={async () => { setSaving(true); await onFinalize(); setSaving(false); }}
        />
      ) : null}
      <ChoiceSheet
        visible={picker !== null}
        title={picker === "item" ? "Select item" : "Select location"}
        choices={choices}
        onSelect={select}
        onClose={() => setPicker(null)}
      />
    </>
  );
}

const styles = StyleSheet.create({
  panel: { 
    backgroundColor: colors.panel, 
    borderWidth: 1, 
    borderColor: "#E4EEEE", 
    borderRadius: 18, 
    padding: 15, 
    gap: 15 
  },
  pendingHeader: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginTop: 25 
  },
  heading: { 
    color: colors.ink, 
    fontSize: 18, 
    fontWeight: "800" 
  },
  list: { 
    gap: 10, 
    marginTop: 17 
  },
  card: { 
    backgroundColor: colors.panel, 
    borderRadius: 17, 
    padding: 15, 
    borderWidth: 1, 
    borderColor: "#E4EEEE" 
  },
  name: { 
    color: colors.ink, 
    fontSize: 16, 
    fontWeight: "800" 
  },
  meta: { 
    color: colors.muted, 
    fontSize: 13, 
    marginTop: 4 
  },
});
