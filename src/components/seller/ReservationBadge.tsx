import { Badge } from "@/components/ui/badge";
import { useReservationCount } from "@/hooks/useReservations";
import { useNavigate } from "react-router-dom";

interface ReservationBadgeProps {
  listingId: string;
  onClick?: () => void;
}

export function ReservationBadge({ listingId, onClick }: ReservationBadgeProps) {
  const { data: count = 0 } = useReservationCount(listingId);
  const navigate = useNavigate();

  if (count === 0) return null;

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate("/reservations");
    }
  };

  return (
    <Badge
      className="bg-primary/20 text-primary border-primary/30 cursor-pointer hover:bg-primary/30 transition-colors"
      onClick={handleClick}
      title="Click to view reservations"
    >
      Reserved ({count})
    </Badge>
  );
}

