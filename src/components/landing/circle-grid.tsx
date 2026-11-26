import { launchCircles } from "@/data/circles";
import { Card } from "@/components/ui/card";

/** Display grid of the 8 launch Circles (read-only, used on the landing page). */
export function CircleGrid() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {launchCircles.map((circle) => {
        const Icon = circle.icon;
        return (
          <Card
            key={circle.id}
            className="group flex flex-col gap-2 p-4 transition-shadow hover:shadow-md"
          >
            <span
              className="flex size-10 items-center justify-center rounded-lg"
              style={{
                backgroundColor: `${circle.accent}1f`,
                color: circle.accent,
              }}
            >
              <Icon className="size-5" aria-hidden />
            </span>
            <div>
              <p className="font-semibold leading-tight">{circle.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {circle.tagline}
              </p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
