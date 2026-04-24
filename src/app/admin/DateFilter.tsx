"use client";

import { useRouter } from "next/navigation";

interface Props {
  selectedDate: string;
  maxDate: string;
}

export default function DateFilter({ selectedDate, maxDate }: Props) {
  const router = useRouter();

  return (
    <input
      type="date"
      name="date"
      defaultValue={selectedDate}
      max={maxDate}
      className="px-3 py-2 rounded-xl border border-slate-300 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-200 outline-none"
      onChange={(e) => {
        if (e.target.value) router.push(`/admin?date=${e.target.value}`);
      }}
    />
  );
}
