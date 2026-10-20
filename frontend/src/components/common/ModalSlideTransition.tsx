import React from 'react';
import { Fade } from '@mui/material';
import type { FadeProps } from '@mui/material';

// Shared dialog transition: a quick fade. Dialog panels add a small rise
// (see MuiDialog in theme/index.ts), so opening feels light rather than heavy.
const ModalSlideTransition = React.forwardRef(function ModalSlideTransition(
  props: FadeProps & { direction?: 'up' | 'down' | 'left' | 'right' },
  ref: React.Ref<unknown>
) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { direction, ...rest } = props;
  return <Fade ref={ref} {...rest} timeout={{ enter: 240, exit: 180 }} />;
});

export default ModalSlideTransition;
