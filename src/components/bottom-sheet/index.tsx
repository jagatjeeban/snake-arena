import React from 'react';

//import components
import BottomSheetHost from './host';

//import types
import type { BottomSheetProps } from './types';

/**
 * Displays a controlled native bottom sheet using the platform-specific host.
 */
const BottomSheet = ({
  children,
  isPresented,
  isDismissEnabled = true,
  onDidDismiss,
  onDismissRequest,
}: BottomSheetProps) => {
  return (
    <BottomSheetHost
      isDismissEnabled={isDismissEnabled}
      isPresented={isPresented}
      onDidDismiss={onDidDismiss}
      onDismissRequest={onDismissRequest}
    >
      {children}
    </BottomSheetHost>
  );
};

export default React.memo(BottomSheet);
