import { Toaster as Sonner, toast } from "sonner";

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-dark-lighter group-[.toaster]:text-light group-[.toaster]:border-gold/30 group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-gray-400",
          actionButton: "group-[.toast]:bg-gold group-[.toast]:text-dark",
          cancelButton: "group-[.toast]:bg-wine group-[.toast]:text-light",
        },
      }}
      {...props}
    />
  );
};

export { Toaster, toast };
