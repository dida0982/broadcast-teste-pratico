import { useEffect, type FormEvent } from "react";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useForm } from "../hooks/useForm";
import { validateContact, type ContactInput } from "../lib/validation";

type Props = {
  open: boolean;
  initial?: ContactInput;
  pending?: boolean;
  onSubmit: (values: ContactInput) => void;
  onClose: () => void;
};

const empty: ContactInput = { name: "", phone: "" };

export const ContactFormDialog = ({ open, initial, pending, onSubmit, onClose }: Props) => {
  const { values, errors, setField, reset, validated } = useForm<ContactInput>(empty, validateContact);

  useEffect(() => {
    if (open) reset(initial ?? empty);
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
        <DialogTitle>{initial ? "Editar contato" : "Novo contato"}</DialogTitle>
        <DialogContent className="flex flex-col gap-3 !pt-2">
          <TextField
            autoFocus
            label="Nome"
            value={values.name}
            onChange={(e) => setField("name", e.target.value)}
            error={Boolean(errors.name)}
            helperText={errors.name}
          />
          <TextField
            label="Telefone"
            placeholder="5561999999999"
            inputMode="tel"
            value={values.phone}
            onChange={(e) => setField("phone", e.target.value)}
            error={Boolean(errors.phone)}
            helperText={errors.phone ?? "DDI + DDD + número"}
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
