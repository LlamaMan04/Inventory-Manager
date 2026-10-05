import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { InventoryApi, normalizeApiUrl } from "@/lib/api";
import { storage } from "@/lib/storage";
import type { InventoryData, Item, Location, MovementType, PendingMove, Stock, User, UserRole } from "@/types";
import { emptyInventoryData } from "@/types";
import {
  ChoiceSheet,
  colors,
  ConfirmDialog,
  EmptyState,
  Field,
  PrimaryButton,
  ScreenHeader,
  SecondaryButton,
  SegmentedControl,
  SelectField,
  Toast,
} from "@/components/ui";

type Tab = "overview" | "stock" | "move" | "manage" | "more";
type ManageType = "item" | "location";
type EditorKind = ManageType | "account";
type EditorRecord = { kind: EditorKind; id?: number; values?: Record<string, string> } | null;

const defaultApiUrl = "http://server.address:PORT";

function errorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Something went wrong.";
}

function formatQuantity(quantity: number) {
  return quantity.toLocaleString();
}

function AppHeader({ onSignOut }: { onSignOut: () => void }) {
  return (
    <View style={styles.appHeader}>
      <View style={styles.brandRow}>
        <View style={styles.brandMark}><Text style={styles.brandMarkText}>N</Text></View>
        <View>
          <Text style={styles.brandName}>Northstar</Text>
          <Text style={styles.brandTagline}>Inventory control</Text>
        </View>
      </View>
      <Pressable 
        accessibilityRole="button" 
        onPress={onSignOut} 
        style={({ pressed }) => [styles.signOut, pressed && styles.pressed]}
      >
        <Text style={styles.signOutText}>Sign out</Text>
      </Pressable>
    </View>
  );
}

function BottomTabs({ active, onChange, isAdmin }: { active: Tab; onChange: (tab: Tab) => void; isAdmin: boolean }) {
  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Home", icon: "⌂" },
    { id: "stock", label: "Stock", icon: "▤" },
    { id: "move", label: "Move", icon: "⇄" },
    { id: "manage", label: "Manage", icon: "⊞" },
    { id: "more", label: isAdmin ? "Admin" : "More", icon: "•••" },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const selected = tab.id === active;
        return (
          <Pressable key={tab.id} accessibilityRole="tab" accessibilityState={{ selected }} onPress={() => onChange(tab.id)} style={({ pressed }) => [styles.tab, selected && styles.activeTab, pressed && styles.pressed]}>
            <Text style={[styles.tabIcon, selected && styles.activeTabText]}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, selected && styles.activeTabText]}>{tab.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function AppScreen({ children, refreshing, onRefresh, error, notice }: { children: React.ReactNode; refreshing: boolean; onRefresh: () => void; error?: string; notice?: string }) {
  return (
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.screenContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.ink} />}
      keyboardShouldPersistTaps="handled"
    >
      <Toast message={notice} />
      <Toast message={error} type="error" />
      {children}
    </ScrollView>
  );
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricDetail}>{detail}</Text>
    </View>
  );
}

function OverviewScreen({ data }: { data: InventoryData }) {
  const units = data.stocks.reduce((sum, stock) => sum + stock.quantity, 0);
  return (
    <>
      <ScreenHeader eyebrow="Operations / Overview" title="Good morning" />
      <View style={styles.overviewIntro}>
        <Text style={styles.overviewCopy}>Your inventory snapshot, ready for the next move.</Text>
        <View style={styles.connectedPill}><View style={styles.connectionDot} /><Text style={styles.connectedText}>Connected</Text></View>
      </View>
      <View style={styles.metricGrid}>
        <MetricCard label="Units on hand" value={formatQuantity(units)} detail={`${data.stocks.length} stock positions`} />
        <MetricCard label="Catalog items" value={formatQuantity(data.items.length)} detail="Active item records" />
        <MetricCard label="Locations" value={formatQuantity(data.locations.length)} detail="Storage destinations" />
      </View>
    </>
  );
}

function StockScreen({ data, onMove }: { data: InventoryData; onMove: () => void }) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"item" | "location" | "quantity">("item");

  const stocks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return data.stocks
      .filter((stock) => {
        if (!normalizedQuery) return true;
        return [stock.item?.name, stock.item?.barcode, stock.location?.name, stock.item?.description]
          .some((value) => value?.toLowerCase().includes(normalizedQuery));
      })
      .sort((a, b) => {
        if (sortBy === "quantity") return b.quantity - a.quantity;
        const first = sortBy === "item" ? a.item?.name : a.location?.name;
        const second = sortBy === "item" ? b.item?.name : b.location?.name;
        return (first || "").localeCompare(second || "", undefined, { numeric: true, sensitivity: "base" });
      });
  }, [data.stocks, query, sortBy]);

  return (
    <>
      <ScreenHeader eyebrow="Operations / Stock ledger" title="Stock ledger" action={<PrimaryButton label="Move stock" onPress={onMove} compact />} />
      <Text style={styles.sectionCopy}>Search current quantities by item, barcode, or location.</Text>
      <Field label="Search stock" value={query} onChangeText={setQuery} placeholder="Item, barcode, or location" autoCapitalize="none" />
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort by</Text>
        <View style={styles.sortOptions}>
          {(["item", "location", "quantity"] as const).map((option) => (
            <Pressable key={option} onPress={() => setSortBy(option)} style={({ pressed }) => [styles.sortChip, sortBy === option && styles.sortChipActive, pressed && styles.pressed]}>
              <Text style={[styles.sortChipText, sortBy === option && styles.sortChipTextActive]}>{option}</Text>
            </Pressable>
          ))}
        </View>
      </View>
      <View style={styles.cardList}>
        {stocks.map((stock) => <StockCard key={stock.id} stock={stock} />)}
        {!stocks.length && <EmptyState message={query ? "No stock matches your search." : "No stock positions yet."} />}
      </View>
    </>
  );
}

