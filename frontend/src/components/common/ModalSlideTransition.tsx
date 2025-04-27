import React from 'react';
import { Slide, SlideProps } from '@mui/material';
import './ModalSlideTransition.css';

// direction: 'up' | 'down' | 'left' | 'right'
const ModalSlideTransition = React.forwardRef(function ModalSlideTransition(
  props: SlideProps & { direction?: 'up' | 'down' | 'left' | 'right' },
  ref: React.Ref<unknown>
) {
  // Default direction is 'up'
  return (
    <Slide
      ref={ref}
      direction={props.direction || 'up'}
      {...props}
      timeout={{ enter: 400, exit: 350 }} // slightly slower for smoothness
      // Add a className for custom easing
      className={['modal-slide-ease', props.className].filter(Boolean).join(' ')}
    />
  );
});

export default ModalSlideTransition;
