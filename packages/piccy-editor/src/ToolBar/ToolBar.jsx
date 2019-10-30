import React, { useRef } from 'react';
import { createUseStyles } from 'react-jss';

import {
  FaFillDrip,
  FaPencilAlt,
  FaEyeDropper,
  FaRedoAlt,
  FaUndoAlt,
  FaRegCopy
} from 'react-icons/fa';

import Palette from './Palette';
import PaletteSeparator from './PaletteSeparator';
import PaletteColorChoosen from './PaletteColorChoosen';
import PaletteToolItem from './PaletteToolItem';

const useStyles = createUseStyles({
  root: {
    display: 'block',
    width: 64,
    position: 'absolute',
    left: 'calc(50% - 64px - 16px - 768px/2)'
  },
  container: { display: 'inline-flex', flexWrap: 'wrap' },
  hidden: {
    position: ['absolute', '!important'],
    clip: 'rect(1px, 1px, 1px, 1px)',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
    whiteSpace: 'nowrap'
  }
});

function ToolBar({
  colors,
  currentColors,
  onSelectColor,
  onSwapColors,
  onChangeTool,
  currentColor,
  currentTool,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  imageUrl,
  onCopiedUrl
}) {
  const classes = useStyles();
  const textareaElement = useRef(null);

  const onCopyUrl = () => {
    textareaElement.current.select();
    document.execCommand('copy');
    onCopiedUrl();
  };

  return (
    <div className={classes.root}>
      <div className={classes.container}>
        <PaletteToolItem
          id="edit"
          tooltip="Draw"
          Icon={FaPencilAlt}
          onSelect={onChangeTool}
          selected={currentTool === 'edit'}
        />
        <PaletteToolItem
          id="fill"
          tooltip="Fill"
          Icon={FaFillDrip}
          onSelect={onChangeTool}
          selected={currentTool === 'fill'}
        />
        <PaletteToolItem
          id="pick"
          tooltip="Get color"
          Icon={FaEyeDropper}
          onSelect={onChangeTool}
          selected={currentTool === 'pick'}
        />
        <PaletteToolItem
          tooltip="Copy image url"
          id="copy-url"
          Icon={FaRegCopy}
          onSelect={onCopyUrl}
        />
        <textarea
          className={classes.hidden}
          ref={textareaElement}
          value={imageUrl}
          readOnly
        />
      </div>
      <PaletteSeparator />
      <PaletteToolItem
        id="undo"
        tooltip="undo"
        Icon={FaUndoAlt}
        disabled={!canUndo}
        onSelect={e => onUndo()}
      />
      <PaletteToolItem
        id="redo"
        tooltip="redo"
        Icon={FaRedoAlt}
        disabled={!canRedo}
        onSelect={e => onRedo()}
      />
      <PaletteSeparator />
      <Palette
        colors={colors}
        onSelectColor={onSelectColor}
        currentColor={currentColor}
      />
      <PaletteSeparator />
      <PaletteColorChoosen
        currentColors={currentColors}
        onSwapColors={onSwapColors}
      />
    </div>
  );
}

export default ToolBar;