function StockCard({ stock }: { stock: Stock }) {
  return (
    <View style={styles.stockCard}>
      <View style={styles.stockTitleRow}>
        <View style={styles.stockTitle}>
          <Text style={styles.stockName}>{stock.item?.name || `Item #${stock.itemId}`}</Text>
          <Text style={styles.stockDescription}>{stock.item?.description || "No description"}</Text>
        </View>
        <View style={styles.quantityBadge}><Text style={styles.quantityText}>{formatQuantity(stock.quantity)}</Text><Text style={styles.quantityLabel}>units</Text></View>
      </View>
      <View style={styles.stockMeta}>
        <Text style={styles.stockMetaText}>⌖ {stock.location?.name || "Unknown location"}</Text>
        <Text style={styles.stockMetaText}>▦ {stock.item?.barcode || "No barcode"}</Text>
      </View>
    </View>
  );
}

function MoveScreen({ data, pending, setPending, onFinalize, onError }: { data: InventoryData; pending: PendingMove[]; setPending: (moves: PendingMove[]) => void; onFinalize: () => Promise<boolean>; onError: (message: string) => void }) {
  const [type, setType] = useState<MovementType>("receive");
  const [form, setForm] = useState({ itemId: "", barcode: "", from: "", to: "", quantity: "" });
  const [picker, setPicker] = useState<"item" | "from" | "to" | null>(null);
  const [finalizing, setFinalizing] = useState(false);

  const selectedItem = data.items.find((item) => item.id === Number(form.itemId));
  const selectedFrom = data.locations.find((location) => location.id === Number(form.from));
  const selectedTo = data.locations.find((location) => location.id === Number(form.to));

  const projectedQuantity = (itemId: number, locationId: number) => {
    const current = data.stocks.find((stock) => stock.itemId === itemId && stock.locationId === locationId)?.quantity || 0;
    return pending.reduce((quantity, move) => {
      if (move.itemId !== itemId) return quantity;
      if (move.type !== "receive" && move.from === locationId) return quantity - move.quantity;
      if (move.type !== "ship" && move.to === locationId) return quantity + move.quantity;
      return quantity;
    }, current);
  };

  const updateBarcode = (barcode: string) => {
    const matchedItem = data.items.find((item) => item.barcode === barcode.trim());
    setForm((current) => ({ ...current, barcode, itemId: matchedItem ? String(matchedItem.id) : barcode.trim() ? "" : current.itemId }));
  };

  const addMove = () => {
    const itemId = Number(form.itemId);
    const quantity = Number(form.quantity);
    const from = Number(form.from);
    const to = Number(form.to);
    if (!itemId) return onError("Select an item or enter a valid barcode.");
    if (!Number.isInteger(quantity) || quantity < 1) return onError("Enter a whole quantity of at least 1.");
    if (type !== "receive" && !from) return onError("Select a source location.");
    if (type !== "ship" && !to) return onError("Select a destination location.");
    if (type !== "receive" && projectedQuantity(itemId, from) < quantity) return onError("Not enough stock at the source location.");

    setPending([...pending, { type, itemId, quantity, ...(type !== "receive" ? { from } : {}), ...(type !== "ship" ? { to } : {}) }]);
    setForm((current) => ({ ...current, quantity: "" }));
  };

  const finalize = async () => {
    setFinalizing(true);
    await onFinalize();
    setFinalizing(false);
  };

  const choices = picker === "item"
    ? data.items.map((item) => ({ id: item.id, label: item.name, detail: item.barcode || item.description || undefined }))
    : data.locations.map((location) => ({ id: location.id, label: location.name, detail: location.description || undefined }));

  const selectChoice = (id: number) => {
    if (picker === "item") setForm((current) => ({ ...current, itemId: String(id), barcode: data.items.find((item) => item.id === id)?.barcode || "" }));
    if (picker === "from") setForm((current) => ({ ...current, from: String(id) }));
    if (picker === "to") setForm((current) => ({ ...current, to: String(id) }));
    setPicker(null);
  };

  return (
    <>
      <ScreenHeader eyebrow="Operations / Movement" title="Move stock" />
      <View style={styles.formPanel}>
        <SegmentedControl options={[{ value: "receive", label: "Receive" }, { value: "ship", label: "Ship" }, { value: "transfer", label: "Transfer" }]} value={type} onChange={setType} />
        <SelectField label="Item" value={selectedItem?.name} placeholder="Select an item" onPress={() => setPicker("item")} />
        <Field label="Barcode" value={form.barcode} onChangeText={updateBarcode} placeholder="Type or scan a barcode" autoCapitalize="none" />
        {type !== "receive" ? <SelectField label="From location" value={selectedFrom?.name} placeholder="Select source" onPress={() => setPicker("from")} /> : null}
        {type !== "ship" ? <SelectField label="To location" value={selectedTo?.name} placeholder="Select destination" onPress={() => setPicker("to")} /> : null}
        <Field label="Quantity" value={form.quantity} onChangeText={(quantity) => setForm((current) => ({ ...current, quantity }))} placeholder="0" keyboardType="number-pad" autoCapitalize="none" />
        <PrimaryButton label="Add to pending moves" onPress={addMove} />
      </View>
      <View style={styles.pendingHeader}>
        <View><Text style={styles.eyebrow}>Pending moves</Text><Text style={styles.pendingCount}>{pending.length} staged</Text></View>
        {pending.length ? <SecondaryButton label="Clear" onPress={() => setPending([])} compact /> : null}
      </View>
      <View style={styles.cardList}>
        {pending.map((move, index) => <PendingCard key={`${move.itemId}-${index}`} move={move} data={data} onRemove={() => setPending(pending.filter((_, moveIndex) => moveIndex !== index))} />)}
        {!pending.length ? <EmptyState message="No movements staged yet." /> : null}
      </View>
      {pending.length ? <PrimaryButton label="Finalize all moves" onPress={finalize} loading={finalizing} style={styles.finalizeButton} /> : null}
      <ChoiceSheet visible={picker !== null} title={picker === "item" ? "Select item" : "Select location"} choices={choices} onSelect={selectChoice} onClose={() => setPicker(null)} />
    </>
  );
}

