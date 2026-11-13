import { Host } from '@expo/ui';
import { BottomSheet, Group, RNHostView } from '@expo/ui/swift-ui';
import { interactiveDismissDisabled, presentationDragIndicator } from '@expo/ui/swift-ui/modifiers';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

//import constants
import { colors } from '@/constants';

//import types
import type { BottomSheetHostProps } from './types';

/**
 * Hosts sheet content in SwiftUI with a true dismissal-completion callback.
 */
const BottomSheetHost = ({
  children,
  isDismissEnabled,
  isPresented,
  onDidDismiss,
  onDismissRequest,
}: BottomSheetHostProps) => {
  const { width } = useWindowDimensions();

  //synchronizes interactive native dismissals with React state
  const handlePresentedChange = (presented: boolean) => {
    if (!presented) {
      onDismissRequest();
    }
  };

  return (
    <Host pointerEvents={'none'} style={[styles.host, { width }]}>
      <BottomSheet
        fitToContents
        isPresented={isPresented}
        onDismiss={onDidDismiss}
        onIsPresentedChange={handlePresentedChange}
      >
        <Group modifiers={[presentationDragIndicator('hidden'), interactiveDismissDisabled(!isDismissEnabled)]}>
          <RNHostView matchContents>
            <View style={styles.contentContainer}>
              <View style={styles.dragIndicator} />
              {children}
            </View>
          </RNHostView>
        </Group>
      </BottomSheet>
    </Host>
  );
};

export default BottomSheetHost;

const styles = StyleSheet.create({
  host: {
    position: 'absolute',
  },
  contentContainer: {
    alignItems: 'center',
    paddingTop: 5,
  },
  dragIndicator: {
    width: 32,
    height: 5,
    marginBottom: 6,
    borderRadius: 3,
    backgroundColor: colors.baseMediumGrey,
  },
});
