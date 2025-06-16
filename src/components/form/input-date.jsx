'use client'

import moment from "moment";
import { Button } from "../ui/button";
import { FormControl } from "../ui/form";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { cn } from "@/lib/utils";
import { vi } from "react-day-picker/locale"
import { useState } from "react";

export default function InputDate({ field, defaultOpen = false, disabled = () => false, className = '', format = "DD/MM/YYYY", mode = "single", hideOnSelected = true }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <Popover open={open} onOpenChange={(o) => setOpen(o)}>
      <PopoverTrigger asChild>
        <FormControl>
          <Button variant="outline"
            className={cn(
              "w-full pl-3 text-left font-normal",
              !field.value && "text-muted-foreground",
              className
            )}
          >
            {field.value
              ? moment(field.value).format(format)
              : <span>Chọn ngày</span>
            }
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </FormControl>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode={mode}
          selected={field.value}
          onSelect={(...args) => {
            field.onChange(...args);
            if (hideOnSelected) {
              setOpen(false);
            }
          }}
          disabled={disabled}
          initialFocus
          locale={vi}
        />
      </PopoverContent>
    </Popover>
  )
}