function PendingCard({ move, data, onRemove }: { move: PendingMove; data: InventoryData; onRemove: () => void }) {
  const item = data.items.find((candidate) => candidate.id === move.itemId);
  const from = data.locations.find((location) => location.id === move.from);
  const to = data.locations.find((location) => location.id === move.to);
  return (
    <View style={styles.pendingCard}>
      <View style={styles.pendingTop}><View><Text style={styles.pendingItem}>{item?.name || `Item #${move.itemId}`}</Text><Text style={styles.pendingType}>{move.type}</Text></View><Pressable onPress={onRemove} hitSlop={10}><Text style={styles.removeText}>Remove</Text></Pressable></View>
      <View style={styles.pendingRoute}><Text style={styles.routeText}>{from?.name || "External"}</Text><Text style={styles.routeArrow}>→</Text><Text style={styles.routeText}>{to?.name || "External"}</Text><Text style={styles.pendingQty}>{formatQuantity(move.quantity)}</Text></View>
    </View>
  );
}

function ManageScreen({ data, api, runAction }: { data: InventoryData; api: InventoryApi; runAction: (action: () => Promise<unknown>, notice: string) => Promise<boolean> }) {
  const [type, setType] = useState<ManageType>("item");
  const [editor, setEditor] = useState<EditorRecord>(null);
  const [deleting, setDeleting] = useState<{ type: ManageType; id: number; name: string } | null>(null);
  const rows = type === "item" ? data.items : data.locations;

  const saveRecord = async (values: Record<string, string>) => {
    if (!editor) return;
    const success = await runAction(async () => {
      if (editor.kind === "item") {
        const payload = { name: values.name.trim(), description: values.description.trim(), barcode: values.barcode.trim() };
        return editor.id ? api.updateItem(editor.id, payload) : api.createItem(payload);
      }
      const payload = { name: values.name.trim(), description: values.description.trim() };
      return editor.id ? api.updateLocation(editor.id, payload) : api.createLocation(payload);
    }, editor.id ? "Record updated." : "Record created.");
    if (success) setEditor(null);
  };

  const confirmDelete = async () => {
    if (!deleting) return;
    const success = await runAction(
      () => deleting.type === "item" ? api.removeItem(deleting.id) : api.removeLocation(deleting.id),
      "Record removed.",
    );
    if (success) setDeleting(null);
  };

  return (
    <>
      <ScreenHeader eyebrow="Manage / Catalog" title="Catalog" action={<PrimaryButton label="Add" onPress={() => setEditor({ kind: type })} compact />} />
      <SegmentedControl options={[{ value: "item", label: "Items" }, { value: "location", label: "Locations" }]} value={type} onChange={setType} />
      <View style={styles.cardList}>
        {rows.map((row) => <ManageCard key={row.id} row={row} type={type} onEdit={() => setEditor({ kind: type, id: row.id, values: type === "item" ? { name: row.name, description: row.description || "", barcode: (row as Item).barcode || "" } : { name: row.name, description: row.description || "" } })} onRemove={() => setDeleting({ type, id: row.id, name: row.name })} />)}
        {!rows.length ? <EmptyState message={`No ${type === "item" ? "items" : "locations"} yet.`} /> : null}
      </View>
      <RecordEditor key={editor ? `${editor.kind}-${editor.id ?? "new"}` : "closed"} record={editor} onClose={() => setEditor(null)} onSave={saveRecord} />
      <ConfirmDialog visible={!!deleting} title={deleting ? `Remove ${deleting.name}?` : "Remove record"} message="This action cannot be undone." onCancel={() => setDeleting(null)} onConfirm={confirmDelete} />
    </>
  );
}

function ManageCard({ row, type, onEdit, onRemove }: { row: Item | Location; type: ManageType; onEdit: () => void; onRemove: () => void }) {
  const barcode = type === "item" ? (row as Item).barcode : undefined;
  return (
    <View style={styles.manageCard}>
      <View style={styles.manageCopy}><Text style={styles.manageName}>{row.name}</Text><Text style={styles.manageDescription}>{row.description || "No description"}</Text>{barcode ? <Text style={styles.manageBarcode}>▦ {barcode}</Text> : null}</View>
      <View style={styles.manageActions}><Pressable onPress={onEdit} style={({ pressed }) => [styles.textAction, pressed && styles.pressed]}><Text style={styles.editText}>Edit</Text></Pressable><Pressable onPress={onRemove} style={({ pressed }) => [styles.textAction, pressed && styles.pressed]}><Text style={styles.deleteText}>Remove</Text></Pressable></View>
    </View>
  );
}

