import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import {
  Bell,
  Package,
  CheckCircle2,
  ShoppingCart,
  ShoppingBag,
  MessageSquare,
  ChevronRight,
  CheckCheck,
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications, type Notification } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onNavigate?: (notification: Notification) => void;
}

function NotificationItem({ notification, onMarkAsRead, onNavigate }: NotificationItemProps) {
  const { icon: Icon, color } = useMemo(() => {
    const type = notification.type?.toLowerCase() || "";
    const entityType = notification.entity_type?.toLowerCase() || "";

    if (type.includes("reservation") || entityType === "reservation") {
      return {
        icon: Package,
        color: "text-primary",
        bgColor: "bg-primary/10",
      };
    }
    if (type.includes("confirmed") || type.includes("accept")) {
      return {
        icon: CheckCircle2,
        color: "text-success",
        bgColor: "bg-success/10",
      };
    }
    if (type.includes("cart") || entityType === "cart") {
      return {
        icon: ShoppingCart,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
      };
    }
    if (type.includes("order") || entityType === "order") {
      return {
        icon: ShoppingBag,
        color: "text-purple-500",
        bgColor: "bg-purple-500/10",
      };
    }
    if (type.includes("message")) {
      return {
        icon: MessageSquare,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
      };
    }
    return {
      icon: Bell,
      color: "text-muted-foreground",
      bgColor: "bg-muted/50",
    };
  }, [notification.type, notification.entity_type]);

  const timeAgo = useMemo(() => {
    try {
      return formatDistanceToNow(new Date(notification.created_at), { addSuffix: true });
    } catch {
      return "Just now";
    }
  }, [notification.created_at]);

  const handleClick = () => {
    if (!notification.read) {
      onMarkAsRead(notification.id);
    }
    if (onNavigate) {
      onNavigate(notification);
    }
  };

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative flex items-start gap-3 rounded-lg p-3 cursor-pointer transition-all duration-200",
        "hover:bg-muted/50 hover:border-primary/20",
        !notification.read && "bg-muted/30 border-l-2 border-primary"
      )}
    >
      {/* Unread Indicator */}
      {!notification.read && (
        <div className="absolute left-1 top-4 h-2 w-2 rounded-full bg-primary animate-pulse" />
      )}

      {/* Icon */}
      <div className={cn(
        "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
        color === "text-primary" && "bg-primary/10",
        color === "text-success" && "bg-success/10",
        color === "text-blue-500" && "bg-blue-500/10",
        color === "text-purple-500" && "bg-purple-500/10",
        color === "text-muted-foreground" && "bg-muted/50"
      )}>
        <Icon className={cn("h-5 w-5", color)} />
      </div>

      {/* Content */}
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("text-sm font-semibold leading-none", !notification.read && "text-foreground", notification.read && "text-muted-foreground")}>
            {notification.title}
          </p>
        </div>
        {notification.message && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {notification.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground/70">{timeAgo}</p>
      </div>

      {/* Chevron */}
      <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
    </div>
  );
}

export function NotificationDropdown() {
  const navigate = useNavigate();
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead } = useNotifications();

  const recentNotifications = useMemo(() => {
    return notifications.slice(0, 10);
  }, [notifications]);

  const handleNotificationClick = (notification: Notification) => {
    const entityType = notification.entity_type?.toLowerCase();
    const entityId = notification.entity_id;

    if (entityType === "reservation" || notification.type?.toLowerCase().includes("reservation")) {
      navigate("/reservations");
    } else if (entityType === "cart" || notification.type?.toLowerCase().includes("cart")) {
      navigate("/cart");
    } else if (entityType === "listing" && entityId) {
      navigate(`/product/${entityId}`);
    } else {
      // Default: navigate to activity feed
      navigate("/my-activity");
    }
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-foreground hover:bg-muted">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -right-1 -top-1 h-5 w-5 p-0 flex items-center justify-center bg-primary text-primary-foreground">
              {unreadCount > 99 ? "99+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0" align="end" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm">Notifications</h3>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleMarkAllAsRead();
              }}
              className="h-7 text-xs text-muted-foreground hover:text-foreground"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="max-h-[500px]">
          <div className="p-2">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-muted-foreground">Loading notifications...</div>
              </div>
            ) : recentNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-4 mb-4">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">All caught up!</p>
                <p className="text-xs text-muted-foreground">No new notifications</p>
              </div>
            ) : (
              <div className="space-y-1">
                {recentNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onNavigate={handleNotificationClick}
                  />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer - Optional: View All */}
        {recentNotifications.length > 0 && notifications.length > 10 && (
          <>
            <Separator />
            <div className="p-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={() => {
                  navigate("/my-activity");
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>
  );
}

