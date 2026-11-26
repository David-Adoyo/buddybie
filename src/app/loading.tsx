import { BuddyLoader } from "@/components/buddy-loader";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-1 items-center justify-center" aria-busy="true">
      <BuddyLoader size={96} />
    </div>
  );
}