function MoreScreen({ user, api, data, setData, runAction, onSignOut }: { user: User; api: InventoryApi; data: InventoryData; setData: (setter: (current: InventoryData) => InventoryData) => void; runAction: (action: () => Promise<unknown>, notice: string) => Promise<boolean>; onSignOut: () => void }) {
  const [section, setSection] = useState<"home" | "accounts" | "password">("home");
  if (section === "accounts") return <AccountsScreen api={api} users={data.users} setData={setData} runAction={runAction} onBack={() => setSection("home")} />;
  if (section === "password") return <PasswordScreen api={api} runAction={runAction} onBack={() => setSection("home")} />;

  return (
    <>
      <ScreenHeader eyebrow="Account" title="More" />
      <View style={styles.profileCard}><View style={styles.avatar}><Text style={styles.avatarText}>{user.username.slice(0, 1).toUpperCase()}</Text></View><View><Text style={styles.profileName}>{user.username}</Text><Text style={styles.profileRole}>{user.role === "ADMIN" ? "Administrator" : "Team member"}</Text></View></View>
      <View style={styles.menuList}>
        <MenuRow label="Change password" detail="Update your account security" icon="⌘" onPress={() => setSection("password")} />
        {user.role === "ADMIN" ? <MenuRow label="Accounts" detail="Create and manage team access" icon="♙" onPress={() => setSection("accounts")} /> : null}
        <MenuRow label="Sign out" detail="Disconnect this device" icon="↪" onPress={onSignOut} destructive />
      </View>
    </>
  );
}

function MenuRow({ label, detail, icon, onPress, destructive }: { label: string; detail: string; icon: string; onPress: () => void; destructive?: boolean }) {
  return <Pressable onPress={onPress} style={({ pressed }) => [styles.menuRow, pressed && styles.pressed]}><Text style={[styles.menuIcon, destructive && styles.deleteText]}>{icon}</Text><View style={styles.menuCopy}><Text style={[styles.menuLabel, destructive && styles.deleteText]}>{label}</Text><Text style={styles.menuDetail}>{detail}</Text></View><Text style={[styles.menuArrow, destructive && styles.deleteText]}>›</Text></Pressable>;
}

function AccountsScreen({ api, users, setData, runAction, onBack }: { api: InventoryApi; users: User[]; setData: (setter: (current: InventoryData) => InventoryData) => void; runAction: (action: () => Promise<unknown>, notice: string) => Promise<boolean>; onBack: () => void }) {
  const [editor, setEditor] = useState<EditorRecord>(null);
  const [deleting, setDeleting] = useState<User | null>(null);
  const loadUsers = useCallback(async () => {
    try {
      const response = await api.users();
      setData((current) => ({ ...current, users: response.data.users }));
    } catch {
      // The parent error banner is reserved for user-initiated operations.
    }
  }, [api, setData]);

  useEffect(() => { void loadUsers(); }, [loadUsers]);

  const save = async (values: Record<string, string>) => {
    if (!editor) return;
    if (!editor.id && values.password !== values.confirmPassword) return;
    const success = await runAction(
      () => editor.id ? api.updateUser(editor.id, values.role as UserRole) : api.register({ username: values.username.trim(), password: values.password, role: values.role as UserRole }),
      editor.id ? "Account updated." : "Account created.",
    );
    if (success) { setEditor(null); await loadUsers(); }
  };

  const remove = async () => {
    if (!deleting) return;
    const success = await runAction(() => api.removeUser(deleting.id), "Account removed.");
    if (success) { setDeleting(null); await loadUsers(); }
  };

  return (
    <>
      <ScreenHeader eyebrow="Manage / Administration" title="Accounts" action={<PrimaryButton label="Add" onPress={() => setEditor({ kind: "account", values: { role: "USER" } })} compact />} />
      <SecondaryButton label="‹ Back to account" onPress={onBack} compact />
      <View style={styles.cardList}>
        {users.map((account) => <View key={account.id} style={styles.accountCard}><View><Text style={styles.manageName}>{account.username}</Text><Text style={styles.accountRole}>{account.role}</Text></View><View style={styles.manageActions}><Pressable onPress={() => setEditor({ kind: "account", id: account.id, values: { username: account.username, role: account.role } })}><Text style={styles.editText}>Edit</Text></Pressable><Pressable onPress={() => setDeleting(account)}><Text style={styles.deleteText}>Remove</Text></Pressable></View></View>)}
        {!users.length ? <EmptyState message="No accounts found." /> : null}
      </View>
      <RecordEditor key={editor ? `${editor.kind}-${editor.id ?? "new"}` : "closed"} record={editor} onClose={() => setEditor(null)} onSave={save} />
      <ConfirmDialog visible={!!deleting} title={deleting ? `Remove ${deleting.username}?` : "Remove account"} message="This action cannot be undone." onCancel={() => setDeleting(null)} onConfirm={remove} />
    </>
  );
}

