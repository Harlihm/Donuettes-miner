import { Button } from "./ui/Button";

interface NavigationProps {
  activeTab: "community" | "donettes";
  onTabChange: (tab: "community" | "donettes") => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <div className="flex gap-4 justify-center mb-8">
      <Button
        variant={activeTab === "community" ? "primary" : "secondary"}
        onClick={() => onTabChange("community")}
        className="w-full"
      >
        ⛏️ Donut Co-mining
      </Button>
      <Button
        variant={activeTab === "donettes" ? "primary" : "secondary"}
        onClick={() => onTabChange("donettes")}
        className="w-full"
      >
        ⛏️ Donettes Mining
      </Button>
    </div>
  );
}
