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

import ToolbarPalette from './ToolbarPalette';
import ToolbarSeparator from './ToolbarSeparator';
import ToolbarColorChoosen from './ToolbarColorChoosen';
import ToolbarItem from './ToolbarItem';
import ToolbarContainer from './ToolbarContainer';
import ToolbarPreview from './ToolbarPreview';

const useStyles = createUseStyles({
  root: {
    display: 'block',
    width: 64,
    position: 'absolute',
    left: 'calc(50% - 48px - 768px/2)'
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
  currentTool,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  imageUrl,
  onCopiedUrl,
  imageData,
  onOpenDialog
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
      <ToolbarContainer title="Tools">
        <div className={classes.container}>
          <ToolbarItem
            id="edit"
            tooltip="Draw"
            Icon={FaPencilAlt}
            onSelect={onChangeTool}
            selected={currentTool === 'edit'}
          />
          <ToolbarItem
            id="fill"
            tooltip="Fill"
            Icon={FaFillDrip}
            onSelect={onChangeTool}
            selected={currentTool === 'fill'}
          />
          <ToolbarItem
            id="pick"
            tooltip="Get color"
            Icon={FaEyeDropper}
            onSelect={onChangeTool}
            selected={currentTool === 'pick'}
          />
          <ToolbarItem
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
      </ToolbarContainer>

      <ToolbarContainer title="History">
        <ToolbarItem
          id="undo"
          tooltip="undo"
          Icon={FaUndoAlt}
          disabled={!canUndo}
          onSelect={e => onUndo()}
        />
        <ToolbarItem
          id="redo"
          tooltip="redo"
          Icon={FaRedoAlt}
          disabled={!canRedo}
          onSelect={e => onRedo()}
        />
      </ToolbarContainer>

      <ToolbarContainer title="Palette" onClick={onOpenDialog}>
        <ToolbarPalette colors={colors} onSelectColor={onSelectColor} />
      </ToolbarContainer>

      <ToolbarContainer>
        <ToolbarColorChoosen
          currentColors={currentColors}
          onSwapColors={onSwapColors}
        />
      </ToolbarContainer>

      <ToolbarContainer title="Preview">
        <ToolbarPreview scale={2} imageData={imageData} />
        <ToolbarSeparator />
        <ToolbarPreview scale={1} imageData={imageData} />
      </ToolbarContainer>
    </div>
  );
}

export default ToolBar;
