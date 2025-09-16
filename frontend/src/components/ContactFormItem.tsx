import React, { forwardRef } from 'react';
import { TextField, Paper, Grid, IconButton, FormControlLabel, Checkbox } from '@mui/material';
import { IMaskInput } from 'react-imask';
import DeleteIcon from '@mui/icons-material/Delete';
import { ClientContact } from '../services/clientService';

interface CustomProps {
  onChange: (event: { target: { name: string; value: string } }) => void;
  name: string;
}

const CelularMask = forwardRef<HTMLElement, CustomProps>(function CelularMask(props, ref) {
  const { onChange, ...other } = props;
  return (
    <IMaskInput
      {...other}
      mask="(00) 00000-0000"
      definitions={{
        '#': /[1-9]/,
      }}
      // @ts-ignore
      inputRef={ref}
      onAccept={(value: any) => onChange({ target: { name: props.name, value } })}
      overwrite
    />
  );
});

interface ContactFormItemProps {
  contact: ClientContact;
  index: number;
  isSaving: boolean;
  handleContactChange: (index: number, event: React.ChangeEvent<HTMLInputElement>) => void;
  removeContact: (index: number) => void;
}

const ContactFormItem: React.FC<ContactFormItemProps> = ({
  contact,
  index,
  isSaving,
  handleContactChange,
  removeContact,
}) => {
  return (
    <Paper sx={{ p: 2, mb: 2, position: 'relative' }}>
      <IconButton
        aria-label="delete"
        onClick={() => removeContact(index)}
        sx={{ position: 'absolute', top: 8, right: 8 }}
        disabled={isSaving}
      >
        <DeleteIcon />
      </IconButton>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Nome do Contato"
            name="name"
            value={contact.name}
            onChange={(e) => handleContactChange(index, e as React.ChangeEvent<HTMLInputElement>)}
            disabled={isSaving}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            required
            label="Email"
            name="email"
            type="email"
            value={contact.email}
            onChange={(e) => handleContactChange(index, e as React.ChangeEvent<HTMLInputElement>)}
            disabled={isSaving}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Celular"
            name="celular"
            value={contact.celular || ''}
            onChange={(e) => handleContactChange(index, e as React.ChangeEvent<HTMLInputElement>)}
            InputProps={{
              inputComponent: CelularMask as any,
            }}
            disabled={isSaving}
          />
        </Grid>
        <Grid item xs={12} sm={6} container alignItems="center">
          <FormControlLabel
            control={
              <Checkbox
                name="isWhatsapp"
                checked={contact.isWhatsapp}
                onChange={(e) => handleContactChange(index, e as React.ChangeEvent<HTMLInputElement>)}
                disabled={isSaving}
              />
            }
            label="É WhatsApp?"
          />
          <FormControlLabel
            control={
              <Checkbox
                name="allowAproveReport"
                checked={contact.allowAproveReport}
                onChange={(e) => handleContactChange(index, e as React.ChangeEvent<HTMLInputElement>)}
                disabled={isSaving}
              />
            }
            label="Aprova Relatórios?"
          />
        </Grid>
      </Grid>
    </Paper>
  );
};

export default React.memo(ContactFormItem);
