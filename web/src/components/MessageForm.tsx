import { type FormEvent } from "react";
import {
  Autocomplete, Button, Checkbox, Chip, TextField, ToggleButton, ToggleButtonGroup,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import ScheduleIcon from "@mui/icons-material/Schedule";
import { useForm } from "../hooks/useForm";
import { fromDateTimeLocal, toDateTimeLocal } from "../lib/date";
import { formatPhone } from "../lib/phone";
import { validateMessage, type MessageInput } from "../lib/validation";
import type { Contact } from "../types";

type Props = {
  contacts: Contact[];
  initial: MessageInput;
  pending?: boolean;
  allowScheduling?: boolean;
  submitLabel?: string;
  onSubmit: (values: MessageInput) => Promise<boolean> | void;
  onCancel?: () => void;
  resetOnSuccess?: boolean;
};

export const MessageForm = ({
  contacts, initial, pending, allowScheduling = true, submitLabel, onSubmit, onCancel, resetOnSuccess,
}: Props) => {
  const { values, errors, setField, reset, validated } = useForm<MessageInput>(initial, validateMessage);
  const selected = contacts.filter((c) => values.contactIds.includes(c.id));
  const allSelected = contacts.length > 0 && selected.length === contacts.length;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const valid = validated();
    if (!valid) return;
    const ok = await onSubmit(valid);
    if (ok && resetOnSuccess) reset(initial);
  };

  const label = submitLabel ?? (values.mode === "now" ? "Enviar agora" : "Agendar envio");

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <Autocomplete
          multiple
          disableCloseOnSelect
          options={contacts}
          value={selected}
          onChange={(_, value) => setField("contactIds", value.map((c) => c.id))}
          getOptionLabel={(c) => c.name}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          noOptionsText="Nenhum contato"
          renderOption={({ key, ...props }, option, { selected: checked }) => (
            <li key={key} {...props}>
              <Checkbox size="small" checked={checked} className="mr-2" />
              <div className="flex flex-col">
                <span>{option.name}</span>
                <span className="text-xs text-slate-500">{formatPhone(option.phone)}</span>
              </div>
            </li>
          )}
          renderTags={(value, getTagProps) =>
            value.map((option, index) => {
              const { key, ...tagProps } = getTagProps({ index });
              return <Chip key={key} size="small" label={option.name} {...tagProps} />;
            })
          }
          renderInput={(params) => (
            <TextField
              {...params}
              label="Destinatários"
              placeholder={selected.length ? "" : "Selecione os contatos"}
              error={Boolean(errors.contactIds)}
              helperText={errors.contactIds}
            />
          )}
        />
        {contacts.length > 0 && (
          <div>
            <Button
              size="small"
              onClick={() => setField("contactIds", allSelected ? [] : contacts.map((c) => c.id))}
            >
              {allSelected ? "Limpar seleção" : `Selecionar todos (${contacts.length})`}
            </Button>
          </div>
        )}
      </div>

      <TextField
        label="Mensagem"
        multiline
        minRows={3}
        maxRows={10}
        value={values.body}
        onChange={(e) => setField("body", e.target.value)}
        error={Boolean(errors.body)}
        helperText={errors.body ?? `${values.body.length}/2000`}
      />

      {allowScheduling && (
        <div className="flex flex-wrap items-start gap-3">
          <ToggleButtonGroup
            exclusive
            size="small"
            color="primary"
            value={values.mode}
            onChange={(_, mode: MessageInput["mode"] | null) => mode && setField("mode", mode)}
          >
            <ToggleButton value="now"><SendIcon fontSize="small" className="mr-1" />Agora</ToggleButton>
            <ToggleButton value="schedule"><ScheduleIcon fontSize="small" className="mr-1" />Agendar</ToggleButton>
          </ToggleButtonGroup>
          {values.mode === "schedule" && (
            <TextField
              type="datetime-local"
              label="Data e horário"
              className="max-w-[240px]"
              value={values.scheduledAt ? toDateTimeLocal(values.scheduledAt) : ""}
              onChange={(e) => setField("scheduledAt", fromDateTimeLocal(e.target.value))}
              error={Boolean(errors.scheduledAt)}
              helperText={errors.scheduledAt}
              slotProps={{
                inputLabel: { shrink: true },
                htmlInput: { min: toDateTimeLocal(new Date()) },
              }}
            />
          )}
        </div>
      )}

      <div className="flex justify-end gap-2">
        {onCancel && <Button onClick={onCancel}>Cancelar</Button>}
        <Button
          type="submit"
          variant="contained"
          disabled={pending}
          startIcon={values.mode === "now" ? <SendIcon /> : <ScheduleIcon />}
        >
          {label}
        </Button>
      </div>
    </form>
  );
};