function PasswordScreen({ api, runAction, onBack }: { api: InventoryApi; runAction: (action: () => Promise<unknown>, notice: string) => Promise<boolean>; onBack: () => void }) {
  const [form, setForm] = useState({ oldPassword: "", newPassword: "", confirmPassword: "" });
  const [saving, setSaving] = useState(false);
  const save = async () => {
    if (form.newPassword.length < 6) return;
    if (form.newPassword !== form.confirmPassword) return;
    setSaving(true);
    const success = await runAction(() => api.updatePassword({ oldPassword: form.oldPassword, newPassword: form.newPassword }), "Password updated.");
    if (success) setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
    setSaving(false);
  };
  return (
    <>
      <ScreenHeader eyebrow="Account / Security" title="Change password" />
      <SecondaryButton label="‹ Back to account" onPress={onBack} compact />
      <View style={[styles.formPanel, styles.passwordPanel]}>
        <Text style={styles.sectionCopy}>Choose a new password for your account.</Text>
        <Field label="Current password" value={form.oldPassword} onChangeText={(oldPassword) => setForm((current) => ({ ...current, oldPassword }))} secureTextEntry textContentType="password" autoCapitalize="none" />
        <Field label="New password" value={form.newPassword} onChangeText={(newPassword) => setForm((current) => ({ ...current, newPassword }))} secureTextEntry textContentType="newPassword" autoCapitalize="none" />
        <Field label="Confirm new password" value={form.confirmPassword} onChangeText={(confirmPassword) => setForm((current) => ({ ...current, confirmPassword }))} secureTextEntry textContentType="newPassword" autoCapitalize="none" />
        {form.confirmPassword && form.confirmPassword !== form.newPassword ? <Text style={styles.inlineError}>New passwords do not match.</Text> : null}
        <PrimaryButton label="Update password" onPress={save} loading={saving} disabled={!form.oldPassword || form.newPassword.length < 6 || form.newPassword !== form.confirmPassword} />
      </View>
    </>
  );
}

function RecordEditor({ record, onClose, onSave }: { record: EditorRecord; onClose: () => void; onSave: (values: Record<string, string>) => void }) {
  const [values, setValues] = useState<Record<string, string>>(
    () => record?.values || (record?.kind === "account" ? { role: "USER" } : {}),
  );
  const [saving, setSaving] = useState(false);
  if (!record) return null;
  const isAccount = record.kind === "account";
  const title = record.id ? "Update details" : record.kind === "account" ? "Create account" : "Add record";
  const submit = async () => {
    if (!isAccount && !values.name?.trim()) return;
    if (isAccount && (!values.username?.trim() || (!record.id && (!values.password || !values.confirmPassword || values.password !== values.confirmPassword)))) return;
    setSaving(true);
    await onSave(values);
    setSaving(false);
  };
  return (
    <ChoiceModal title={title} onClose={onClose}>
      {isAccount ? <>
        {!record.id ? <><Field label="Username" value={values.username || ""} onChangeText={(username) => setValues((current) => ({ ...current, username }))} autoCapitalize="none" /><Field label="Password" value={values.password || ""} onChangeText={(password) => setValues((current) => ({ ...current, password }))} secureTextEntry autoCapitalize="none" /><Field label="Confirm password" value={values.confirmPassword || ""} onChangeText={(confirmPassword) => setValues((current) => ({ ...current, confirmPassword }))} secureTextEntry autoCapitalize="none" /></> : null}
        <SegmentedControl options={[{ value: "USER", label: "User" }, { value: "ADMIN", label: "Admin" }]} value={(values.role || "USER") as UserRole} onChange={(role) => setValues((current) => ({ ...current, role }))} />
      </> : <>
        <Field label="Name" value={values.name || ""} onChangeText={(name) => setValues((current) => ({ ...current, name }))} />
        <Field label="Description" value={values.description || ""} onChangeText={(description) => setValues((current) => ({ ...current, description }))} multiline />
        {record.kind === "item" ? <Field label="Barcode" value={values.barcode || ""} onChangeText={(barcode) => setValues((current) => ({ ...current, barcode }))} autoCapitalize="none" /> : null}
      </>}
      {isAccount && !record.id && values.confirmPassword && values.confirmPassword !== values.password ? <Text style={styles.inlineError}>Passwords do not match.</Text> : null}
      <PrimaryButton label="Save changes" onPress={submit} loading={saving} />
    </ChoiceModal>
  );
}

