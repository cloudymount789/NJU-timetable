import React from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useAppTheme } from "@/theme/ThemeContext";
import { CapsuleButton } from "./CapsuleButton";

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog(props: ConfirmDialogProps): React.JSX.Element {
  const { tokens } = useAppTheme();

  return (
    <Modal animationType="fade" transparent visible={props.visible}>
      <View style={styles.backdrop}>
        <View style={[styles.card, { backgroundColor: tokens.surface, borderColor: tokens.border }]}>
          <Text style={[styles.title, { color: tokens.text }]}>{props.title}</Text>
          <Text style={[styles.message, { color: tokens.textSecondary }]}>{props.message}</Text>
          <View style={styles.actions}>
            <CapsuleButton label={props.cancelLabel ?? "取消"} onPress={props.onCancel} variant="secondary" />
            <Pressable
              onPress={props.onConfirm}
              style={[
                styles.confirm,
                { backgroundColor: props.destructive ? tokens.danger : tokens.accent },
              ]}
            >
              <Text style={styles.confirmLabel}>{props.confirmLabel ?? "确认"}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(15,20,25,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  card: {
    width: "100%",
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  title: {
    fontSize: 17,
    fontWeight: "700",
  },
  message: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 6,
  },
  confirm: {
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  confirmLabel: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
  },
});
