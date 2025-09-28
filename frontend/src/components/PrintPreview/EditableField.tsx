import React, { useState, useRef, useEffect } from 'react';
import { Box, TextField } from '@mui/material';
import { styled } from '@mui/material/styles';

const EditableText = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isEditing',
})<{ variant?: string; isEditing?: boolean }>(({ theme, variant, isEditing }) => ({
  display: 'inline-block',
  minWidth: '120px',
  minHeight: variant === 'h5' ? '32px' : variant === 'h6' ? '24px' : '20px',
  padding: theme.spacing(0.5, 1),
  borderRadius: theme.shape.borderRadius,
  border: isEditing ? `2px solid ${theme.palette.primary.main}` : '2px solid transparent',
  backgroundColor: isEditing ? theme.palette.background.paper : 'transparent',
  cursor: 'text',
  transition: 'all 0.2s ease-in-out',
  fontSize: variant === 'h5' ? '1.5rem' : variant === 'h6' ? '1.25rem' : '1rem',
  fontWeight: variant === 'h5' || variant === 'h6' ? 'bold' : 'normal',
  '&:hover': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:focus-within': {
    outline: 'none',
  }
}));

interface EditableFieldProps {
  value: string;
  onChange: (value: string) => void;
  variant?: 'h5' | 'h6' | 'body1' | 'body2';
  multiline?: boolean;
  placeholder?: string;
  disabled?: boolean;
}

const EditableField: React.FC<EditableFieldProps> = ({
  value,
  onChange,
  variant = 'body1',
  multiline = false,
  placeholder = 'クリックして編集',
  disabled = false
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleClick = () => {
    if (!disabled) {
      setIsEditing(true);
    }
  };

  const handleBlur = () => {
    setIsEditing(false);
    onChange(tempValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !multiline) {
      e.preventDefault();
      handleBlur();
    } else if (e.key === 'Escape') {
      setTempValue(value);
      setIsEditing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTempValue(e.target.value);
  };

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  if (isEditing) {
    return (
      <TextField
        ref={inputRef}
        value={tempValue}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        multiline={multiline}
        rows={multiline ? 3 : 1}
        variant="outlined"
        size="small"
        placeholder={placeholder}
        fullWidth
        sx={{
          '& .MuiOutlinedInput-root': {
            fontSize: variant === 'h5' ? '1.5rem' : variant === 'h6' ? '1.25rem' : '1rem',
            fontWeight: variant === 'h5' || variant === 'h6' ? 'bold' : 'normal',
          }
        }}
      />
    );
  }

  return (
    <EditableText
      variant={variant}
      isEditing={false}
      onClick={handleClick}
      title={disabled ? '' : 'クリックして編集'}
    >
      {value || placeholder}
    </EditableText>
  );
};

export default EditableField;