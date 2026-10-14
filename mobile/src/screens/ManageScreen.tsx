import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import {
  ConfirmDialog,
  EmptyState,
  Field,
  PrimaryButton,
  ScreenHeader,
  SegmentedControl,
  colors,
} from "@/components";
import type { InventoryApi } from "@/lib/api";
import type { InventoryData, Item, Location } from "@/types";

type Kind = "item" | "location";
type RecordRow = Item | Location;

// Creates, edits, and removes catalog items and storage locations.
export function ManageScreen({
  data,
  api,
  runAction,
}: {
  data: InventoryData;
  api: InventoryApi;
  runAction: (action: () => Promise<unknown>, message: string) => Promise<boolean>;
}) {
  const [kind, setKind] = useState<Kind>("item");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<RecordRow | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [barcode, setBarcode] = useState("");
  const [deleting, setDeleting] = useState<RecordRow | null>(null);
  const rows = kind === "item" ? data.items : data.locations;

  // Opens the editor with either a new blank record or an existing record.
  const open = (row?: RecordRow) => {
    setEditorOpen(true);
    setEditing(row || null);
    setName(row?.name || "");
    setDescription(row?.description || "");
    setBarcode((row as Item)?.barcode || "");
  };

  // Sends the appropriate create or update request for the selected record type.
  const save = async () => {
    if (!name.trim()) return;
    const success = await runAction(
      () =>
        kind === "item"
          ? editing
            ? api.updateItem(editing.id, { name, description, barcode })
            : api.createItem({ name, description, barcode })
          : editing
            ? api.updateLocation(editing.id, { name, description })
            : api.createLocation({ name, description }),
      editing ? "Record updated." : "Record created.",
    );

    if (success) {
      setEditorOpen(false);
      setEditing(null);
    }
  };

  // Deletes the selected record after the confirmation dialog is accepted.
  const remove = async () => {
    if (!deleting) return;
    const success = await runAction(
      () => kind === "item" ? api.removeItem(deleting.id) : api.removeLocation(deleting.id),
      "Record removed.",
    );
    if (success) setDeleting(null);
  };

  return (
    <>
      <ScreenHeader
        eyebrow="Manage / Catalog"
        title="Catalog"
        action={<PrimaryButton label="Add" onPress={() => open()} compact />}
      />
      <SegmentedControl
        options={[{ value: "item", label: "Items" }, { value: "location", label: "Locations" }]}
        value={kind}
        onChange={setKind}
      />
      <View style={styles.list}>
        {rows.map((row) => (
          <View key={row.id} style={styles.card}>
            <View style={styles.copy}>
              <Text style={styles.name}>{row.name}</Text>
              <Text style={styles.description}>{row.description || "No description"}</Text>
            </View>
            <View style={styles.actions}>
              <Pressable onPress={() => open(row)}><Text style={styles.edit}>Edit</Text></Pressable>
              <Pressable onPress={() => setDeleting(row)}><Text style={styles.remove}>Remove</Text></Pressable>
            </View>
          </View>
        ))}
        {!rows.length ? <EmptyState message={`No ${kind === "item" ? "items" : "locations"} yet.`} /> : null}
      </View>

      {editorOpen ? (
        <View style={styles.editor}>
          <Text style={styles.editorTitle}>{editing ? "Edit record" : "Add record"}</Text>
          <Field label="Name" value={name} onChangeText={setName} />
          <Field label="Description" value={description} onChangeText={setDescription} multiline />
          {kind === "item" ? <Field label="Barcode" value={barcode} onChangeText={setBarcode} autoCapitalize="none" /> : null}
          <PrimaryButton label="Save" onPress={save} />
          <PrimaryButton label="Cancel" onPress={() => { setEditorOpen(false); setEditing(null); }} />
        </View>
      ) : null}
      <ConfirmDialog
        visible={!!deleting}
        title={deleting ? `Remove ${deleting.name}?` : "Remove record"}
        message="This action cannot be undone."
        onCancel={() => setDeleting(null)}
        onConfirm={remove}
      />
    </>
  );
}

const styles = StyleSheet.create({
  list: { 
    gap: 10, 
    marginTop: 17 
  },
  card: { 
    backgroundColor: colors.panel, 
    borderRadius: 17, 
    borderWidth: 1, 
    borderColor: "#E4EEEE", 
    padding: 16, 
    flexDirection: "row", 
    gap: 12 
  },
  copy: { 
    flex: 1 
  },
  name: { 
    color: colors.ink, 
    fontSize: 16, 
    fontWeight: "800" 
  },
  description: { 
    color: colors.inkMuted, 
    fontSize: 13, 
    marginTop: 4 
  },
  actions: { 
    flexDirection: "row", 
    gap: 11 
  },
  edit: { 
    color: colors.cyanDeep, 
    fontWeight: "800" 
  },
  remove: { 
    color: colors.danger, 
    fontWeight: "800" 
  },
  editor: { 
    marginTop: 18, 
    backgroundColor: colors.panel, 
    borderRadius: 18, 
    padding: 16, 
    gap: 14 
  },
  editorTitle: { 
    color: colors.ink, 
    fontSize: 20, 
    fontWeight: "800" 
  },
});
