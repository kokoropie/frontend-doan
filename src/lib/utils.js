import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { z } from "zod";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function rtrim(str, char) {
  let regex = new RegExp(`${char}+$`);
  return str.replace(regex, "");
}

export function ltrim(str, char) {
  let regex = new RegExp(`^${char}+`);
  return str.replace(regex, "");
}

export function ucfirst(str, lower = false) {
  let s1 = str.charAt(0).toUpperCase();
  let s2 = str.slice(1);
  if (lower) {
    s2 = s2.toLowerCase();
  }
  return `${s1}${s2}`
}

export function intialName(name) {
  if (!name) return "";
  const names = name.split(" ");
  if (names.length > 1) {
    return names[0][0] + names[names.length - 1][0];
  } else {
    return names[0][0];
  }
}

export function numberFormat(number, decimals = 0, decPoint = ".", thousandsSep = ",") {
  number = parseFloat(number).toFixed(decimals);
  let parts = number.split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousandsSep);
  return parts.join(decPoint);
}

export function semesterSort(a, b) {
  if (a.name < b.name) return -1;
  if (a.name > b.name) return 1;

  return 0;
}

export function userSort(a, b) {
  if (a.first_name < b.first_name) return -1;
  if (a.first_name > b.first_name) return 1;

  if (a.last_name < b.last_name) return -1;
  if (a.last_name > b.last_name) return 1;

  return 0;
}

export function zArrayValues() {
  return [
    z.null(),
    z.number(),
    z.string(),
  ]
}