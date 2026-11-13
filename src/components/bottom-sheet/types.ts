import type { ReactNode } from 'react';

type BottomSheetSharedProps = {
  children: ReactNode;
  isPresented: boolean;
  onDidDismiss: () => void;
  onDismissRequest: () => void;
};

export type BottomSheetHostProps = BottomSheetSharedProps & {
  isDismissEnabled: boolean;
};

export type BottomSheetProps = BottomSheetSharedProps & {
  isDismissEnabled?: boolean;
};
