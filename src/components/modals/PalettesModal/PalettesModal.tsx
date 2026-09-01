import React from 'react';

import * as palettes from '@/palettes';

import Modal from '../Modal';
import PaletteComponent from './Palette';

import { Palette } from '@/types';

interface Props {
  isOpen: boolean;
  onCancel: () => void;
  onSelect: (paletteObject: Palette) => void;
  currentPalette: Palette;
}

function PalettesModal({ isOpen, onCancel, onSelect, currentPalette }: Props) {
  const allPalettes = palettes as Record<string, Palette>;

  return (
    <Modal title="Palettes" isOpen={isOpen} onCancel={onCancel}>
      {Object.keys(allPalettes).map((palette) => {
        const paletteObject = allPalettes[palette];
        const { colors, name, id } = paletteObject;
        return (
          <PaletteComponent
            key={id}
            selected={currentPalette ? id === currentPalette.id : false}
            name={name}
            onClick={() => {
              onSelect(paletteObject);
            }}
            colors={colors}
          />
        );
      })}
    </Modal>
  );
}

export default PalettesModal;
