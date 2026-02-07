import { Button } from "@/components/ui/button";
import { Minus, Plus } from "lucide-react";

interface QuantityControlProps {
  quantity: number;
  minQuantity?: number;
  maxQuantity?: number;
  available?: number;
  onIncrease: () => void;
  onDecrease: () => void;
  disabled?: boolean;
}

export function QuantityControl({
  quantity,
  minQuantity = 1,
  maxQuantity,
  available,
  onIncrease,
  onDecrease,
  disabled = false,
}: QuantityControlProps) {
  const canIncrease = !maxQuantity || quantity < maxQuantity;
  const canDecrease = quantity > minQuantity;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={onDecrease}
          disabled={!canDecrease || disabled}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-12 text-center font-medium">{quantity}</span>
        <Button
          size="sm"
          variant="outline"
          className="h-8 w-8 p-0"
          onClick={onIncrease}
          disabled={!canIncrease || disabled}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
      {available !== undefined && (
        <span className="text-xs text-muted-foreground text-center">
          Available: {available}
        </span>
      )}
    </div>
  );
}
