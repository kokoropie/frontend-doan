'use client'

import { useEffect, useMemo, useState } from "react"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Button } from "../ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "../ui/command"
import { CommandList } from "cmdk"
import { Check, ChevronsUpDown } from "lucide-react"
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils"

export default function Selector({
  options = [], 
  defaultValue = null, 
  valueObject = true, 
  index = 'id', 
  label = 'name', 
  onChange = () => {}, 
  className = '', 
  placeholder = 'Chọn...', 
  searchText = 'Tìm kiếm...',
  emptyDataText = 'Không có dữ liệu.',
  disabled = false, 
  searchable = true, 
  fnFilter = undefined, 
  closeOnSelected = true, 
  variant = 'outline',
  align = 'start',
  side = 'bottom',
  unselectable = true,
  multiple = false,
  ...props
}) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState(multiple ? [] : null)
  const [init, setInit] = useState(true)

  const selectedOptions = useMemo(() => {
    if (multiple) {
      return options.filter(item => value.includes(`${item[index]}`))
    }
    return options.find(item => item[index] == value)
  }, [value, options, valueObject, index, multiple])

  const handleSetValue = (sValue) => {
    if (multiple) {
      setValue(prev => {
        const exists = prev.includes(sValue)
        if (exists) {
          return unselectable ? prev.filter(v => v !== sValue) : prev
        } else {
          return [...prev, sValue]
        }
      })
    } else {
      if (sValue == value && unselectable) {
        setValue(null)
      } else {
        setValue(sValue)
      }
    }
  
    if (closeOnSelected) {
      setOpen(false)
    }
  }

  const isSelected = (sValue) => {
    return multiple ? value.includes(`${sValue}`) : sValue == value
  }

  useEffect(() => {
    if (init) {
      setInit(false)
    }
    if (defaultValue) {
      if (multiple) {
        if (valueObject) {
          const ids = defaultValue.map(v => options.find(item => item[index] == v?.[index])?.[index])
          setValue(ids.filter(Boolean))
        } else {
          const ids = defaultValue.map(v => options.find(item => item[index] == v)?.[index])
          setValue(ids.filter(Boolean))
        }
      } else {
        if (valueObject) {
          setValue(options.find(item => item[index] == defaultValue?.[index])?.[index])
        } else {
          setValue(options.find(item => item[index] == defaultValue)?.[index])
        }
      }
    }
  }, [defaultValue])

  useEffect(() => {
    if (init) return

    if (valueObject) {
      if (multiple) {
        onChange(selectedOptions)
      } else {
        onChange(selectedOptions || null)
      }
    } else {
      onChange(value)
    }
  }, [value])

  const showLabel = (item) => {
    if ((typeof(label)) == 'string') {
      return item[label]
    }
    return label(item)
  }
 
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={variant}
          role="combobox"
          aria-expanded={open}
          className={cn("justify-between", className, disabled && "cursor-not-allowed")}
          disabled={disabled}
        >
          {multiple ? (
            selectedOptions.length > 0
              ? selectedOptions.map(item => showLabel(item)).join(', ')
              : placeholder
          ) : (
            selectedOptions ? showLabel(selectedOptions) : placeholder
          )}
          <ChevronsUpDown className="opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align} side={side}>
        <ScrollArea className="max-h-96">
          <Command>
            {searchable && <CommandInput placeholder={searchText} className="h-9" />}
            <CommandList>
              <CommandEmpty>{emptyDataText}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option[index]}
                    value={`${option[index]}`}
                    onSelect={handleSetValue}
                  >
                    {showLabel(option)}
                    <Check
                      className={cn(
                        "ml-auto",
                        isSelected(option[index]) ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}