function ChoiceModal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <Pressable style={styles.editorOverlay} onPress={onClose}>
        <Pressable style={styles.editorCard} onPress={() => undefined}>
          <View style={styles.editorHeader}><Text style={styles.editorTitle}>{title}</Text><Pressable onPress={onClose} hitSlop={12}><Text style={styles.editorClose}>×</Text></Pressable></View>
          <ScrollView contentContainerStyle={styles.editorContent} keyboardShouldPersistTaps="handled">{children}</ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function ConnectScreen({ initialUrl, onLogin, error }: { initialUrl: string; onLogin: (url: string, username: string, password: string) => Promise<void>; error?: string }) {
  const [step, setStep] = useState<"url" | "credentials">("url");
  const [form, setForm] = useState({ url: initialUrl, username: "", password: "" });
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState("");
  const continueToCredentials = () => {
    try { setForm((current) => ({ ...current, url: normalizeApiUrl(current.url) })); setLocalError(""); setStep("credentials"); } catch (caught) { setLocalError(errorMessage(caught)); }
  };
  const submit = async () => {
    if (step === "url") return continueToCredentials();
    setBusy(true); setLocalError("");
    try { await onLogin(form.url, form.username, form.password); } catch (caught) { setLocalError(errorMessage(caught)); setBusy(false); }
  };
  const displayedError = localError || error;
  return (
    <SafeAreaView style={styles.connectSafe} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" />
      <ScrollView contentContainerStyle={styles.connectScreen} keyboardShouldPersistTaps="handled">
        <View style={styles.connectPanel}>
          <View style={styles.connectBrand}><View style={styles.connectMark}><Text style={styles.connectMarkText}>N</Text></View><View><Text style={styles.connectBrandName}>Northstar</Text><Text style={styles.connectBrandTagline}>Inventory control</Text></View></View>
          <Text style={styles.connectEyebrow}>Connect your workspace</Text>
          <Text style={styles.connectTitle}>Inventory that moves with your team.</Text>
          <Text style={styles.connectCopy}>Connect to your self-hosted workspace, then inspect stock and record movements from anywhere.</Text>
          <View style={styles.steps}><Text style={[styles.step, step === "url" && styles.stepActive]}>01 API address</Text><View style={styles.stepLine} /><Text style={[styles.step, step === "credentials" && styles.stepActive]}>02 Sign in</Text></View>
          <View style={styles.connectForm}>
            {step === "url" ? <Field label="Backend API URL" value={form.url} onChangeText={(url) => setForm((current) => ({ ...current, url }))} placeholder="http://192.168.1.25:5001" autoCapitalize="none" /> : <><Field label="Username" value={form.username} onChangeText={(username) => setForm((current) => ({ ...current, username }))} autoCapitalize="none" textContentType="username" /><Field label="Password" value={form.password} onChangeText={(password) => setForm((current) => ({ ...current, password }))} secureTextEntry autoCapitalize="none" textContentType="password" /></>}
            {displayedError ? <Toast message={displayedError} type="error" /> : null}
            <PrimaryButton label={step === "url" ? "Continue to sign in" : "Connect & sign in"} onPress={submit} loading={busy} disabled={step === "credentials" && (!form.username || !form.password)} />
            {step === "credentials" ? <Pressable onPress={() => setStep("url")}><Text style={styles.changeUrl}>Change API address</Text></Pressable> : null}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default function Index() {
  const [booting, setBooting] = useState(true);
  const [apiUrl, setApiUrl] = useState(defaultApiUrl);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [data, setData] = useState<InventoryData>(emptyInventoryData);
  const [pending, setPending] = useState<PendingMove[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [refreshing, setRefreshing] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const clearSession = useCallback((message = "") => {
    void storage.clearSession();
    setToken(null); setUser(null); setData(emptyInventoryData); setActiveTab("overview"); setNotice(""); setError(message);
  }, []);
  const api = useMemo(() => new InventoryApi(apiUrl, () => token, () => clearSession("Your session has ended. Please sign in again.")), [apiUrl, clearSession, token]);

  const refreshInventory = useCallback(async () => {
    if (!token) return;
    setRefreshing(true);
    try {
      const [items, locations, stocks] = await Promise.all([api.items(), api.locations(), api.stocks()]);
      setData((current) => ({ ...current, items: items.data, locations: locations.data, stocks: stocks.data }));
      setError("");
    } catch (caught) {
      setError(errorMessage(caught));
    } finally {
      setRefreshing(false);
    }
  }, [api, token]);

  useEffect(() => {
    const bootstrap = async () => {
      const [session, storedMoves] = await Promise.all([storage.getSession(), storage.getPendingMoves()]);
      if (session.apiUrl) setApiUrl(session.apiUrl);
      if (session.token && session.user) { setToken(session.token); setUser(session.user); }
      if (storedMoves) setPending(storedMoves);
      setBooting(false);
    };
    void bootstrap();
  }, []);

  useEffect(() => {
    if (booting || !token || !user) return;
    const timer = setTimeout(() => { void refreshInventory(); }, 0);
    return () => clearTimeout(timer);
  }, [booting, refreshInventory, token, user]);
  useEffect(() => { if (!booting) void storage.savePendingMoves(pending); }, [booting, pending]);
  useEffect(() => { if (!notice) return; const timeout = setTimeout(() => setNotice(""), 3000); return () => clearTimeout(timeout); }, [notice]);

  const login = async (url: string, username: string, password: string) => {
    const endpoint = normalizeApiUrl(url);
    const loginApi = new InventoryApi(endpoint, () => null, () => undefined);
    const response = await loginApi.login(username, password);
    await storage.saveSession(endpoint, response.token, response.data);
    setApiUrl(endpoint); setToken(response.token); setUser(response.data); setError(""); setActiveTab("overview");
  };

  const signOut = async () => {
    try { if (token) await api.logout(); } catch { /* A local sign out is still valid when the server is unavailable. */ }
    clearSession();
  };

  const runAction = useCallback(async (action: () => Promise<unknown>, successMessage: string) => {
    try {
      await action();
      await refreshInventory();
      setError(""); setNotice(successMessage);
      return true;
    } catch (caught) {
      setError(errorMessage(caught));
      return false;
    }
  }, [refreshInventory]);

  const finalizeMoves = async () => {
    if (!pending.length) return false;
    const success = await runAction(() => api.moveStock(pending), "Stock movements finalized.");
    if (success) { setPending([]); await storage.clearPendingMoves(); }
    return success;
  };

  if (booting) return <LoadingScreen />;
  if (!token || !user) return <ConnectScreen initialUrl={apiUrl} onLogin={login} error={error} />;

  const screenProps = { refreshing, onRefresh: refreshInventory, error, notice };
  let screen: React.ReactNode;
  switch (activeTab) {
    case "stock": screen = <AppScreen {...screenProps}><StockScreen data={data} onMove={() => setActiveTab("move")} /></AppScreen>; break;
    case "move": screen = <AppScreen {...screenProps}><MoveScreen data={data} pending={pending} setPending={setPending} onFinalize={finalizeMoves} onError={setError} /></AppScreen>; break;
    case "manage": screen = <AppScreen {...screenProps}><ManageScreen data={data} api={api} runAction={runAction} /></AppScreen>; break;
    case "more": screen = <AppScreen {...screenProps}><MoreScreen user={user} api={api} data={data} setData={setData} runAction={runAction} onSignOut={signOut} /></AppScreen>; break;
    default: screen = <AppScreen {...screenProps}><OverviewScreen data={data} /></AppScreen>;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
      <StatusBar barStyle="light-content" />
      <AppHeader onSignOut={signOut} />
      <View style={styles.main}>{screen}</View>
      <BottomTabs active={activeTab} onChange={setActiveTab} isAdmin={user.role === "ADMIN"} />
    </SafeAreaView>
  );
}

function LoadingScreen() {
  return <SafeAreaView style={styles.loadingScreen}><StatusBar barStyle="light-content" /><View style={styles.loadingMark}><Text style={styles.loadingMarkText}>N</Text></View><ActivityIndicator color={colors.cyan} size="large" /><Text style={styles.loadingText}>Loading workspace...</Text></SafeAreaView>;
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.ink },
  main: { flex: 1, backgroundColor: colors.canvas },
  appHeader: { minHeight: 70, backgroundColor: colors.ink, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 18, gap: 12 },
  brandRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  brandMark: { width: 35, height: 35, backgroundColor: colors.cyan, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  brandMarkText: { color: colors.ink, fontSize: 20, fontWeight: "900" },
  brandName: { color: colors.ivory, fontSize: 17, fontWeight: "800" },
  brandTagline: { color: "#AAB6A9", fontSize: 11, marginTop: 1 },
  signOut: { minHeight: 38, justifyContent: "center", paddingHorizontal: 6 },
  signOutText: { color: colors.cyan, fontSize: 13, fontWeight: "800" },
  scroll: { flex: 1 },
  screenContent: { padding: 18, paddingBottom: 30, flexGrow: 1 },
  overviewIntro: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 16, marginBottom: 18 },
  overviewCopy: { color: colors.inkMuted, fontSize: 15, lineHeight: 21, flex: 1 },
  connectedPill: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 9, paddingVertical: 6, borderRadius: 99, backgroundColor: "#D9F9F5" },
  connectionDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "#118A76" },
  connectedText: { color: "#126B67", fontSize: 12, fontWeight: "800" },
  metricGrid: { gap: 11 },
  metricCard: { backgroundColor: colors.panel, borderRadius: 17, padding: 19, borderWidth: 1, borderColor: "#E4EEEE" },
  metricLabel: { color: colors.inkMuted, fontSize: 14, fontWeight: "700" },
  metricValue: { color: colors.ink, fontSize: 38, fontWeight: "800", letterSpacing: -1.2, marginTop: 8 },
  metricDetail: { color: colors.muted, fontSize: 13, marginTop: 4 },
  sectionCopy: { color: colors.inkMuted, fontSize: 15, lineHeight: 21, marginBottom: 16 },
  sortRow: { marginTop: 17, marginBottom: 10, gap: 8 },
  sortLabel: { color: colors.muted, fontSize: 12, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.8 },
  sortOptions: { flexDirection: "row", gap: 7 },
  sortChip: { borderRadius: 99, borderWidth: 1, borderColor: colors.line, backgroundColor: colors.panel, paddingHorizontal: 12, paddingVertical: 7 },
  sortChipActive: { borderColor: colors.ink, backgroundColor: colors.ink },
  sortChipText: { color: colors.inkMuted, fontSize: 13, fontWeight: "700", textTransform: "capitalize" },
  sortChipTextActive: { color: colors.ivory },
  cardList: { gap: 10, marginTop: 17 },
  stockCard: { backgroundColor: colors.panel, borderRadius: 17, padding: 16, borderWidth: 1, borderColor: "#E4EEEE", gap: 13 },
  stockTitleRow: { flexDirection: "row", gap: 14, justifyContent: "space-between" },
  stockTitle: { flex: 1 },
  stockName: { color: colors.ink, fontSize: 17, fontWeight: "800" },
  stockDescription: { color: colors.inkMuted, fontSize: 13, marginTop: 3 },
  quantityBadge: { minWidth: 70, alignItems: "flex-end" },
  quantityText: { color: colors.ink, fontSize: 21, fontWeight: "900" },
  quantityLabel: { color: colors.muted, fontSize: 11, fontWeight: "700", textTransform: "uppercase" },
  stockMeta: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  stockMetaText: { color: colors.muted, fontSize: 12 },
  formPanel: { backgroundColor: colors.panel, borderWidth: 1, borderColor: "#E4EEEE", borderRadius: 18, padding: 15, gap: 15 },
  pendingHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 25 },
  eyebrow: { color: colors.muted, fontSize: 11, letterSpacing: 1, fontWeight: "800", textTransform: "uppercase" },
  pendingCount: { color: colors.ink, fontSize: 18, fontWeight: "800", marginTop: 3 },
  pendingCard: { backgroundColor: colors.panel, borderRadius: 17, padding: 15, gap: 12, borderWidth: 1, borderColor: "#E4EEEE" },
  pendingTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 },
  pendingItem: { color: colors.ink, fontSize: 16, fontWeight: "800" },
  pendingType: { color: colors.cyanDeep, fontSize: 12, fontWeight: "800", marginTop: 2, textTransform: "capitalize" },
  removeText: { color: colors.danger, fontSize: 13, fontWeight: "800" },
  pendingRoute: { flexDirection: "row", alignItems: "center", gap: 6, borderTopWidth: 1, borderTopColor: "#EDF2F2", paddingTop: 11 },
  routeText: { color: colors.inkMuted, fontSize: 13, flexShrink: 1 },
  routeArrow: { color: colors.cyanDeep, fontSize: 18 },
  pendingQty: { color: colors.ink, fontSize: 16, fontWeight: "900", marginLeft: "auto" },
  finalizeButton: { marginTop: 18 },
  manageCard: { backgroundColor: colors.panel, borderRadius: 17, borderWidth: 1, borderColor: "#E4EEEE", padding: 16, flexDirection: "row", gap: 12, justifyContent: "space-between" },
  manageCopy: { flex: 1 },
  manageName: { color: colors.ink, fontSize: 16, fontWeight: "800" },
  manageDescription: { color: colors.inkMuted, fontSize: 13, lineHeight: 18, marginTop: 4 },
  manageBarcode: { color: colors.muted, fontSize: 12, marginTop: 7 },
  manageActions: { flexDirection: "row", alignItems: "flex-start", gap: 11 },
  textAction: { paddingVertical: 1 },
  editText: { color: "#087A91", fontSize: 13, fontWeight: "800" },
  deleteText: { color: colors.danger, fontSize: 13, fontWeight: "800" },
  profileCard: { backgroundColor: colors.ink, borderRadius: 18, padding: 18, flexDirection: "row", alignItems: "center", gap: 13 },
  avatar: { width: 46, height: 46, borderRadius: 23, alignItems: "center", justifyContent: "center", backgroundColor: colors.cyan },
  avatarText: { color: colors.ink, fontSize: 21, fontWeight: "900" },
  profileName: { color: colors.ivory, fontSize: 18, fontWeight: "800" },
  profileRole: { color: "#B9CBC5", fontSize: 13, marginTop: 3 },
  menuList: { marginTop: 17, gap: 9 },
  menuRow: { minHeight: 72, backgroundColor: colors.panel, borderRadius: 16, borderWidth: 1, borderColor: "#E4EEEE", paddingHorizontal: 15, flexDirection: "row", alignItems: "center", gap: 13 },
  menuIcon: { color: colors.ink, width: 22, fontSize: 19, textAlign: "center" },
  menuCopy: { flex: 1 },
  menuLabel: { color: colors.ink, fontSize: 16, fontWeight: "800" },
  menuDetail: { color: colors.muted, fontSize: 12, marginTop: 2 },
  menuArrow: { color: colors.muted, fontSize: 25 },
  accountCard: { backgroundColor: colors.panel, borderRadius: 16, borderWidth: 1, borderColor: "#E4EEEE", padding: 16, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  accountRole: { color: colors.cyanDeep, fontSize: 12, fontWeight: "800", marginTop: 4 },
  passwordPanel: { marginTop: 16 },
  inlineError: { color: colors.danger, fontSize: 13, fontWeight: "700" },
  editorOverlay: { position: "absolute", top: 0, right: 0, bottom: 0, left: 0, backgroundColor: "rgba(10, 23, 21, 0.48)", justifyContent: "flex-end", zIndex: 20 },
  editorCard: { maxHeight: "86%", backgroundColor: colors.canvas, borderTopLeftRadius: 24, borderTopRightRadius: 24, overflow: "hidden" },
  editorHeader: { paddingHorizontal: 20, paddingVertical: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: colors.line },
  editorTitle: { color: colors.ink, fontSize: 21, fontWeight: "800" },
  editorClose: { color: colors.inkMuted, fontSize: 29, lineHeight: 29 },
  editorContent: { padding: 18, gap: 14, paddingBottom: 34 },
  tabBar: { minHeight: 65, backgroundColor: colors.ink, flexDirection: "row", alignItems: "stretch", paddingHorizontal: 4, paddingTop: 6 },
  tab: { flex: 1, borderRadius: 12, alignItems: "center", justifyContent: "center", gap: 1, marginBottom: 6 },
  activeTab: { backgroundColor: "#28433E" },
  tabIcon: { color: "#AAB6A9", fontSize: 19, lineHeight: 20 },
  tabLabel: { color: "#AAB6A9", fontSize: 10, fontWeight: "700" },
  activeTabText: { color: colors.cyan },
  connectSafe: { flex: 1, backgroundColor: colors.ink },
  connectScreen: { flexGrow: 1, justifyContent: "center", padding: 20, backgroundColor: colors.ink },
  connectPanel: { backgroundColor: colors.ivory, borderRadius: 25, padding: 22 },
  connectBrand: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 34 },
  connectMark: { width: 38, height: 38, borderRadius: 11, alignItems: "center", justifyContent: "center", backgroundColor: colors.cyan },
  connectMarkText: { color: colors.ink, fontSize: 21, fontWeight: "900" },
  connectBrandName: { color: colors.ink, fontSize: 17, fontWeight: "800" },
  connectBrandTagline: { color: colors.muted, fontSize: 11, marginTop: 1 },
  connectEyebrow: { color: colors.muted, fontSize: 11, letterSpacing: 1, fontWeight: "800", textTransform: "uppercase" },
  connectTitle: { color: colors.ink, fontSize: 32, fontWeight: "900", letterSpacing: -1.1, lineHeight: 36, marginTop: 9 },
  connectCopy: { color: colors.inkMuted, fontSize: 15, lineHeight: 22, marginTop: 12 },
  steps: { flexDirection: "row", alignItems: "center", gap: 7, marginTop: 24 },
  step: { color: colors.muted, fontSize: 11, fontWeight: "800", textTransform: "uppercase" },
  stepActive: { color: colors.ink },
  stepLine: { flex: 1, height: 1, backgroundColor: "#C7D4D3" },
  connectForm: { gap: 15, marginTop: 23 },
  changeUrl: { color: "#087A91", textAlign: "center", fontSize: 14, fontWeight: "800", paddingVertical: 6 },
  loadingScreen: { flex: 1, backgroundColor: colors.ink, alignItems: "center", justifyContent: "center", gap: 17 },
  loadingMark: { width: 57, height: 57, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: colors.cyan, marginBottom: 8 },
  loadingMarkText: { color: colors.ink, fontSize: 32, fontWeight: "900" },
  loadingText: { color: colors.ivory, fontSize: 15, fontWeight: "700" },
  pressed: { opacity: 0.72 },
});
