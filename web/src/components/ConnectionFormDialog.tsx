import { useEffect, type FormEvent } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useForm } from "../hooks/useForm";
import { validateConnection, type ConnectionInput } from "../lib/validation";

type Props = {
  open: boolean;
  initial?: ConnectionInput;
  pending?: boolean;
  onSubmit: (values: ConnectionInput) => void;
  onClose: () => void;
};

export const ConnectionFormDialog = ({ open, initial, pending, onSubmit, onClose }: Props) => {
  const { values, errors, setField, reset, validated } = useForm<ConnectionInput>(
    { name: "" },
    validateConnection,
  );

  useEffect(() => {
    if (open) reset(initial ?? { name: "" });
    // Reinicia apenas ao abrir, para não perder o que está sendo digitado.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const valid = validated();
    if (valid) onSubmit(valid);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <form onSubmit={handleSubmit} noValidate>
        <DialogTitle>{initial ? "Editar conexão" : "Nova conexão"}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Nome da conexão"
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            error={Boolean(errors.name)}
            helperText={errors.name}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={pending}>Salvar</Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};
