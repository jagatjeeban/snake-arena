import { BottomSheet, BottomSheetView, type BottomSheetMethods } from '@expo/ui/community/bottom-sheet';
import { useEffect, useRef } from 'react';
import { StyleSheet } from 'react-native';

//import constants
import { colors } from '@/constants';

//import types
import type { BottomSheetHostProps } from '@/types/components';

/**
 * Hosts sheet content in the platform community bottom sheet.
 */
const BottomSheetHost = ({ children, isDismissEnabled, isPresented, onDidDismiss }: BottomSheetHostProps) => {
  //refs
  const sheetRef = useRef<BottomSheetMethods>(null);

  //keeps the sheet mounted while its native dismissal animation completes
  useEffect(() => {
    if (isPresented) {
      sheetRef.current?.present();
      return;
    }

    sheetRef.current?.dismiss();
  }, [isPresented]);

  return (
    <BottomSheet
      ref={sheetRef}
      backgroundStyle={styles.sheetBackground}
      enableDynamicSizing
      enablePanDownToClose={isDismissEnabled}
      index={-1}
      onDismiss={onDidDismiss}
    >
      <BottomSheetView>{children}</BottomSheetView>
    </BottomSheet>
  );
};

export default BottomSheetHost;

const styles = StyleSheet.create({
  sheetBackground: {
    backgroundColor: colors.background,
  },
});
