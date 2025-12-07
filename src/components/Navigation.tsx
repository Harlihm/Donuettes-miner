import { Button } from "./ui/Button";

interface NavigationProps {
  activeTab: "donettes" | "donettes-comining";
  onTabChange: (tab: "donettes" | "donettes-comining") => void;
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <div className="flex gap-2 justify-center mb-8 flex-wrap">
      <Button
        variant={activeTab === "donettes-comining" ? "primary" : "secondary"}
        onClick={() => onTabChange("donettes-comining")}
        className="flex-1 min-w-[100px]"
      >
        ⛏️ Donuettes Co-mining
      </Button>
      <Button
        variant={activeTab === "donettes" ? "primary" : "secondary"}
        onClick={() => onTabChange("donettes")}
        className="flex-1 min-w-[100px]"
        style={{ display: "none" }}
      >
        ⛏️ Donettes Mining
      </Button>
    </div>
  );
}
