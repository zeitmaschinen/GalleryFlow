import { Box, styled } from '@mui/material';

const Container = styled(Box)(({ theme }) => ({
  width: '280px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRight: `1px solid ${theme.palette.divider}`,
  padding: 0,
  backgroundColor: theme.palette.background.paper,
  overflow: 'hidden',
  position: 'relative'
}));

export default Container;
