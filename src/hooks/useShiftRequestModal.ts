import { useState } from 'react';
import { Shift } from '../types/Shift';

export type ModalView =
  | 'details'
  | 'give'
  | 'swap'
  | 'success'
  | 'error';

export const useShiftRequestModal = (
  onCloseRemark?: () => void
) => {
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [chosenShift, setChosenShift] = useState<Shift | null>(null);
  const [isMyShift, setIsMyShift] = useState(false);
  const [modalView, setModalView] = useState<ModalView>('details');

  const openSwap = () => {
    setModalView('swap');
  };

  const openGive = () => {
    setModalView('give');
  };

  const close = () => {
    setModalView('details');
    onCloseRemark?.();
    setChosenShift(null);
  };

  const openDetails = () => {
    setModalView('details');
  };

  return {
    // state
    currentShift,
    chosenShift,
    isMyShift,
    modalView,

    // setters (controlled)
    setCurrentShift,
    setChosenShift,
    setIsMyShift,

    // actions
    openSwap,
    openGive,
    close,
    openDetails,
    setModalView,
  };
};
