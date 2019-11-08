import React from 'react';

import { palettes } from '@stuff/piccy-shared';

import Modal from '../Modal';
import Palette from './Palette';

function PalettesModal({ isOpen, onCancel, onSelect, currentPalette }) {
  return (
    <Modal title="Palettes" isOpen={isOpen} onCancel={onCancel}>
      {Object.keys(palettes).map(palette => {
        const paletteObject = palettes[palette];
        const { colors, name, id } = paletteObject;
        return (
          <Palette
            key={id}
            selected={currentPalette ? id === currentPalette.id : false}
            name={name}
            onClick={e => {
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
