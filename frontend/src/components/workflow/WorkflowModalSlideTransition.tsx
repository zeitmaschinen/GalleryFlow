import React from 'react';
import { Slide, SlideProps } from '@mui/material';
import '../common/ModalSlideTransition.css';

// Slide from bottom to center
const WorkflowModalSlideTransition = React.forwardRef(function WorkflowModalSlideTransition(
  props: SlideProps,
  ref: React.Ref<unknown>
) {
  return (
    <Slide
      ref={ref}
      direction="up"
      {...props}
      timeout={{ enter: 400, exit: 350 }}
      className={['modal-slide-ease', props.className].filter(Boolean).join(' ')}
    />
  );
});

export default WorkflowModalSlideTransition;
